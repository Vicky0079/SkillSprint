const express = require('express');
const router = express.Router();
const { createChallenge, getChallenges, getChallengeSubmissions } = require('../controllers/challengeController');
const { getMyProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createChallenge)
  .get(getChallenges);

// Learning-path progress (completed + unlocked steps) for the logged-in student
router.get('/progress', protect, getMyProgress);

// Route to get submissions for a specific challenge (Company view)
router.get('/:id/submissions', protect, getChallengeSubmissions);

module.exports = router;
