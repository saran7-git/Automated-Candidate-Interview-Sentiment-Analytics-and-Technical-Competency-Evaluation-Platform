const { createModel } = require('./modelFactory');

const candidateSchema = {
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  resume: { type: String, default: '' },
  phone: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  skills: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
};

const Candidate = createModel('Candidate', candidateSchema);
module.exports = Candidate;
