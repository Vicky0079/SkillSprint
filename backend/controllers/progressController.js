const { getProgress } = require('../services/progress');

// @desc    Learning-path progress of the logged-in student
// @route   GET /api/challenges/progress
const getMyProgress = async (req, res) => {
  try {
    res.json(await getProgress(req.user.id));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyProgress };
