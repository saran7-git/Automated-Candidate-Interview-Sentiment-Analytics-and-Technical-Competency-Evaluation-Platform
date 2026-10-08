const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, sessionController.create);
router.get('/:id', authenticate, sessionController.getById);
router.get('/candidate/:candidateId', authenticate, sessionController.getByCandidate);
router.put('/:id', authenticate, sessionController.update);
router.post('/:id/start', authenticate, sessionController.startSession);
router.post('/:id/submit', authenticate, sessionController.submit);
router.post('/:id/terminate', authenticate, sessionController.terminate);

module.exports = router;
