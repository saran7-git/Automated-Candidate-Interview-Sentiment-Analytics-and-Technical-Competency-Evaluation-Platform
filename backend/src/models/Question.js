const { createModel } = require('./modelFactory');

const questionSchema = {
  question: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Programming',
      'Database',
      'Networking',
      'Operating Systems',
      'Data Structures',
      'AI/ML',
      'General Technical',
      'HR/Behavioral'
    ],
    required: true
  },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  expectedAnswer: { type: String, required: true },
  keywords: { type: [String], default: [] },
  maxScore: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
};

const Question = createModel('Question', questionSchema);
module.exports = Question;
