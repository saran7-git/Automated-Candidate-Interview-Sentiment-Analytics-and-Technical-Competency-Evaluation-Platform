const InterviewSession = require('../models/InterviewSession');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');
const FinalReport = require('../models/FinalReport');
const { runAiEvaluation, aggregateSessionEvaluation } = require('../ai/aiPipeline');
const { evaluateCandidatePresence } = require('../ai/presenceEvaluationEngine');

exports.create = async (req, res, next) => {
  try {
    const { candidateId, interviewId, dynamicQuestions = [] } = req.body;

    if (!candidateId || !interviewId) {
      return res.status(400).json({ success: false, message: 'Candidate ID and Interview ID are required' });
    }

    const session = await InterviewSession.create({
      candidateId,
      interviewId,
      dynamicQuestions,
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

    let interview = await Interview.findById(session.interviewId);
    if (!interview) {
      const allInterviews = await Interview.find();
      if (allInterviews.length > 0) {
        interview = allInterviews[0];
        await InterviewSession.findByIdAndUpdate(session._id || session.id, {
          interviewId: String(interview._id || interview.id)
        });
      }
    }

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
    let sessions = await InterviewSession.find({ candidateId: String(candidateId) });
    const interviews = await Interview.find();

    // Auto-create session if candidate has none
    if (sessions.length === 0 && interviews.length > 0) {
      const newSess = await InterviewSession.create({
        candidateId: String(candidateId),
        interviewId: String(interviews[0]._id || interviews[0].id),
        status: 'pending'
      });
      sessions = [newSess];
    }

    const reports = await FinalReport.find({ candidateId: String(candidateId) });

    const enriched = sessions.map(s => {
      const sId = String(s._id || s.id);
      let intr = interviews.find(i => String(i._id || i.id) === String(s.interviewId));
      if (!intr && interviews.length > 0) intr = interviews[0];
      const rpt = reports.find(r => String(r.sessionId) === sId);
      return {
        ...s,
        interviewTitle: intr ? intr.title : '2026 Foundation Assessment',
        jobRole: intr ? intr.jobRole : 'Software Engineer',
        duration: intr ? intr.duration : 75,
        totalQuestions: s.dynamicQuestions?.length || (intr ? (intr.questions || []).length : 65),
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

exports.saveRecording = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const { recordingUrl, recordingDuration = 0 } = req.body;

    const session = await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        recordingUrl: recordingUrl || '',
        recordingDuration: Number(recordingDuration) || 0
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.saveHrTurn = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const { turn } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const currentLog = Array.isArray(session.hrConversationLog) ? session.hrConversationLog : [];
    const updatedLog = [...currentLog, { ...turn, timestamp: new Date().toISOString() }];

    const updated = await InterviewSession.findByIdAndUpdate(
      sessionId,
      { hrConversationLog: updatedLog },
      { new: true }
    );

    res.json({ success: true, session: updated });
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

    const updatePayload = {
      status: 'in_progress',
      startedAt: session.startedAt || new Date().toISOString()
    };

    if (req.body.dynamicQuestions && Array.isArray(req.body.dynamicQuestions)) {
      updatePayload.dynamicQuestions = req.body.dynamicQuestions;
    }

    const updated = await InterviewSession.findByIdAndUpdate(
      req.params.id,
      updatePayload,
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

    let interview = await Interview.findById(session.interviewId);
    if (!interview) {
      const allIntr = await Interview.find();
      if (allIntr.length > 0) interview = allIntr[0];
    }

    const questionsList = (session.dynamicQuestions && session.dynamicQuestions.length > 0)
      ? session.dynamicQuestions
      : (interview?.questions || []);

    const {
      answers = [],
      voiceEmotionStats = {},
      recordingUrl = '',
      recordingDuration = 0,
      malpracticeAudit = {}
    } = req.body;

    // Save answers
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const qDef = questionsList.find(q => String(q._id || q.id) === String(ans.questionId)) || {};

        const existingResp = await Response.findOne({
          sessionId: String(sessionId),
          questionId: String(ans.questionId)
        });

        if (existingResp) {
          await Response.findByIdAndUpdate(existingResp._id || existingResp.id, {
            candidateAnswer: ans.candidateAnswer || '',
            questionCategory: qDef.category || qDef.roundTitle || 'General',
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
            questionCategory: qDef.category || qDef.roundTitle || 'General',
            questionText: qDef.question || '',
            expectedAnswer: qDef.expectedAnswer || '',
            keywords: qDef.keywords || []
          });
        }
      }
    }

    // Evaluate Presence
    const presence = evaluateCandidatePresence({
      voiceEmotionStats: voiceEmotionStats || session.voiceEmotionStats || {},
      malpracticeAudit: malpracticeAudit || { tabSwitches: 0, eyeAwayWarnings: 0, totalAttempts: 0 },
      hrConversationLog: session.hrConversationLog || []
    });

    // Mark session completed and persist recording & presence
    await InterviewSession.findByIdAndUpdate(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      recordingUrl: recordingUrl || session.recordingUrl || '',
      recordingDuration: recordingDuration || session.recordingDuration || 75,
      presenceEvaluation: presence
    });

    // Run AI Evaluation Pipeline for each response
    const responses = await Response.find({ sessionId: String(sessionId) });
    const evaluations = [];

    for (const resp of responses) {
      const respId = String(resp._id || resp.id);
      let evaluation = await Evaluation.findOne({ responseId: respId });

      if (!evaluation) {
        const qDef = questionsList.find(q => String(q._id || q.id) === String(resp.questionId)) || {};

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

    const reportPayload = {
      candidateId: String(session.candidateId),
      interviewId: String(session.interviewId || (interview ? (interview._id || interview.id) : '')),
      ...aggregated,
      voiceEmotionStats: voiceEmotionStats || {
        primaryEmotion: 'Confident & Articulate',
        confidenceScore: 88,
        composureScore: 90,
        hesitationIndex: 10,
        speechPace: 'Measured & Clear'
      },
      malpracticeAudit: {
        totalAttempts: malpracticeAudit.totalAttempts || session.proctoringWarnings || 0,
        tabSwitches: malpracticeAudit.tabSwitches || 0,
        eyeAwayWarnings: malpracticeAudit.eyeAwayWarnings || 0,
        proctoringPassed: true
      }
    };

    let finalReport = await FinalReport.findOne({ sessionId: String(sessionId) });
    if (finalReport) {
      finalReport = await FinalReport.findByIdAndUpdate(finalReport._id || finalReport.id, reportPayload, { new: true });
    } else {
      finalReport = await FinalReport.create({
        sessionId: String(sessionId),
        ...reportPayload
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

exports.terminate = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const {
      reason = 'Malpractice / integrity violation detected by proctoring engine',
      violationType = 'PROCTORING_INFRACTION',
      totalAttempts = 10,
      totalTabSwitches = 0
    } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const updatedSession = await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        status: 'disqualified',
        malpracticeReason: reason,
        proctoringWarnings: Number(totalAttempts) || 10,
        disqualifiedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      { new: true }
    );

    // Save final report with 0 score and disqualification
    let finalReport = await FinalReport.findOne({ sessionId: String(sessionId) });
    const reportPayload = {
      sessionId: String(sessionId),
      candidateId: String(session.candidateId),
      interviewId: String(session.interviewId),
      technicalScore: 0,
      sentimentScore: 0,
      overallScore: 0,
      recommendation: 'Disqualified (Malpractice)',
      summary: `ASSESSMENT TERMINATED: Malpractice violation detected by AI proctoring monitor (${violationType}). Details: ${reason}. Total recorded attempts: ${totalAttempts}. The candidate has been disqualified.`,
      aiStrengths: [],
      aiWeaknesses: [
        `Assessment terminated for malpractice: ${reason}`,
        `Violation Category: ${violationType}`,
        `Total Malpractice Attempts: ${totalAttempts}`
      ],
      sentimentStats: {
        totalAnswers: 0,
        positiveAnswers: 0,
        neutralAnswers: 0,
        negativeAnswers: 0,
        positivePercentage: 0,
        neutralPercentage: 0,
        negativePercentage: 100,
        averageConfidence: 0
      },
      technicalMetrics: {
        averageRelevance: 0,
        averageCorrectness: 0,
        averageConceptCoverage: 0,
        averageCompleteness: 0
      },
      voiceEmotionStats: {
        primaryEmotion: 'Terminated / Disqualified',
        confidenceScore: 0,
        composureScore: 0,
        hesitationIndex: 100,
        speechPace: 'N/A'
      },
      malpracticeAudit: {
        totalAttempts: Number(totalAttempts) || 10,
        tabSwitches: Number(totalTabSwitches) || 0,
        eyeAwayWarnings: violationType.includes('EYE') ? 1 : 0,
        proctoringPassed: false
      }
    };

    if (finalReport) {
      finalReport = await FinalReport.findByIdAndUpdate(finalReport._id || finalReport.id, reportPayload, { new: true });
    } else {
      finalReport = await FinalReport.create(reportPayload);
    }

    res.json({
      success: true,
      message: 'Assessment terminated immediately due to malpractice violation',
      session: updatedSession,
      report: finalReport
    });
  } catch (err) {
    next(err);
  }
};
