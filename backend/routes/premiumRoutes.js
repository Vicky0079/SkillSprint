const express = require('express');
const router = express.Router();
const { getPlans, getStatus, checkout } = require('../controllers/premiumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/plans', getPlans);
router.get('/status', protect, getStatus);
router.post('/checkout', protect, checkout);

module.exports = router;
