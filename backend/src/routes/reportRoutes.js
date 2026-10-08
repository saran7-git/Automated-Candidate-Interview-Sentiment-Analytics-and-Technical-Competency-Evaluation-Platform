const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.get('/:sessionId', authenticate, reportController.getBySession);
router.get('/session/:sessionId', authenticate, reportController.getBySession);
router.get('/candidate/:candidateId', authenticate, reportController.getByCandidate);

module.exports = router;
