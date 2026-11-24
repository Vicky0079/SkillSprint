const express = require('express');
const router = express.Router();
const { chatWithTutor } = require('../controllers/aiChatController');
const { generateHint } = require('../controllers/hintController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', chatWithTutor);
router.post('/hint', protect, generateHint);

module.exports = router;
