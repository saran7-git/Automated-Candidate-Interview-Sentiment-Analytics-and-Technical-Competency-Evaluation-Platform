const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// Rate limiting for AI endpoints: 100 requests per 15 minutes window
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI evaluation requests, please try again after 15 minutes.'
  }
});

router.use(aiLimiter);

router.post('/analyze', authenticate, aiController.analyzeText);
router.post('/analyze/:responseId', authenticate, aiController.analyzeResponse);
router.post('/analyze-session/:sessionId', authenticate, aiController.analyzeSession);

module.exports = router;
