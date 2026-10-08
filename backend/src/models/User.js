const { createModel } = require('./modelFactory');

const userSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'candidate'], default: 'candidate' },
  createdAt: { type: Date, default: Date.now }
};

const User = createModel('User', userSchema);
module.exports = User;
