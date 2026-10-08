const { createModel } = require('./modelFactory');

const responseSchema = {
  sessionId: { type: String, required: true },
  questionId: { type: String, required: true },
  candidateId: { type: String, default: '' },
  candidateAnswer: { type: String, required: true },
  questionCategory: { type: String, default: 'General Technical' },
  questionText: { type: String, default: '' },
  expectedAnswer: { type: String, default: '' },
  keywords: { type: [String], default: [] },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
};

const Response = createModel('Response', responseSchema);
module.exports = Response;
