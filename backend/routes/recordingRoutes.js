import express from 'express';
import {
  uploadRecording,
  getRecordingsByInterview,
  streamRecording,
} from '../controllers/recordingController.js';
import { uploadMedia } from '../middleware/upload.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Upload media file (webcam, audio, screen)
router.post('/upload', verifyToken, uploadMedia.single('file'), uploadRecording);

// Get recording records for an interview
router.get('/interview/:interviewId', verifyToken, getRecordingsByInterview);

// Stream video/audio with Range support (public/token authorized for HTML5 media elements)
router.get('/stream/:id', streamRecording);

export default router;
