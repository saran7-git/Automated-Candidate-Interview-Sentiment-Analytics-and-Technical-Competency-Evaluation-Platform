const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, interviewController.getAll);
router.get('/:id', authenticate, interviewController.getById);
router.post('/', authenticate, requireRole('admin'), interviewController.create);
router.put('/:id', authenticate, requireRole('admin'), interviewController.update);
router.delete('/:id', authenticate, requireRole('admin'), interviewController.delete);

module.exports = router;
