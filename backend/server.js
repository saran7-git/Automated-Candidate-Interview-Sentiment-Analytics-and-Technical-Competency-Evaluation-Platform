import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDB, query } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { seedData } from './seeds/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import proctoringRoutes from './routes/proctoringRoutes.js';

dotenv.config();

const app = express();

// Allowed Origins for User Website (Port 3000) and Admin Website (Port 3001)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'InterviewIQ - Automated Candidate Interview Sentiment Analytics & Technical Evaluation',
    version: '2.0.0',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
  });
});

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/results', evaluationRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/proctoring', proctoringRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database & Start Server
const startServer = async () => {
  try {
    await initDB();

    // Auto-seed if database is empty
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    if (!existingUsers || existingUsers[0]?.count === 0) {
      console.log('[InterviewIQ]: Empty database detected. Running initial seed...');
      await seedData();
    }

    app.listen(PORT, () => {
      console.log(`[InterviewIQ Central Backend]: Running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
      console.log(`[Origins Allowed]: Candidate App (http://localhost:3000) & Admin App (http://localhost:3001)`);
    });
  } catch (err) {
    console.error('[Server Startup Error]:', err.message);
  }
};

startServer();
