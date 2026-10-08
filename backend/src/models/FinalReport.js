const { createModel } = require('./modelFactory');

const finalReportSchema = {
  sessionId: { type: String, required: true },
  candidateId: { type: String, required: true },
  interviewId: { type: String, required: true },
  technicalScore: { type: Number, required: true }, // 0 - 100
  sentimentScore: { type: Number, required: true }, // 0 - 100
  overallScore: { type: Number, required: true },   // (Technical * 0.70) + (Sentiment * 0.30)
  recommendation: {
    type: String,
    enum: ['Strong Hire', 'Recommended', 'Consider with Reservations', 'Not Recommended', 'Disqualified (Malpractice)', 'Disqualified', 'Terminated'],
    default: 'Recommended'
  },
  summary: { type: String, default: '' },
  categoryScores: { type: Object, default: {} },
  sentimentStats: {
    totalAnswers: { type: Number, default: 0 },
    positiveAnswers: { type: Number, default: 0 },
    neutralAnswers: { type: Number, default: 0 },
    negativeAnswers: { type: Number, default: 0 },
    positivePercentage: { type: Number, default: 0 },
    neutralPercentage: { type: Number, default: 0 },
    negativePercentage: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 }
  },
  technicalMetrics: {
    averageRelevance: { type: Number, default: 0 },
    averageCorrectness: { type: Number, default: 0 },
    averageConceptCoverage: { type: Number, default: 0 },
    averageCompleteness: { type: Number, default: 0 }
  },
  aiStrengths: { type: [String], default: [] },
  aiWeaknesses: { type: [String], default: [] },
  voiceEmotionStats: {
    primaryEmotion: { type: String, default: 'Confident & Composed' },
    confidenceScore: { type: Number, default: 85 },
    composureScore: { type: Number, default: 88 },
    hesitationIndex: { type: Number, default: 12 },
    speechPace: { type: String, default: 'Measured & Clear' }
  },
  malpracticeAudit: {
    totalAttempts: { type: Number, default: 0 },
    tabSwitches: { type: Number, default: 0 },
    eyeAwayWarnings: { type: Number, default: 0 },
    proctoringPassed: { type: Boolean, default: true }
  },
  status: { type: String, default: 'audited' },
  createdAt: { type: Date, default: Date.now }
};

const FinalReport = createModel('FinalReport', finalReportSchema);
module.exports = FinalReport;
