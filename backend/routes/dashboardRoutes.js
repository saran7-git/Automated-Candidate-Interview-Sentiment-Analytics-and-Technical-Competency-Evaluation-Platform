import express from 'express';
import { getCandidateDashboard, getAdminDashboard } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/candidate', verifyToken, getCandidateDashboard);
router.get('/admin', verifyToken, requireRole('admin'), getAdminDashboard);

export default router;
