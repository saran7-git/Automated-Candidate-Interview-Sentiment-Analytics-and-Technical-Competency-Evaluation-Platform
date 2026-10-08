const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const InterviewSession = require('../models/InterviewSession');
const FinalReport = require('../models/FinalReport');
const Evaluation = require('../models/Evaluation');
const Response = require('../models/Response');

exports.getStatistics = async (req, res, next) => {
  try {
    const candidates = await Candidate.find();
    const interviews = await Interview.find();
    const sessions = await InterviewSession.find();
    const reports = await FinalReport.find();
    const evaluations = await Evaluation.find();

    const totalCandidates = candidates.length;
    const totalInterviews = interviews.length;
    const completedInterviews = sessions.filter(s => s.status === 'completed').length;
    const pendingInterviews = sessions.filter(s => s.status !== 'completed').length;

    // Average Technical and Sentiment Scores
    let sumTech = 0;
    let sumSent = 0;
    let sumOverall = 0;
    let scoreCount = reports.length;

    for (const r of reports) {
      sumTech += r.technicalScore || 0;
      sumSent += r.sentimentScore || 0;
      sumOverall += r.overallScore || 0;
    }

    const avgTechnical = scoreCount > 0 ? Number((sumTech / scoreCount).toFixed(1)) : 0;
    const avgSentiment = scoreCount > 0 ? Number((sumSent / scoreCount).toFixed(1)) : 0;
    const avgOverall = scoreCount > 0 ? Number((sumOverall / scoreCount).toFixed(1)) : 0;

    // Sentiment Distribution across all evaluated answers
    let positiveAnswers = 0;
    let neutralAnswers = 0;
    let negativeAnswers = 0;
    const totalEvaluated = evaluations.length;

    for (const ev of evaluations) {
      if (ev.sentiment === 'Positive') positiveAnswers++;
      else if (ev.sentiment === 'Negative') negativeAnswers++;
      else neutralAnswers++;
    }

    const sentimentDistribution = [
      {
        name: 'Positive',
        count: positiveAnswers,
        percentage: totalEvaluated > 0 ? Math.round((positiveAnswers / totalEvaluated) * 100) : 0,
        color: '#10b981'
      },
      {
        name: 'Neutral',
        count: neutralAnswers,
        percentage: totalEvaluated > 0 ? Math.round((neutralAnswers / totalEvaluated) * 100) : 0,
        color: '#f59e0b'
      },
      {
        name: 'Negative',
        count: negativeAnswers,
        percentage: totalEvaluated > 0 ? Math.round((negativeAnswers / totalEvaluated) * 100) : 0,
        color: '#ef4444'
      }
    ];

    // Technical Competency Distribution (Excellent, Good, Average, Needs Improvement)
    let excellentCount = 0; // >= 80
    let goodCount = 0;      // 70 - 79
    let averageCount = 0;   // 50 - 69
    let needsImprovementCount = 0; // < 50

    for (const r of reports) {
      const score = r.technicalScore || 0;
      if (score >= 80) excellentCount++;
      else if (score >= 70) goodCount++;
      else if (score >= 50) averageCount++;
      else needsImprovementCount++;
    }

    const technicalDistribution = [
      { tier: 'Excellent (80-100)', count: excellentCount, color: '#10b981' },
      { tier: 'Good (70-79)', count: goodCount, color: '#3b82f6' },
      { tier: 'Average (50-69)', count: averageCount, color: '#f59e0b' },
      { tier: 'Needs Improvement (<50)', count: needsImprovementCount, color: '#ef4444' }
    ];

    // Category Competency Analysis across all evaluations
    const categoryTotals = {};
    for (const ev of evaluations) {
      const cat = ev.questionCategory || 'General Technical';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { sum: 0, count: 0 };
      }
      categoryTotals[cat].sum += ev.technicalScore || 0;
      categoryTotals[cat].count += 1;
    }

    const categoryPerformance = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      averageScore: Math.round(categoryTotals[cat].sum / categoryTotals[cat].count),
      evaluationsCount: categoryTotals[cat].count
    })).sort((a, b) => b.averageScore - a.averageScore);

    // Recent Candidate performance records
    const recentCandidates = reports.map(r => {
      const sess = sessions.find(s => String(s._id || s.id) === String(r.sessionId));
      const cand = sess ? candidates.find(c => String(c._id || c.id) === String(sess.candidateId)) : null;
      const intr = sess ? interviews.find(i => String(i._id || i.id) === String(sess.interviewId)) : null;

      return {
        sessionId: r.sessionId,
        candidateId: cand ? (cand._id || cand.id) : null,
        name: cand ? cand.name : 'Candidate',
        email: cand ? cand.email : '',
        interview: intr ? intr.title : 'Technical Interview',
        technicalScore: r.technicalScore,
        sentimentScore: r.sentimentScore,
        overallScore: r.overallScore,
        recommendation: r.recommendation,
        date: r.createdAt
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Top Performing Candidates (highest overall score)
    const topCandidates = [...recentCandidates]
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);

    res.json({
      success: true,
      statistics: {
        totalCandidates,
        totalInterviews,
        completedInterviews,
        pendingInterviews,
        averageTechnicalScore: avgTechnical,
        averageSentimentScore: avgSentiment,
        averageOverallScore: avgOverall,
        sentimentDistribution,
        technicalDistribution,
        categoryPerformance,
        topCandidates,
        recentCandidates: recentCandidates.slice(0, 8)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.compareCandidates = async (req, res, next) => {
  try {
    const { sessionIds = [] } = req.body;

    if (!Array.isArray(sessionIds) || sessionIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least two session IDs for candidate comparison.'
      });
    }

    const comparisonData = [];
    for (const sid of sessionIds) {
      const session = await InterviewSession.findById(sid);
      if (!session) continue;

      const candidate = await Candidate.findById(session.candidateId);
      const interview = await Interview.findById(session.interviewId);
      const report = await FinalReport.findOne({ sessionId: String(sid) });
      const evaluations = await Evaluation.find({ sessionId: String(sid) });

      if (report && candidate) {
        comparisonData.push({
          sessionId: sid,
          candidateName: candidate.name,
          email: candidate.email,
          interviewTitle: interview ? interview.title : 'Interview',
          jobRole: interview ? interview.jobRole : 'Technical Role',
          overallScore: report.overallScore,
          technicalScore: report.technicalScore,
          sentimentScore: report.sentimentScore,
          recommendation: report.recommendation,
          categoryScores: report.categoryScores || {},
          technicalMetrics: report.technicalMetrics || {},
          sentimentStats: report.sentimentStats || {},
          strengthsCount: (report.aiStrengths || []).length,
          strengths: report.aiStrengths || [],
          weaknesses: report.aiWeaknesses || []
        });
      }
    }

    res.json({ success: true, comparison: comparisonData });
  } catch (err) {
    next(err);
  }
};
