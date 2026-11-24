const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { PLANS, isPremiumUser, extendPremium } = require('../services/premium');

// @desc    Plans and prices
// @route   GET /api/premium/plans
const getPlans = (req, res) => {
  res.json({ plans: Object.values(PLANS), testMode: true });
};

// @desc    Is the logged-in user Premium?
// @route   GET /api/premium/status
const getStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, premiumUntil: true },
    });
    res.json({ isPremium: isPremiumUser(user), premiumUntil: user.premiumUntil });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Buy Premium
// @route   POST /api/premium/checkout   body: { plan: 'MONTHLY' | 'YEARLY' }
//
// TEST MODE: no real money moves. The payment is saved with provider "TEST" and Premium is switched on straight away.
// To go live with Razorpay/Stripe later: create the order here, return it to the frontend, and run the two
// lines inside the transaction below only after the gateway confirms the payment (webhook / signature check).
const checkout = async (req, res) => {
  try {
    const plan = PLANS[String(req.body.plan || '').toUpperCase()];
    if (!plan) return res.status(400).json({ message: 'Unknown plan' });
    if (req.user.role === 'COMPANY') return res.status(400).json({ message: 'Premium is for student accounts.' });

    const premiumUntil = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: { userId: req.user.id, plan: plan.id, amountInr: plan.priceInr, provider: 'TEST', status: 'PAID' },
      });
      return extendPremium(tx, req.user.id, plan.days);
    });

    res.json({ isPremium: true, premiumUntil, plan: plan.id, testMode: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPlans, getStatus, checkout };
