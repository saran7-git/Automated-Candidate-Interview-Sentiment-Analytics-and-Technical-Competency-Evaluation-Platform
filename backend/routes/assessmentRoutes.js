import express from 'express';
import {
  getAssessmentSections,
  startAssessmentSession,
  saveAssessmentAnswer,
  submitAssessmentSession,
  runCodingCode,
  submitCodingSolution,
  getCandidateAssessmentSummary,
} from '../controllers/assessmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All assessment routes are protected
router.use(protect);

router.get('/sections', getAssessmentSections);
router.post('/start/:sectionType', startAssessmentSession);
router.post('/session/:sessionId/save-answer', saveAssessmentAnswer);
router.post('/session/:sessionId/submit', submitAssessmentSession);
router.post('/coding/run', runCodingCode);
router.post('/coding/submit', submitCodingSolution);
router.get('/candidate-summary/:candidateId?', getCandidateAssessmentSummary);

export default router;
