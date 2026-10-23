import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads folder
const uploadBaseDir = path.join(__dirname, '..', 'uploads');

// Ensure subfolders exist
const subDirs = ['videos', 'audio', 'screens'];
subDirs.forEach((dir) => {
  const fullPath = path.join(uploadBaseDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'videos';
    const fieldOrType = req.body.type || file.fieldname;

    if (fieldOrType === 'audio' || file.mimetype.startsWith('audio/')) {
      subfolder = 'audio';
    } else if (fieldOrType === 'screen') {
      subfolder = 'screens';
    } else if (fieldOrType === 'webcam' || fieldOrType === 'video') {
      subfolder = 'videos';
    }

    const dest = path.join(uploadBaseDir, subfolder);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const interviewId = req.body.interviewId || req.params.interviewId || 'unassigned';
    const type = req.body.type || file.fieldname || 'recording';
    const timestamp = Date.now();
    
    // Determine extension
    let ext = path.extname(file.originalname);
    if (!ext) {
      if (file.mimetype.includes('webm')) ext = '.webm';
      else if (file.mimetype.includes('mp4')) ext = '.mp4';
      else if (file.mimetype.includes('wav')) ext = '.wav';
      else if (file.mimetype.includes('mp3') || file.mimetype.includes('mpeg')) ext = '.mp3';
      else ext = '.webm';
    }

    const sanitizedFileName = `${interviewId}_${type}_${timestamp}${ext}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, sanitizedFileName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/webm',
    'video/mp4',
    'video/x-matroska',
    'video/ogg',
    'audio/webm',
    'audio/wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/x-m4a',
    'application/octet-stream', // Some browsers send binary recording blobs as octet-stream
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported media type: ${file.mimetype}. Only audio/video files are accepted.`), false);
  }
};

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB max per file
  },
  fileFilter,
});
