const express = require('express');
const router = express.Router();
const { createSubmission, getMySubmissions, getSubmission, quickGrade } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createSubmission);

router.route('/my')
  .get(protect, getMySubmissions);

router.route('/:id')
  .get(protect, getSubmission);

router.route('/:id/quick-grade')
  .post(protect, quickGrade);

module.exports = router;
