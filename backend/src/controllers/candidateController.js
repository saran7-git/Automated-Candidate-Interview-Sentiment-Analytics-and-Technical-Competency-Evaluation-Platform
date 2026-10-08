const bcrypt = require('bcryptjs');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const Interview = require('../models/Interview');
const FinalReport = require('../models/FinalReport');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');

exports.getAll = async (req, res, next) => {
  try {
    const candidates = await Candidate.find();
    const sessions = await InterviewSession.find();
    const interviews = await Interview.find();
    const reports = await FinalReport.find();

    const candidateRows = candidates.map(c => {
      const cId = String(c._id || c.id);
      // Find latest session for this candidate
      const candSessions = sessions.filter(s => String(s.candidateId) === cId);
      const latestSession = candSessions[candSessions.length - 1] || null;

      let interviewTitle = 'Unassigned';
      let status = 'Pending';
      let technicalScore = null;
      let sentimentScore = null;
      let overallScore = null;
      let sentimentLabel = 'N/A';
      let sessionId = null;

      if (latestSession) {
        sessionId = latestSession._id || latestSession.id;
        const intr = interviews.find(i => String(i._id || i.id) === String(latestSession.interviewId));
        if (intr) interviewTitle = intr.title;

        status = latestSession.status === 'completed'
          ? 'Completed'
          : latestSession.status === 'in_progress'
          ? 'In Progress'
          : 'Pending';

        const report = reports.find(r => String(r.sessionId) === String(sessionId));
        if (report) {
          technicalScore = report.technicalScore;
          sentimentScore = report.sentimentScore;
          overallScore = report.overallScore;
          sentimentLabel = report.sentimentScore >= 80 ? 'Positive' : report.sentimentScore >= 40 ? 'Neutral' : 'Negative';
        }
      }

      return {
        id: cId,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        skills: c.skills || [],
        interview: interviewTitle,
        interviewId: latestSession ? latestSession.interviewId : null,
        sessionId,
        technicalScore,
        sentimentScore,
        sentimentLabel,
        overallScore,
        status,
        date: c.createdAt
      };
    });

    res.json({ success: true, candidates: candidateRows });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const sessions = await InterviewSession.find({ candidateId: String(candidate._id || candidate.id) });
    const interviews = await Interview.find();
    const reports = await FinalReport.find({ candidateId: String(candidate._id || candidate.id) });

    const enrichedSessions = sessions.map(s => {
      const sId = String(s._id || s.id);
      const intr = interviews.find(i => String(i._id || i.id) === String(s.interviewId));
      const report = reports.find(r => String(r.sessionId) === sId);
      return {
        ...s,
        interviewTitle: intr ? intr.title : 'Unknown Interview',
        report: report || null
      };
    });

    res.json({
      success: true,
      candidate: {
        ...candidate,
        sessions: enrichedSessions
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password = 'Password@123', interviewId, phone, skills, resume } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'candidate'
      });
    }

    const candidate = await Candidate.create({
      userId: user._id || user.id,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      resume: resume || '',
      skills: Array.isArray(skills) ? skills : []
    });

    let assignedSession = null;
    if (interviewId) {
      assignedSession = await InterviewSession.create({
        candidateId: candidate._id || candidate.id,
        interviewId,
        status: 'pending'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Candidate created and enrolled successfully',
      candidate,
      session: assignedSession
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, candidate });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const candidateId = req.params.id;
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Cascade delete candidate's sessions, responses, evaluations, reports
    const sessions = await InterviewSession.find({ candidateId: String(candidateId) });
    const sessionIds = sessions.map(s => String(s._id || s.id));

    for (const sid of sessionIds) {
      await Response.deleteMany({ sessionId: sid });
      await Evaluation.deleteMany({ sessionId: sid });
      await FinalReport.deleteMany({ sessionId: sid });
      await InterviewSession.findByIdAndDelete(sid);
    }

    await Candidate.findByIdAndDelete(candidateId);
    if (candidate.userId) {
      await User.findByIdAndDelete(candidate.userId);
    }

    res.json({ success: true, message: 'Candidate and all associated interview data deleted successfully' });
  } catch (err) {
    next(err);
  }
};
