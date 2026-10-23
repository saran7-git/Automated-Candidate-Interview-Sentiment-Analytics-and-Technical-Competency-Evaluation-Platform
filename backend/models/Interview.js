import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  textAnswer: {
    type: String,
    default: '',
  },
  timeSpent: {
    type: Number,
    default: 0, // seconds spent on this specific question
  },
  timestampOffset: {
    type: Number,
    default: 0, // seconds elapsed from interview start
  },
  evaluation: {
    technicalScore: { type: Number, default: 0 },
    accuracyScore: { type: Number, default: 0 },
    conceptCoverageScore: { type: Number, default: 0 },
    matchedConcepts: { type: [String], default: [] },
    missingConcepts: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      default: 'Neutral',
    },
    sentimentScore: { type: Number, default: 50 },
    feedback: { type: String, default: '' },
  },
});

const interviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    questionCount: {
      type: Number,
      default: 5,
    },
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        questionText: String,
        domain: String,
        skill: String,
        difficulty: String,
        expectedConcepts: [String],
        keywords: [String],
        sampleAnswer: String,
        marks: { type: Number, default: 10 },
      },
    ],
    answers: [answerSchema],
    technicalScore: {
      type: Number,
      default: 0,
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    sentimentDistribution: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },
    skillBreakdown: [
      {
        skill: String,
        score: Number,
        totalQuestions: Number,
      },
    ],
    strengths: {
      type: [String],
      default: [],
    },
    areasToImprove: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      enum: ['Strong Hire', 'Good Candidate', 'Consider with Reservations', 'Needs Improvement', 'Not Recommended', 'Pending'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'evaluated', 'cancelled'],
      default: 'in_progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number, // total duration in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model('Interview', interviewSchema);
