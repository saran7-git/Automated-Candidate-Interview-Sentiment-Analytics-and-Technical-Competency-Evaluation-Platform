const { createModel } = require('./modelFactory');

const interviewSessionSchema = {
  candidateId: { type: String, required: true },
  interviewId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  currentQuestionIndex: { type: Number, default: 0 },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
};

const InterviewSession = createModel('InterviewSession', interviewSessionSchema);
module.exports = InterviewSession;
