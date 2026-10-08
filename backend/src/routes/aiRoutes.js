const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests, please try again after 15 minutes.'
  }
});

router.use(aiLimiter);

router.post('/generate-questions', authenticate, aiController.generateQuestions);
router.post('/hr-dialogue', authenticate, aiController.handleHrDialogue);
router.post('/evaluate-presence', authenticate, aiController.evaluatePresence);
router.post('/analyze', authenticate, aiController.analyzeText);
router.post('/analyze/:responseId', authenticate, aiController.analyzeResponse);
router.post('/analyze-session/:sessionId', authenticate, aiController.analyzeSession);

module.exports = router;
