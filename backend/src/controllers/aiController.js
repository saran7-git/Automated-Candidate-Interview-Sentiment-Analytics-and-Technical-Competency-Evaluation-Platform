const { runAiEvaluation, aggregateSessionEvaluation } = require('../ai/aiPipeline');
const { generateFoundationAssessment } = require('../ai/dynamicQuestionGenerator');
const { processHrDialogueTurn } = require('../ai/hrConversationEngine');
const { evaluateCandidatePresence } = require('../ai/presenceEvaluationEngine');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');
const InterviewSession = require('../models/InterviewSession');
const Interview = require('../models/Interview');
const FinalReport = require('../models/FinalReport');

/**
 * Generate 2026 Foundation Assessment questions + Coding + AI HR for a candidate
 */
exports.generateQuestions = async (req, res, next) => {
  try {
    const { candidateId = 'candidate_default', seed } = req.body;
    const generated = generateFoundationAssessment(candidateId, seed);
    res.json({
      success: true,
      assessment: generated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Process Conversational Personal AI HR Turn (with intelligent counter-questioning)
 */
exports.handleHrDialogue = async (req, res, next) => {
  try {
    const {
      candidateAnswer,
      history = [],
      turnIndex = 0,
      jobRole = 'Full-Stack Software Engineer',
      sessionId
    } = req.body;

    const result = await processHrDialogueTurn({
      candidateAnswer,
      history,
      turnIndex,
      jobRole
    });

    // Optionally update session's hrConversationLog if sessionId provided
    if (sessionId) {
      try {
        const session = await InterviewSession.findById(sessionId);
        if (session) {
          const currentLog = Array.isArray(session.hrConversationLog) ? session.hrConversationLog : [];
          const updatedLog = [
            ...currentLog,
            { speaker: 'candidate', text: candidateAnswer, timestamp: new Date().toISOString() },
            {
              speaker: 'ai_hr',
              text: result.aiSpeechText,
              feedback: result.feedback,
              counterQuestion: result.counterQuestion,
              scores: {
                communication: result.communicationScore,
                attitude: result.attitudeScore,
                composure: result.composureScore
              },
              timestamp: new Date().toISOString()
            }
          ];
          await InterviewSession.findByIdAndUpdate(sessionId, { hrConversationLog: updatedLog });
        }
      } catch (logErr) {
        console.warn('[AI HR Log Update Notice]:', logErr.message);
      }
    }

    res.json({
      success: true,
      dialogue: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Evaluate Candidate Presence (Attire, Grooming, Attitude, Communication, Emotion)
 */
exports.evaluatePresence = async (req, res, next) => {
  try {
    const {
      voiceEmotionStats = {},
      malpracticeAudit = {},
      hrConversationLog = [],
      sessionId
    } = req.body;

    const presence = evaluateCandidatePresence({
      voiceEmotionStats,
      malpracticeAudit,
      hrConversationLog
    });

    if (sessionId) {
      await InterviewSession.findByIdAndUpdate(sessionId, { presenceEvaluation: presence });
    }

    res.json({
      success: true,
      presence
    });
  } catch (err) {
    next(err);
  }
};

exports.analyzeText = async (req, res, next) => {
  try {
    const {
      candidateAnswer,
      questionText,
      expectedAnswer,
      keywords,
      category,
      maxScore
    } = req.body;

    if (!candidateAnswer) {
      return res.status(400).json({ success: false, message: 'Candidate answer is required' });
    }

    const result = await runAiEvaluation({
      candidateAnswer,
      questionText,
      expectedAnswer,
      keywords,
      category,
      maxScore
    });

    res.json({ success: true, evaluation: result });
  } catch (err) {
    next(err);
  }
};

exports.analyzeResponse = async (req, res, next) => {
  try {
    const responseId = req.params.responseId;
    const response = await Response.findById(responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    const session = await InterviewSession.findById(response.sessionId);
    const interview = session ? await Interview.findById(session.interviewId) : null;
    const qDef = (interview?.questions || []).find(q => String(q._id || q.id) === String(response.questionId)) || {};

    const aiResult = await runAiEvaluation({
      candidateAnswer: response.candidateAnswer,
      questionText: response.questionText || qDef.question,
      expectedAnswer: response.expectedAnswer || qDef.expectedAnswer,
      keywords: response.keywords || qDef.keywords,
      category: response.questionCategory || qDef.category,
      maxScore: qDef.maxScore || 10
    });

    let evaluation = await Evaluation.findOne({ responseId: String(responseId) });
    if (evaluation) {
      evaluation = await Evaluation.findByIdAndUpdate(
        evaluation._id || evaluation.id,
        {
          sessionId: String(response.sessionId),
          candidateId: String(response.candidateId || (session ? session.candidateId : '')),
          questionId: String(response.questionId),
          questionCategory: response.questionCategory || qDef.category || 'General Technical',
          ...aiResult
        },
        { new: true }
      );
    } else {
      evaluation = await Evaluation.create({
        responseId: String(responseId),
        sessionId: String(response.sessionId),
        candidateId: String(response.candidateId || (session ? session.candidateId : '')),
        questionId: String(response.questionId),
        questionCategory: response.questionCategory || qDef.category || 'General Technical',
        ...aiResult
      });
    }

    res.json({ success: true, evaluation });
  } catch (err) {
    next(err);
  }
};

exports.analyzeSession = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const interview = await Interview.findById(session.interviewId);
    const responses = await Response.find({ sessionId: String(sessionId) });

    if (responses.length === 0) {
      return res.status(400).json({ success: false, message: 'No responses found in this session to analyze' });
    }

    const evaluations = [];

    for (const resp of responses) {
      const respId = String(resp._id || resp.id);
      const qDef = (interview?.questions || []).find(q => String(q._id || q.id) === String(resp.questionId)) || {};

      const aiResult = await runAiEvaluation({
        candidateAnswer: resp.candidateAnswer,
        questionText: resp.questionText || qDef.question,
        expectedAnswer: resp.expectedAnswer || qDef.expectedAnswer,
        keywords: resp.keywords || qDef.keywords,
        category: resp.questionCategory || qDef.category,
        maxScore: qDef.maxScore || 10
      });

      let evaluation = await Evaluation.findOne({ responseId: respId });
      if (evaluation) {
        evaluation = await Evaluation.findByIdAndUpdate(
          evaluation._id || evaluation.id,
          {
            sessionId: String(sessionId),
            candidateId: String(session.candidateId),
            questionId: String(resp.questionId),
            questionCategory: resp.questionCategory || qDef.category || 'General Technical',
            ...aiResult
          },
          { new: true }
        );
      } else {
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

    const aggregated = aggregateSessionEvaluation(evaluations);

    // Also synthesize presence evaluation
    const presence = evaluateCandidatePresence({
      voiceEmotionStats: session.voiceEmotionStats || {},
      malpracticeAudit: {
        tabSwitches: session.proctoringWarnings || 0,
        eyeAwayWarnings: session.proctoringWarnings || 0,
        totalAttempts: session.proctoringWarnings || 0
      },
      hrConversationLog: session.hrConversationLog || []
    });
    await InterviewSession.findByIdAndUpdate(sessionId, { presenceEvaluation: presence });

    let finalReport = await FinalReport.findOne({ sessionId: String(sessionId) });
    if (finalReport) {
      finalReport = await FinalReport.findByIdAndUpdate(
        finalReport._id || finalReport.id,
        {
          candidateId: String(session.candidateId),
          interviewId: String(session.interviewId),
          ...aggregated
        },
        { new: true }
      );
    } else {
      finalReport = await FinalReport.create({
        sessionId: String(sessionId),
        candidateId: String(session.candidateId),
        interviewId: String(session.interviewId),
        ...aggregated
      });
    }

    // Ensure session is marked completed
    await InterviewSession.findByIdAndUpdate(sessionId, { status: 'completed' });

    res.json({
      success: true,
      message: 'AI analysis and evaluation pipeline completed successfully',
      evaluations,
      report: finalReport
    });
  } catch (err) {
    next(err);
  }
};
