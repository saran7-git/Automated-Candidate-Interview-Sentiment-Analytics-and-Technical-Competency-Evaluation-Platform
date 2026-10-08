const { createModel } = require('./modelFactory');

const interviewSchema = {
  title: { type: String, required: true },
  jobRole: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, default: 30 }, // in minutes
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  questions: { type: [Object], default: [] }, // Array of question objects with question, category, etc.
  createdBy: { type: String, default: 'admin' },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
};

const Interview = createModel('Interview', interviewSchema);
module.exports = Interview;
