import express from 'express';
import { analyzeAnswer, getInterviewResult } from '../controllers/evaluationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', verifyToken, analyzeAnswer);
router.get('/:interviewId', verifyToken, getInterviewResult);
router.get('/results/:interviewId', verifyToken, getInterviewResult);

export default router;
