const FinalReport = require('../models/FinalReport');
const InterviewSession = require('../models/InterviewSession');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');

exports.getBySession = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const candidate = await Candidate.findById(session.candidateId);
    const interview = await Interview.findById(session.interviewId);
    const report = await FinalReport.findOne({ sessionId: String(sessionId) });

    const responses = await Response.find({ sessionId: String(sessionId) });
    const evaluations = await Evaluation.find({ sessionId: String(sessionId) });

    // Build question-by-question detailed analysis
    const questions = interview?.questions || [];
    const questionEvaluations = questions.map((q, index) => {
      const qId = String(q._id || q.id);
      const resp = responses.find(r => String(r.questionId) === qId);
      const ev = resp ? evaluations.find(e => String(e.responseId) === String(resp._id || resp.id)) : null;

      return {
        questionNumber: index + 1,
        questionId: qId,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        maxScore: q.maxScore || 10,
        expectedAnswer: q.expectedAnswer,
        keywords: q.keywords || [],
        candidateAnswer: resp ? resp.candidateAnswer : 'No answer submitted',
        submittedAt: resp ? resp.timestamp : null,
        evaluation: ev || {
          sentiment: 'Neutral',
          sentimentConfidence: 0.5,
          sentimentProbabilities: { positive: 0.2, neutral: 0.6, negative: 0.2 },
          sentimentScore: 50,
          technicalScore: 0,
          relevanceScore: 0,
          correctnessScore: 0,
          conceptCoverageScore: 0,
          completenessScore: 0,
          overallAnswerScore: 0,
          detectedConcepts: [],
          missingConcepts: q.keywords || [],
          strengths: [],
          weaknesses: ['Answer not provided'],
          feedback: 'No evaluation generated yet.'
        }
      };
    });

    // Generate timeline data for sentiment trend across questions
    const sentimentTimeline = questionEvaluations.map(qe => ({
      question: `Q${qe.questionNumber}`,
      category: qe.category,
      sentimentScore: qe.evaluation.sentimentScore,
      technicalScore: qe.evaluation.technicalScore,
      sentiment: qe.evaluation.sentiment,
      confidence: qe.evaluation.sentimentConfidence
    }));

    res.json({
      success: true,
      report: {
        session: {
          id: String(session._id || session.id),
          status: session.status,
          malpracticeReason: session.malpracticeReason || null,
          disqualifiedAt: session.disqualifiedAt || null,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          createdAt: session.createdAt
        },
        candidate: candidate ? {
          id: String(candidate._id || candidate.id),
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          skills: candidate.skills,
          resume: candidate.resume
        } : null,
        interview: interview ? {
          id: String(interview._id || interview.id),
          title: interview.title,
          jobRole: interview.jobRole,
          description: interview.description,
          duration: interview.duration,
          difficulty: interview.difficulty,
          totalQuestions: questions.length
        } : null,
        overallEvaluation: report || {
          technicalScore: 0,
          sentimentScore: 0,
          overallScore: 0,
          recommendation: 'Pending Evaluation',
          summary: 'Session awaiting submission and AI evaluation.',
          categoryScores: {},
          sentimentStats: {
            totalAnswers: responses.length,
            positiveAnswers: 0,
            neutralAnswers: 0,
            negativeAnswers: 0,
            positivePercentage: 0,
            neutralPercentage: 0,
            negativePercentage: 0,
            averageConfidence: 0
          },
          technicalMetrics: {
            averageRelevance: 0,
            averageCorrectness: 0,
            averageConceptCoverage: 0,
            averageCompleteness: 0
          },
          aiStrengths: [],
          aiWeaknesses: []
        },
        questionEvaluations,
        sentimentTimeline
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
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'No interview sessions found for candidate' });
    }

    // Get the latest completed session or simply the latest session
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const targetSession = completedSessions.length > 0
      ? completedSessions[completedSessions.length - 1]
      : sessions[sessions.length - 1];

    req.params.sessionId = String(targetSession._id || targetSession.id);
    return exports.getBySession(req, res, next);
  } catch (err) {
    next(err);
  }
};
