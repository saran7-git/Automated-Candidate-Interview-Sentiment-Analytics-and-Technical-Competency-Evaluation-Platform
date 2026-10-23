import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Recording } from '../models/Recording.js';
import { Interview } from '../models/Interview.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadBaseDir = path.join(__dirname, '..', 'uploads');

/**
 * Upload recording file (webcam, audio, screen)
 * POST /api/recordings/upload
 */
export const uploadRecording = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No recording file uploaded.',
      });
    }

    const { interviewId, type, duration, startedAt, endedAt } = req.body;
    const candidateId = req.user._id;

    if (!interviewId || !type) {
      return res.status(400).json({
        success: false,
        message: 'interviewId and type are required.',
      });
    }

    // Verify interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Relative path for storage & serving
    const relativePath = path.relative(uploadBaseDir, req.file.path).replace(/\\/g, '/');

    // Create recording record
    const recording = await Recording.create({
      interviewId,
      candidateId,
      type,
      filePath: relativePath,
      fileName: req.file.filename,
      fileSize: req.file.size,
      duration: parseFloat(duration) || 0,
      mimeType: req.file.mimetype,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    res.status(201).json({
      success: true,
      message: `${type} recording uploaded successfully.`,
      recording,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all recordings for a specific interview
 * GET /api/recordings/interview/:interviewId
 */
export const getRecordingsByInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const recordings = await Recording.find({ interviewId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: recordings.length,
      recordings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stream a recording file with HTTP 206 Byte-Range support for smooth video/audio seeking
 * GET /api/recordings/stream/:id
 */
export const streamRecording = async (req, res, next) => {
  try {
    const recording = await Recording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found.',
      });
    }

    const fullFilePath = path.join(uploadBaseDir, recording.filePath);

    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical recording file not found on server disk.',
      });
    }

    const stat = fs.statSync(fullFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const mimeType = recording.mimeType || (
      recording.type === 'audio' ? 'audio/webm' : 'video/webm'
    );

    if (range) {
      // Parse Range Header e.g. "bytes=32324-"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(fullFilePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(fullFilePath).pipe(res);
    }
  } catch (error) {
    next(error);
  }
};
