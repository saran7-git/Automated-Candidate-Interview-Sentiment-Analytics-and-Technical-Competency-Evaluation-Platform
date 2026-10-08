const Interview = require('../models/Interview');
const Question = require('../models/Question');
const InterviewSession = require('../models/InterviewSession');

exports.getAll = async (req, res, next) => {
  try {
    const interviews = await Interview.find();
    const sessions = await InterviewSession.find();

    const enriched = interviews.map(i => {
      const iId = String(i._id || i.id);
      const sessionCount = sessions.filter(s => String(s.interviewId) === iId).length;
      return {
        ...i,
        totalQuestions: (i.questions || []).length,
        candidateCount: sessionCount
      };
    });

    res.json({ success: true, interviews: enriched });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session template not found' });
    }
    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, jobRole, description, duration = 30, difficulty = 'Intermediate', questions = [] } = req.body;

    if (!title || !jobRole) {
      return res.status(400).json({ success: false, message: 'Interview title and target job role are required' });
    }

    // Process questions with unique identifiers and defaults
    const processedQuestions = questions.map((q, idx) => ({
      _id: q._id || `q_${Date.now()}_${idx}`,
      id: q._id || `q_${Date.now()}_${idx}`,
      question: q.question || '',
      category: q.category || 'General Technical',
      difficulty: q.difficulty || 'Medium',
      expectedAnswer: q.expectedAnswer || '',
      keywords: Array.isArray(q.keywords)
        ? q.keywords
        : typeof q.keywords === 'string'
        ? q.keywords.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      maxScore: Number(q.maxScore) || 10
    }));

    const interview = await Interview.create({
      title,
      jobRole,
      description: description || '',
      duration: Number(duration) || 30,
      difficulty,
      questions: processedQuestions,
      createdBy: req.user ? req.user.name : 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      interview
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { questions, ...rest } = req.body;
    let updateData = { ...rest };

    if (questions) {
      updateData.questions = questions.map((q, idx) => ({
        _id: q._id || q.id || `q_${Date.now()}_${idx}`,
        id: q._id || q.id || `q_${Date.now()}_${idx}`,
        question: q.question,
        category: q.category || 'General Technical',
        difficulty: q.difficulty || 'Medium',
        expectedAnswer: q.expectedAnswer || '',
        keywords: Array.isArray(q.keywords)
          ? q.keywords
          : typeof q.keywords === 'string'
          ? q.keywords.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        maxScore: Number(q.maxScore) || 10
      }));
    }

    const interview = await Interview.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, message: 'Interview updated successfully', interview });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, message: 'Interview deleted successfully' });
  } catch (err) {
    next(err);
  }
};
