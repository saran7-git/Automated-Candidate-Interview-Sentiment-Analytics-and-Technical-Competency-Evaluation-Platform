const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/statistics', authenticate, requireRole('admin'), dashboardController.getStatistics);
router.post('/compare', authenticate, requireRole('admin'), dashboardController.compareCandidates);

module.exports = router;
