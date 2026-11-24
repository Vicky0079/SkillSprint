const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateFeedback } = require('../services/aiService');
const { gradeLocally } = require('../services/localGrader');
const { getProgress, PASS_SCORE } = require('../services/progress');
const { rewardInviterIfAny } = require('../services/premium');

// Submission.status values:
//   PENDING       -> waiting for Gemini (the student can still skip)
//   REVIEWED      -> graded by Gemini (final)
//   LOCAL_GRADED  -> student skipped; graded by the instant test-case grader (provisional)
//   AI_FAILED     -> Gemini failed permanently / stayed down too long (student can use instant grader)
const VALID_LANGUAGES = ['python', 'javascript'];
const normalizeLanguage = (l) => (VALID_LANGUAGES.includes(l) ? l : 'python');

const withXp = (submission, challenge) => ({
  ...submission,
  xpEarned: submission.score == null ? 0 : Math.round((submission.score / 100) * challenge.xpReward),
});

// Moves a submission out of one of `fromStatuses` exactly once and awards XP in the same transaction.
// Returns false if someone else (Gemini vs. skip button) already finalized it, so XP is never doubled.
const finalize = (submissionId, fromStatuses, data, xpReward) =>
  prisma.$transaction(async (tx) => {
    const updated = await tx.submission.updateMany({
      where: { id: submissionId, status: { in: fromStatuses } },
      data,
    });
    if (updated.count === 0) return false;

    const submission = await tx.submission.findUnique({ where: { id: submissionId } });
    const xpEarned = Math.round((data.score / 100) * xpReward);
    await tx.user.update({ where: { id: submission.userId }, data: { xp: { increment: xpEarned } } });
    // Invited users: the first passed challenge pays the inviter free Premium days (once)
    if (data.score >= PASS_SCORE) await rewardInviterIfAny(tx, submission.userId);
    return true;
  });

// Runs after the HTTP response was sent. Waits for Gemini as long as it takes (within MAX_WAIT).
const runAIReview = async (submissionId, challenge, content, language) => {
  try {
    const result = await generateFeedback({
      content,
      challenge,
      language,
      isCancelled: async () => {
        const s = await prisma.submission.findUnique({ where: { id: submissionId }, select: { status: true } });
        return !s || s.status !== 'PENDING'; // student skipped -> stop bothering Gemini
      },
    });
    if (!result) return;

    await finalize(
      submissionId,
      ['PENDING'],
      { status: 'REVIEWED', score: result.score, feedback: result.feedback },
      challenge.xpReward
    );
  } catch (error) {
    console.error(`AI review failed for submission ${submissionId}:`, error.message);
    await prisma.submission.updateMany({
      where: { id: submissionId, status: 'PENDING' },
      data: {
        status: 'AI_FAILED',
        feedback: 'The AI reviewer is unavailable right now. You can get an instant (provisional) grade from automated tests instead.',
      },
    });
  }
};

// @desc    Create a submission. Returns immediately (202) as PENDING; Gemini reviews in the background.
// @route   POST /api/submissions
const createSubmission = async (req, res) => {
  try {
    const { content, challengeId } = req.body;
    const language = normalizeLanguage(req.body.language);
    const userId = req.user.id;

    if (!content || !content.trim() || !challengeId) {
      return res.status(400).json({ message: 'Please provide content and challengeId' });
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    // Server-side lock: students can't skip ahead by opening a challenge URL directly
    const progress = await getProgress(userId);
    if (!progress.unlockedIds.includes(challengeId)) {
      return res.status(403).json({ message: 'This step is locked. Complete the previous challenge first.' });
    }

    const submission = await prisma.submission.create({
      data: { content, challengeId, userId, status: 'PENDING' },
    });

    res.status(202).json(withXp(submission, challenge));

    // Fire and forget (after responding)
    runAIReview(submission.id, challenge, content, language);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Poll a single submission (owner only)
// @route   GET /api/submissions/:id
const getSubmission = async (req, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { challenge: true },
    });
    if (!submission || submission.userId !== req.user.id) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    const { challenge, ...rest } = submission;
    res.json(withXp(rest, challenge));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    "Skip waiting": grade with the instant local test-case grader (provisional score)
// @route   POST /api/submissions/:id/quick-grade
const quickGrade = async (req, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { challenge: true },
    });
    if (!submission || submission.userId !== req.user.id) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    const { challenge, ...rest } = submission;

    // Already graded (e.g. Gemini just finished): return the real result, don't override it.
    if (!['PENDING', 'AI_FAILED'].includes(submission.status)) {
      return res.json(withXp(rest, challenge));
    }

    let graded;
    try {
      graded = await gradeLocally({
        content: submission.content,
        challengeTitle: challenge.title,
        language: normalizeLanguage(req.body.language),
      });
    } catch (err) {
      // Code runner (Judge0) unreachable: leave submission PENDING so the student can retry.
      return res.status(502).json({ message: 'Instant grader is unavailable right now. Please try again.' });
    }

    await finalize(
      submission.id,
      ['PENDING', 'AI_FAILED'],
      { status: 'LOCAL_GRADED', score: graded.score, feedback: graded.feedback },
      challenge.xpReward
    );

    const fresh = await prisma.submission.findUnique({ where: { id: submission.id } });
    res.json(withXp(fresh, challenge));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's submissions
// @route   GET /api/submissions/my
const getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createSubmission, getMySubmissions, getSubmission, quickGrade };
