import express from 'express';
import {
  startInterview,
  getInterviewById,
  completeInterview,
  getCandidateHistory,
  getAllInterviews,
} from '../controllers/interviewController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', verifyToken, startInterview);
router.get('/history', verifyToken, getCandidateHistory);
router.get('/:id', verifyToken, getInterviewById);
router.post('/:id/complete', verifyToken, completeInterview);

// Admin-only list of all interviews
router.get('/', verifyToken, requireRole('admin'), getAllInterviews);

export default router;
