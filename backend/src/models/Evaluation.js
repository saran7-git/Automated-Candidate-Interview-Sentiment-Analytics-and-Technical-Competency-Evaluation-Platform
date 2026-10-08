const { createModel } = require('./modelFactory');

const evaluationSchema = {
  responseId: { type: String, required: true },
  sessionId: { type: String, required: true },
  candidateId: { type: String, default: '' },
  questionId: { type: String, default: '' },
  questionCategory: { type: String, default: 'General Technical' },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], required: true },
  sentimentConfidence: { type: Number, required: true }, // e.g. 0.86
  sentimentProbabilities: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },
  sentimentScore: { type: Number, required: true }, // 0 - 100
  technicalScore: { type: Number, required: true }, // 0 - 100
  relevanceScore: { type: Number, required: true }, // 0 - 100
  correctnessScore: { type: Number, required: true }, // 0 - 100
  conceptCoverageScore: { type: Number, required: true }, // 0 - 100
  completenessScore: { type: Number, required: true }, // 0 - 100
  overallAnswerScore: { type: Number, required: true }, // 0 - 100
  detectedConcepts: { type: [String], default: [] },
  missingConcepts: { type: [String], default: [] },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  feedback: { type: String, default: '' },
  pipelineUsed: { type: String, default: 'Built-in NLP Pipeline' },
  createdAt: { type: Date, default: Date.now }
};

const Evaluation = createModel('Evaluation', evaluationSchema);
module.exports = Evaluation;
