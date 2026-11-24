const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

// Prices in Indian rupees. Change them here and they change everywhere.
const PLANS = {
  MONTHLY: { id: 'MONTHLY', label: 'Monthly', priceInr: 199, days: 30, perMonthInr: 199 },
  YEARLY: { id: 'YEARLY', label: 'Yearly', priceInr: 1499, days: 365, perMonthInr: 125, badge: 'Save 37%' },
};

const REFERRAL = {
  friendDays: 3,          // the new user gets this many free Premium days when they sign up with a code
  inviterDays: 7,         // the inviter gets this when their friend passes a first challenge
  maxRewardedPerUser: 10, // anti-abuse cap
};

const WEEKLY_PRIZE_DAYS = [30, 14, 7]; // 1st, 2nd, 3rd place of the weekly leaderboard

// ADMIN accounts always count as Premium (handy for testing).
const isPremiumUser = (user) =>
  !!user && (user.role === 'ADMIN' || (!!user.premiumUntil && new Date(user.premiumUntil) > new Date()));

// Adds days to the user's Premium (on top of the remaining time if still active).
// `db` can be the prisma client or a transaction client.
const extendPremium = async (db, userId, days) => {
  const u = await db.user.findUnique({ where: { id: userId }, select: { premiumUntil: true } });
  const now = new Date();
  const base = u?.premiumUntil && new Date(u.premiumUntil) > now ? new Date(u.premiumUntil) : now;
  const premiumUntil = new Date(base.getTime() + days * DAY);
  await db.user.update({ where: { id: userId }, data: { premiumUntil } });
  return premiumUntil;
};

const randomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alike characters (0/O, 1/I)
  let s = 'SA';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

const generateReferralCode = async (db = prisma) => {
  for (let i = 0; i < 10; i++) {
    const code = randomCode();
    if (!(await db.user.findUnique({ where: { referralCode: code } }))) return code;
  }
  throw new Error('Could not generate a referral code');
};

// Old accounts have no code yet: create it the first time it is needed.
const ensureReferralCode = async (userId) => {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (u?.referralCode) return u.referralCode;
  const code = await generateReferralCode();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
};

// The user object the frontend gets (never includes the password).
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  xp: user.xp,
  referralCode: user.referralCode || null,
  premiumUntil: user.premiumUntil || null,
  isPremium: isPremiumUser(user),
});

// For public routes where login is optional (e.g. the challenge list).
const getOptionalUser = async (req) => {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer')) return null;
    const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET || 'secret123');
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, premiumUntil: true },
    });
  } catch (e) {
    return null;
  }
};

// Inviter reward: when an invited user passes their first challenge, the inviter gets free Premium days.
// Runs inside the XP transaction so it can only happen once per invited user.
const rewardInviterIfAny = async (tx, userId) => {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { referredById: true, referralRewarded: true } });
  if (!user || !user.referredById || user.referralRewarded) return;

  await tx.user.update({ where: { id: userId }, data: { referralRewarded: true } });
  const alreadyRewarded = await tx.user.count({ where: { referredById: user.referredById, referralRewarded: true } });
  if (alreadyRewarded <= REFERRAL.maxRewardedPerUser) await extendPremium(tx, user.referredById, REFERRAL.inviterDays);
};

module.exports = {
  PLANS, REFERRAL, WEEKLY_PRIZE_DAYS, DAY,
  isPremiumUser, extendPremium, generateReferralCode, ensureReferralCode, publicUser, getOptionalUser, rewardInviterIfAny,
};
