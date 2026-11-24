const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserRank } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/leaderboard').get(getLeaderboard);
router.route('/rank').get(protect, getUserRank); // Protected route

module.exports = router;