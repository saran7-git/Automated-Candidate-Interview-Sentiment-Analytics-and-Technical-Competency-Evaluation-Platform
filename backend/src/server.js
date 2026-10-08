require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Automated Candidate Interview Sentiment Analytics and Technical Competency Evaluation Platform'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // Check if initial seeding is needed
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial seed data...');
      const seed = require('./utils/seedData');
      await seed();
    }

    app.listen(PORT, () => {
      console.log('================================================================');
      console.log(` Interview Analytics & Competency Evaluation Server Running`);
      console.log(` Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log('================================================================');
    });
  } catch (err) {
    console.error('[Server Error] Failed to launch server:', err);
    process.exit(1);
  }
}

startServer();
