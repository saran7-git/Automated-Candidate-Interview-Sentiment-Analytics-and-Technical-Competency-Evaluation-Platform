import express from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Candidates and admins can list and read questions
router.get('/', verifyToken, getQuestions);
router.get('/:id', verifyToken, getQuestionById);

// Admin-only mutation routes
router.post('/', verifyToken, requireRole('admin'), createQuestion);
router.put('/:id', verifyToken, requireRole('admin'), updateQuestion);
router.delete('/:id', verifyToken, requireRole('admin'), deleteQuestion);

export default router;
