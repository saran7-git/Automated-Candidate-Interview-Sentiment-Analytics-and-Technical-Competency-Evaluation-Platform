import express from 'express';
import {
  getAdminDashboard,
  getAdminAnalytics,
  compareCandidates,
  getAllUsers,
  updateUserRole,
  getSystemAuditLogs,
  exportReportData,
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', verifyToken, requireRole('admin', 'recruiter'), getAdminDashboard);
router.get('/analytics', verifyToken, requireRole('admin', 'recruiter'), getAdminAnalytics);
router.get('/candidates/compare', verifyToken, requireRole('admin', 'recruiter'), compareCandidates);
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.put('/users/:id/role', verifyToken, requireRole('admin'), updateUserRole);
router.get('/audit-logs', verifyToken, requireRole('admin', 'recruiter'), getSystemAuditLogs);
router.get('/export-reports', verifyToken, requireRole('admin', 'recruiter'), exportReportData);

export default router;
