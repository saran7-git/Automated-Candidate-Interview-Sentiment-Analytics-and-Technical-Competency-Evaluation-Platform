const { createModel } = require('./modelFactory');

const interviewSessionSchema = {
  candidateId: { type: String, required: true },
  interviewId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'disqualified', 'terminated_malpractice'],
    default: 'pending'
  },
  proctoringWarnings: { type: Number, default: 0 },
  malpracticeReason: { type: String, default: '' },
  disqualifiedAt: { type: Date, default: null },
  currentQuestionIndex: { type: Number, default: 0 },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
};

const InterviewSession = createModel('InterviewSession', interviewSessionSchema);
module.exports = InterviewSession;
