const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { WEEKLY_PRIZE_DAYS, REFERRAL, DAY, extendPremium, ensureReferralCode } = require('../services/premium');

// Weeks run Monday 00:00 -> next Monday 00:00 (UTC).
const startOfWeek = (date) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const mondayOffset = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - mondayOffset * DAY);
};
const weekKey = (start) => start.toISOString().slice(0, 10);

// XP earned inside [start, end). Only the BEST score per challenge counts, so resubmitting the same
// challenge again and again cannot win the weekly prize.
const weeklyBoard = async (start, end) => {
  const subs = await prisma.submission.findMany({
    where: { createdAt: { gte: start, lt: end }, score: { not: null } },
    select: {
      score: true, userId: true, challengeId: true,
      user: { select: { name: true, role: true } },
      challenge: { select: { xpReward: true } },
    },
  });

  const best = new Map(); // "user|challenge" -> best xp
  const names = new Map();
  for (const s of subs) {
    if (s.user.role !== 'STUDENT') continue; // companies/admins don't compete
    names.set(s.userId, s.user.name);
    const xp = Math.round((s.score / 100) * s.challenge.xpReward);
    const key = `${s.userId}|${s.challengeId}`;
    if (!best.has(key) || best.get(key) < xp) best.set(key, xp);
  }

  const totals = new Map();
  for (const [key, xp] of best) {
    const userId = key.split('|')[0];
    totals.set(userId, (totals.get(userId) || 0) + xp);
  }

  return [...totals.entries()]
    .map(([userId, xp]) => ({ userId, name: names.get(userId), xp }))
    .filter((r) => r.xp > 0)
    .sort((a, b) => b.xp - a.xp);
};

// Pays last week's top 3 with free Premium. Safe to call many times: the unique (weekKey, userId) row
// means each winner is paid once, even if two requests arrive together.
const settleWeek = async (start, end) => {
  const key = weekKey(start);
  if ((await prisma.weeklyAward.count({ where: { weekKey: key } })) > 0) return;

  const winners = (await weeklyBoard(start, end)).slice(0, WEEKLY_PRIZE_DAYS.length);
  for (let i = 0; i < winners.length; i++) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.weeklyAward.create({
          data: { weekKey: key, userId: winners[i].userId, rank: i + 1, days: WEEKLY_PRIZE_DAYS[i], xp: winners[i].xp },
        });
        await extendPremium(tx, winners[i].userId, WEEKLY_PRIZE_DAYS[i]);
      });
    } catch (e) {
      // already paid by a parallel request: nothing to do
    }
  }
};

// @desc    Everything the "Earn" page needs
// @route   GET /api/earn/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thisStart = startOfWeek(now);
    const nextStart = new Date(thisStart.getTime() + 7 * DAY);
    const lastStart = new Date(thisStart.getTime() - 7 * DAY);

    await settleWeek(lastStart, thisStart);

    const [referralCode, invited, rewarded, board, lastAwards, myAwards] = await Promise.all([
      ensureReferralCode(userId),
      prisma.user.count({ where: { referredById: userId } }),
      prisma.user.count({ where: { referredById: userId, referralRewarded: true } }),
      weeklyBoard(thisStart, nextStart),
      prisma.weeklyAward.findMany({
        where: { weekKey: weekKey(lastStart) },
        orderBy: { rank: 'asc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.weeklyAward.findMany({ where: { userId } }),
    ]);

    const myIndex = board.findIndex((r) => r.userId === userId);

    res.json({
      referral: {
        code: referralCode,
        invited,
        rewarded,
        daysEarned: Math.min(rewarded, REFERRAL.maxRewardedPerUser) * REFERRAL.inviterDays,
        friendDays: REFERRAL.friendDays,
        inviterDays: REFERRAL.inviterDays,
        maxRewarded: REFERRAL.maxRewardedPerUser,
      },
      weekly: {
        weekStart: weekKey(thisStart),
        endsAt: nextStart,
        prizes: WEEKLY_PRIZE_DAYS,
        top: board.slice(0, 5).map((r, i) => ({ rank: i + 1, name: r.name, xp: r.xp, isMe: r.userId === userId })),
        me: { rank: myIndex === -1 ? null : myIndex + 1, xp: myIndex === -1 ? 0 : board[myIndex].xp },
        lastWeekWinners: lastAwards.map((a) => ({ rank: a.rank, name: a.user.name, days: a.days, xp: a.xp, isMe: a.userId === userId })),
        totalDaysWon: myAwards.reduce((sum, a) => sum + a.days, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSummary, weeklyBoard, settleWeek, startOfWeek };
