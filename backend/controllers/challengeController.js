const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isPremiumUser, getOptionalUser } = require('../services/premium');

// @desc    Create a new challenge
// @route   POST /api/challenges
const createChallenge = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      difficulty, 
      xpReward, 
      deadline,
      topic,     // <-- Added
      lesson,    // <-- Added
      solution   // <-- Added
    } = req.body;
    
    const creatorId = req.user.id; // The logged-in company's ID

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        difficulty,
        topic: topic || "General", // Fallback if company forgets to add a topic
        lesson: lesson || null,
        solution: solution || null,
        xpReward: xpReward || 100,
        deadline: new Date(deadline),
        order: 999, // <-- Added: Puts company-created challenges at the end of the path
        creatorId, 
      },
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all challenges
// @route   GET /api/challenges
const getChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { order: 'asc' }, // <-- CHANGED: Sorts by the learning path sequence (1, 2, 3...)
    });

    // Premium questions: everybody sees the title/company/difficulty (so they know what they would get),
    // but the question text, lesson and solution are only sent to Premium members.
    const premium = isPremiumUser(await getOptionalUser(req));
    res.json(
      challenges.map((c) =>
        c.isPremium && !premium ? { ...c, description: '', lesson: null, solution: null, premiumLocked: true } : c
      )
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get submissions for a specific challenge (Company view)
// @route   GET /api/challenges/:id/submissions
const getChallengeSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First, check if the challenge belongs to this company
    const challenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    if (challenge.creatorId !== userId) {
      return res.status(403).json({ message: 'You can only view submissions for your own challenges' });
    }

    // Get all submissions for this challenge, including the student's name
    const submissions = await prisma.submission.findMany({
      where: { challengeId: id },
      include: {
        user: { select: { name: true, email: true, xp: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createChallenge, getChallenges, getChallengeSubmissions };