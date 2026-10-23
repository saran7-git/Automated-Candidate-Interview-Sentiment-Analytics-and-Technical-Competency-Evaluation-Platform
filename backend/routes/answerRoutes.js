import express from 'express';
import { saveAnswer, getInterviewAnswers } from '../controllers/answerController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, saveAnswer);
router.get('/:interviewId', verifyToken, getInterviewAnswers);

export default router;
