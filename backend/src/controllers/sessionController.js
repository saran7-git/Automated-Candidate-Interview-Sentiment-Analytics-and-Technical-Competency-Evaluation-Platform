const InterviewSession = require('../models/InterviewSession');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');
const FinalReport = require('../models/FinalReport');
const { runAiEvaluation, aggregateSessionEvaluation } = require('../ai/aiPipeline');

exports.create = async (req, res, next) => {
  try {
    const { candidateId, interviewId } = req.body;

    if (!candidateId || !interviewId) {
      return res.status(400).json({ success: false, message: 'Candidate ID and Interview ID are required' });
    }

    const session = await InterviewSession.create({
      candidateId,
      interviewId,
      status: 'pending'
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const interview = await Interview.findById(session.interviewId);
    const candidate = await Candidate.findById(session.candidateId);
    const responses = await Response.find({ sessionId: String(session._id || session.id) });
    const finalReport = await FinalReport.findOne({ sessionId: String(session._id || session.id) });

    res.json({
      success: true,
      session: {
        ...session,
        interview: interview || null,
        candidate: candidate || null,
        responses: responses || [],
        finalReport: finalReport || null
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getByCandidate = async (req, res, next) => {
  try {
    const candidateId = req.params.candidateId;
    const sessions = await InterviewSession.find({ candidateId: String(candidateId) });
    const interviews = await Interview.find();
    const reports = await FinalReport.find({ candidateId: String(candidateId) });

    const enriched = sessions.map(s => {
      const sId = String(s._id || s.id);
      const intr = interviews.find(i => String(i._id || i.id) === String(s.interviewId));
      const rpt = reports.find(r => String(r.sessionId) === sId);
      return {
        ...s,
        interviewTitle: intr ? intr.title : 'Interview',
        jobRole: intr ? intr.jobRole : 'Technical Role',
        duration: intr ? intr.duration : 30,
        totalQuestions: intr ? (intr.questions || []).length : 0,
        report: rpt || null
      };
    });

    res.json({ success: true, sessions: enriched });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const session = await InterviewSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.startSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const updated = await InterviewSession.findByIdAndUpdate(
      req.params.id,
      {
        status: 'in_progress',
        startedAt: session.startedAt || new Date().toISOString()
      },
      { new: true }
    );

    res.json({ success: true, session: updated });
  } catch (err) {
    next(err);
  }
};

exports.submit = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const interview = await Interview.findById(session.interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Associated interview template not found' });
    }

    // Save any answers passed directly in submission payload
    if (req.body.answers && Array.isArray(req.body.answers)) {
      for (const ans of req.body.answers) {
        const existingResp = await Response.findOne({
          sessionId: String(sessionId),
          questionId: String(ans.questionId)
        });

        const qDef = (interview.questions || []).find(q => String(q._id || q.id) === String(ans.questionId)) || {};

        if (existingResp) {
          await Response.findByIdAndUpdate(existingResp._id || existingResp.id, {
            candidateAnswer: ans.candidateAnswer || '',
            questionCategory: qDef.category || 'General Technical',
            questionText: qDef.question || '',
            expectedAnswer: qDef.expectedAnswer || '',
            keywords: qDef.keywords || []
          });
        } else {
          await Response.create({
            sessionId: String(sessionId),
            questionId: String(ans.questionId),
            candidateId: String(session.candidateId),
            candidateAnswer: ans.candidateAnswer || '',
            questionCategory: qDef.category || 'General Technical',
            questionText: qDef.question || '',
            expectedAnswer: qDef.expectedAnswer || '',
            keywords: qDef.keywords || []
          });
        }
      }
    }

    // Mark session as completed
    await InterviewSession.findByIdAndUpdate(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    // Run AI Evaluation Pipeline for each response
    const responses = await Response.find({ sessionId: String(sessionId) });
    const evaluations = [];

    for (const resp of responses) {
      const respId = String(resp._id || resp.id);
      let evaluation = await Evaluation.findOne({ responseId: respId });

      if (!evaluation) {
        const qDef = (interview.questions || []).find(q => String(q._id || q.id) === String(resp.questionId)) || {};

        const aiResult = await runAiEvaluation({
          candidateAnswer: resp.candidateAnswer,
          questionText: resp.questionText || qDef.question,
          expectedAnswer: resp.expectedAnswer || qDef.expectedAnswer,
          keywords: resp.keywords || qDef.keywords,
          category: resp.questionCategory || qDef.category,
          maxScore: qDef.maxScore || 10
        });

        evaluation = await Evaluation.create({
          responseId: respId,
          sessionId: String(sessionId),
          candidateId: String(session.candidateId),
          questionId: String(resp.questionId),
          questionCategory: resp.questionCategory || qDef.category || 'General Technical',
          ...aiResult
        });
      }
      evaluations.push(evaluation);
    }

    // Aggregate overall scores and generate final report
    const aggregated = aggregateSessionEvaluation(evaluations);

    let finalReport = await FinalReport.findOne({ sessionId: String(sessionId) });
    if (finalReport) {
      finalReport = await FinalReport.findByIdAndUpdate(finalReport._id || finalReport.id, {
        candidateId: String(session.candidateId),
        interviewId: String(session.interviewId),
        ...aggregated
      }, { new: true });
    } else {
      finalReport = await FinalReport.create({
        sessionId: String(sessionId),
        candidateId: String(session.candidateId),
        interviewId: String(session.interviewId),
        ...aggregated
      });
    }

    res.json({
      success: true,
      message: 'Interview submitted successfully and AI evaluation completed',
      sessionId,
      status: 'completed',
      report: finalReport
    });
  } catch (err) {
    next(err);
  }
};
