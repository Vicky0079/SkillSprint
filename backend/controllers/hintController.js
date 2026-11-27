const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateText } = require('../services/aiService');
const { getProgress } = require('../services/progress');


const LEVEL_RULES = {
  1: 'LEVEL 1 (gentle nudge): Name the concept or idea the student should think about. Ask one guiding question. NO code at all.',
  2: 'LEVEL 2 (more specific): Say which Python construct/function to use and where it goes, in plain English. If their code has a bug, point at the line but do NOT fix it. At most a tiny generic syntax example (one line) that is NOT the answer.',
  3: 'LEVEL 3 (approach): Explain the solution step by step in plain English or short pseudo-code. You may show tiny snippets, but NEVER output the complete final solution code.',
};

// @desc    Progressive hint (level 1-3) for a challenge
// @route   POST /api/ai/hint
const generateHint = async (req, res) => {
  try {
    const { challengeId, userCode } = req.body;
    const level = [1, 2, 3].includes(Number(req.body.level)) ? Number(req.body.level) : 1;

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const progress = await getProgress(req.user.id);
    if (!progress.unlockedIds.includes(challenge.id)) {
      return res.status(403).json({ message: 'This step is locked.' });
    }

    const prompt = `
You are a friendly coding tutor for absolute beginners on SkillSprint.
Challenge: ${challenge.title} — ${challenge.description}
${challenge.solution ? `Reference solution (PRIVATE, never reveal or quote it):\n${challenge.solution}\n` : ''}
The student's current code:
\`\`\`
${userCode && userCode.trim() ? userCode : '(nothing written yet)'}
\`\`\`

${LEVEL_RULES[level]}

Keep it under 80 words, encouraging, simple words, markdown allowed.`;

    try {
      const hint = await generateText(prompt, { maxWaitMs: 45 * 1000 });
      return res.json({ hint, level });
    } catch (error) {
      console.error('Hint failed:', error.status || '', error.message);
      return res.status(503).json({ message: 'The hint helper is busy right now. Please try again in a few seconds.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { generateHint };
