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
  recordingUrl: { type: String, default: '' },
  recordingDuration: { type: Number, default: 0 },
  presenceEvaluation: {
    attireScore: { type: Number, default: 85 },
    groomingScore: { type: Number, default: 88 },
    attitudeScore: { type: Number, default: 90 },
    communicationScore: { type: Number, default: 86 },
    emotionScore: { type: Number, default: 87 },
    postureScore: { type: Number, default: 88 },
    presenceSummary: { type: String, default: 'Candidate displayed professional attire, neat grooming, focused posture, and positive collaborative attitude throughout the session.' }
  },
  hrConversationLog: { type: [Object], default: [] },
  dynamicQuestions: { type: [Object], default: [] },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
};

const InterviewSession = createModel('InterviewSession', interviewSessionSchema);
module.exports = InterviewSession;
