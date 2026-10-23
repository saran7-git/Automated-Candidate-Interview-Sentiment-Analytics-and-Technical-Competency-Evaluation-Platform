import express from 'express';
import {
  logProctoringEvent,
  getSessionProctoringLogs,
  getProctoringSettings,
  updateProctoringSettings,
} from '../controllers/proctoringController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/log', logProctoringEvent);
router.get('/logs/:sessionType/:sessionId', getSessionProctoringLogs);
router.get('/settings', getProctoringSettings);
router.put('/settings', updateProctoringSettings);

export default router;
