const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get top users for leaderboard
// @route   GET /api/users/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 10, // Top 10 users
      select: { id: true, name: true, xp: true, role: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user's rank
// @route   GET /api/users/rank
const getUserRank = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get the current user's XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Count how many users have MORE XP than this user
    const higherXPCount = await prisma.user.count({
      where: { xp: { gt: user.xp } }
    });

    // 3. Rank is the count + 1
    res.json({ rank: higherXPCount + 1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getLeaderboard, getUserRank };