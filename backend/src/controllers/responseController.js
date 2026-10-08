const Response = require('../models/Response');
const Interview = require('../models/Interview');
const InterviewSession = require('../models/InterviewSession');

exports.create = async (req, res, next) => {
  try {
    const { sessionId, questionId, candidateAnswer } = req.body;

    if (!sessionId || !questionId) {
      return res.status(400).json({ success: false, message: 'Session ID and Question ID are required' });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const interview = await Interview.findById(session.interviewId);
    const qDef = (interview?.questions || []).find(q => String(q._id || q.id) === String(questionId)) || {};

    const existing = await Response.findOne({
      sessionId: String(sessionId),
      questionId: String(questionId)
    });

    let savedResponse;
    if (existing) {
      savedResponse = await Response.findByIdAndUpdate(
        existing._id || existing.id,
        {
          candidateAnswer: candidateAnswer || '',
          timestamp: new Date().toISOString()
        },
        { new: true }
      );
    } else {
      savedResponse = await Response.create({
        sessionId: String(sessionId),
        questionId: String(questionId),
        candidateId: String(session.candidateId),
        candidateAnswer: candidateAnswer || '',
        questionCategory: qDef.category || 'General Technical',
        questionText: qDef.question || '',
        expectedAnswer: qDef.expectedAnswer || '',
        keywords: qDef.keywords || [],
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, response: savedResponse });
  } catch (err) {
    next(err);
  }
};

exports.getBySession = async (req, res, next) => {
  try {
    const responses = await Response.find({ sessionId: String(req.params.sessionId) });
    res.json({ success: true, responses });
  } catch (err) {
    next(err);
  }
};
