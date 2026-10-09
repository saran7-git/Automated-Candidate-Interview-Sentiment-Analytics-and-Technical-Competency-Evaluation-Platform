const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const InterviewSession = require('../models/InterviewSession');
const { generateFoundationAssessment } = require('../ai/dynamicQuestionGenerator');

/**
 * Initializes default Admin account, default Candidate account,
 * and the official 2026 Foundation Assessment
 */
async function initDatabase() {
  const salt = await bcrypt.genSalt(10);

  // 1. Ensure default administrator account exists
  let existingAdmin = await User.findOne({ email: 'admin@interview.ai' });
  if (!existingAdmin) {
    existingAdmin = await User.findById('admin_master_sys');
  }

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@123', salt);
    await User.create({
      _id: 'admin_master_sys',
      name: 'System Administrator',
      email: 'admin@interview.ai',
      passwordHash,
      role: 'admin'
    });
    console.log('[Database] Created default administrator: admin@interview.ai');
  } else {
    const passwordHash = await bcrypt.hash('Admin@123', salt);
    await User.findByIdAndUpdate(existingAdmin._id || existingAdmin.id, {
      name: 'System Administrator',
      email: 'admin@interview.ai',
      passwordHash,
      role: 'admin'
    });
    console.log('[Database] Verified default administrator: admin@interview.ai');
  }

  // 2. Generate the official 2026 Foundation Assessment questions
  const generated = generateFoundationAssessment('system_master_template', 'seed_2026_foundation_v1');

  let primaryInterview = await Interview.findById('int_foundation_2026');
  if (!primaryInterview) {
    primaryInterview = await Interview.findOne({ title: { $regex: /Foundation/i } });
  }

  const interviewData = {
    title: '2026 Foundation Assessment + Coding & AI HR Round',
    jobRole: 'Software Engineer (2026 Campus & Foundation Hiring)',
    description: 'Official 2026 Pattern: 1. Numerical Ability (20Q • 25m), 2. Verbal Ability (25Q • 25m), 3. Reasoning Ability (20Q • 25m) [Total 65Q • 75m] + Coding Assessment + Conversational AI HR Round with strict Anti-Malpractice Proctoring & Voice Emotion Analytics.',
    duration: 75,
    difficulty: 'Intermediate',
    questions: generated.allQuestions,
    createdBy: 'System Administrator',
    status: 'active'
  };

  if (!primaryInterview) {
    primaryInterview = await Interview.create({
      _id: 'int_foundation_2026',
      ...interviewData
    });
    console.log('[Database] Initialized 2026 Foundation Assessment (20 Numerical + 25 Verbal + 20 Reasoning + Coding + AI HR)');
  } else {
    primaryInterview = await Interview.findByIdAndUpdate(
      primaryInterview._id || primaryInterview.id,
      interviewData,
      { new: true }
    );
    console.log('[Database] Updated 2026 Foundation Assessment questions template');
  }

  // 3. Ensure default candidate account exists and has an assigned session
  let candidateUser = await User.findOne({ email: 'candidate@interview.ai' });
  if (!candidateUser) {
    candidateUser = await User.findById('cand_user_default_2026');
  }

  if (!candidateUser) {
    const candidateHash = await bcrypt.hash('Candidate@123', salt);
    candidateUser = await User.create({
      _id: 'cand_user_default_2026',
      name: 'Candidate',
      email: 'candidate@interview.ai',
      passwordHash: candidateHash,
      role: 'candidate'
    });
    console.log('[Database] Created default candidate user: candidate@interview.ai');
  } else {
    const candidateHash = await bcrypt.hash('Candidate@123', salt);
    await User.findByIdAndUpdate(candidateUser._id || candidateUser.id, {
      name: 'Candidate',
      email: 'candidate@interview.ai',
      passwordHash: candidateHash,
      role: 'candidate'
    });
  }

  let candidateProfile = await Candidate.findOne({ email: 'candidate@interview.ai' });
  if (!candidateProfile) {
    candidateProfile = await Candidate.findById('cand_profile_default_2026');
  }

  if (!candidateProfile) {
    candidateProfile = await Candidate.create({
      _id: 'cand_profile_default_2026',
      userId: String(candidateUser._id || candidateUser.id),
      name: candidateUser.name,
      email: candidateUser.email,
      phone: '',
      skills: ['Algorithms', 'Data Structures', 'JavaScript', 'Node.js', 'React']
    });
    console.log('[Database] Created default candidate profile: Candidate');
  } else {
    await Candidate.findByIdAndUpdate(candidateProfile._id || candidateProfile.id, {
      userId: String(candidateUser._id || candidateUser.id),
      name: candidateUser.name,
      email: candidateUser.email,
      skills: ['Algorithms', 'Data Structures', 'JavaScript', 'Node.js', 'React']
    });
  }

  // Ensure default pending session exists for candidate
  let defaultSession = await InterviewSession.findOne({
    candidateId: String(candidateProfile._id || candidateProfile.id),
    status: { $in: ['pending', 'in_progress'] }
  });

  if (!defaultSession) {
    const existingById = await InterviewSession.findById('sess_default_2026');
    if (!existingById) {
      defaultSession = await InterviewSession.create({
        _id: 'sess_default_2026',
        candidateId: String(candidateProfile._id || candidateProfile.id),
        interviewId: String(primaryInterview._id || primaryInterview.id),
        dynamicQuestions: generated.allQuestions,
        status: 'pending'
      });
      console.log('[Database] Created default active session for candidate: sess_default_2026');
    } else {
      defaultSession = await InterviewSession.findByIdAndUpdate(
        existingById._id || existingById.id,
        {
          candidateId: String(candidateProfile._id || candidateProfile.id),
          interviewId: String(primaryInterview._id || primaryInterview.id),
          dynamicQuestions: generated.allQuestions,
          status: 'pending'
        },
        { new: true }
      );
      console.log('[Database] Reset default active session for candidate: sess_default_2026');
    }
  }
}

if (require.main === module) {
  const { connectDB } = require('../config/db');
  (async () => {
    try {
      await connectDB();
      await initDatabase();
      console.log('[Database] Initialization completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('[Database Init Error]:', err);
      process.exit(1);
    }
  })();
}

module.exports = initDatabase;
