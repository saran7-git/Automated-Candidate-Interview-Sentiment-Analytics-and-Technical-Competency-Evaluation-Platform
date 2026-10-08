const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('admin'), candidateController.getAll);
router.get('/:id', authenticate, candidateController.getById);
router.post('/', authenticate, requireRole('admin'), candidateController.create);
router.put('/:id', authenticate, requireRole('admin'), candidateController.update);
router.delete('/:id', authenticate, requireRole('admin'), candidateController.delete);

module.exports = router;
