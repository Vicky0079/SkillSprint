const { PrismaClient } = require('@prisma/client');
const { isPremiumUser } = require('./premium');
const prisma = new PrismaClient();

// A step counts as "completed" when the student scored at least this much.
// (Instant grader gives 100 only when ALL tests pass, 50 otherwise, so a wrong answer never unlocks the next step.)
const PASS_SCORE = 70;

/**
 * Learning-path state for one student.
 * - Path challenges (no creator, not premium) unlock one after another, ordered by `order`.
 * - Company-created challenges are always open.
 * - Premium challenges (interview + bonus questions) are open only while the student has Premium.
 */
const getProgress = async (userId) => {
  const [challenges, passed, user] = await Promise.all([
    prisma.challenge.findMany({ orderBy: { order: 'asc' }, select: { id: true, creatorId: true, isPremium: true } }),
    prisma.submission.findMany({
      where: { userId, score: { gte: PASS_SCORE } },
      select: { challengeId: true },
      distinct: ['challengeId'],
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, premiumUntil: true } }),
  ]);

  const premium = isPremiumUser(user);
  const completedIds = passed.map((p) => p.challengeId);
  const done = new Set(completedIds);

  const unlockedIds = [];
  let nextId = null; // first unlocked path step that is not completed yet
  let previousDone = true;
  let pathTotal = 0;
  let pathCompleted = 0;

  for (const c of challenges) {
    if (c.isPremium) { if (premium) unlockedIds.push(c.id); continue; }
    if (c.creatorId) { unlockedIds.push(c.id); continue; }
    pathTotal += 1;
    if (done.has(c.id)) pathCompleted += 1;
    if (previousDone) {
      unlockedIds.push(c.id);
      if (!done.has(c.id) && !nextId) nextId = c.id;
    }
    previousDone = done.has(c.id);
  }

  return { passScore: PASS_SCORE, completedIds, unlockedIds, nextId, pathTotal, pathCompleted, isPremium: premium };
};

module.exports = { getProgress, PASS_SCORE };
