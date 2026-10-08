const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'candidate', phone, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: ['admin', 'candidate'].includes(role) ? role : 'candidate'
    });

    let candidateProfile = null;
    if (user.role === 'candidate') {
      candidateProfile = await Candidate.create({
        userId: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: phone || '',
        skills: Array.isArray(skills) ? skills : []
      });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        candidateId: candidateProfile ? (candidateProfile._id || candidateProfile.id) : null
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Account role is '${user.role}', but login requested '${role}'`
      });
    }

    let candidateId = null;
    if (user.role === 'candidate') {
      const cand = await Candidate.findOne({ userId: user._id || user.id });
      if (cand) candidateId = cand._id || cand.id;
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        candidateId
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let candidateId = null;
    if (user.role === 'candidate') {
      const cand = await Candidate.findOne({ userId: user._id || user.id });
      if (cand) candidateId = cand._id || cand.id;
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        candidateId
      }
    });
  } catch (err) {
    next(err);
  }
};
