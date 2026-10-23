import express from 'express';
import { getCandidates, getCandidateById, getCandidateDashboard } from '../controllers/candidateController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Candidate's own dashboard metrics
router.get('/dashboard', verifyToken, getCandidateDashboard);

// Admin-only candidate directory
router.get('/', verifyToken, requireRole('admin'), getCandidates);
router.get('/:id', verifyToken, requireRole('admin'), getCandidateById);

export default router;
