import { User } from '../models/User.js';
import { Interview } from '../models/Interview.js';
import { Question } from '../models/Question.js';

/**
 * Get Candidate Dashboard Metrics
 * GET /api/dashboard/candidate
 */
export const getCandidateDashboard = async (req, res, next) => {
  try {
    const candidateId = req.user._id;

    const interviews = await Interview.find({ candidateId }).sort({ createdAt: -1 });
    const completed = interviews.filter((i) => i.status === 'completed');

    const totalCompleted = completed.length;
    const avgTechScore = totalCompleted > 0
      ? Math.round(completed.reduce((acc, i) => acc + (i.technicalScore || 0), 0) / totalCompleted)
      : 0;
    const avgSentimentScore = totalCompleted > 0
      ? Math.round(completed.reduce((acc, i) => acc + (i.sentimentScore || 0), 0) / totalCompleted)
      : 0;
    const avgOverallScore = totalCompleted > 0
      ? Math.round(completed.reduce((acc, i) => acc + (i.overallScore || 0), 0) / totalCompleted)
      : 0;

    const latestInterview = completed[0] || null;

    // Score progression history (ordered chronologically)
    const scoreHistory = [...completed]
      .reverse()
      .map((i, idx) => ({
        interviewNumber: `Interview #${idx + 1}`,
        date: new Date(i.completedAt || i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        domain: i.domain,
        technicalScore: i.technicalScore,
        sentimentScore: i.sentimentScore,
        overallScore: i.overallScore,
      }));

    // Aggregate Skill Competency
    const skillMap = {};
    completed.forEach((interview) => {
      (interview.skillBreakdown || []).forEach((sk) => {
        if (!skillMap[sk.skill]) {
          skillMap[sk.skill] = { total: 0, count: 0 };
        }
        skillMap[sk.skill].total += sk.score;
        skillMap[sk.skill].count += 1;
      });
    });

    const skillPerformance = Object.keys(skillMap).map((skill) => ({
      skill,
      score: Math.round(skillMap[skill].total / skillMap[skill].count),
    }));

    // Aggregate Sentiment Breakdown
    let totalPositive = 0;
    let totalNeutral = 0;
    let totalNegative = 0;

    completed.forEach((i) => {
      if (i.sentimentDistribution) {
        totalPositive += i.sentimentDistribution.positive || 0;
        totalNeutral += i.sentimentDistribution.neutral || 0;
        totalNegative += i.sentimentDistribution.negative || 0;
      }
    });

    const sentimentDistribution = totalCompleted > 0
      ? {
          positive: Math.round(totalPositive / totalCompleted),
          neutral: Math.round(totalNeutral / totalCompleted),
          negative: Math.round(totalNegative / totalCompleted),
        }
      : { positive: 0, neutral: 100, negative: 0 };

    res.status(200).json({
      success: true,
      stats: {
        totalCompleted,
        avgTechScore,
        avgSentimentScore,
        avgOverallScore,
        latestScore: latestInterview ? latestInterview.overallScore : 0,
        latestRecommendation: latestInterview ? latestInterview.recommendation : 'No Interviews Yet',
      },
      latestInterview,
      scoreHistory,
      skillPerformance,
      sentimentDistribution,
      recentInterviews: interviews.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Admin Dashboard Metrics
 * GET /api/dashboard/admin
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalQuestions = await Question.countDocuments();
    const allInterviews = await Interview.find()
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 });

    const completed = allInterviews.filter((i) => i.status === 'completed');
    const totalCompletedInterviews = completed.length;

    const avgTechScore = totalCompletedInterviews > 0
      ? Math.round(completed.reduce((acc, i) => acc + (i.technicalScore || 0), 0) / totalCompletedInterviews)
      : 0;
    const avgOverallScore = totalCompletedInterviews > 0
      ? Math.round(completed.reduce((acc, i) => acc + (i.overallScore || 0), 0) / totalCompletedInterviews)
      : 0;
    const avgSentimentScore = totalCompletedInterviews > 0
      ? Math.round(completed.reduce((acc, i) => acc + (i.sentimentScore || 0), 0) / totalCompletedInterviews)
      : 0;

    // Domain performance breakdown
    const domainMap = {};
    completed.forEach((i) => {
      if (!domainMap[i.domain]) {
        domainMap[i.domain] = { totalTech: 0, totalOverall: 0, count: 0 };
      }
      domainMap[i.domain].totalTech += i.technicalScore;
      domainMap[i.domain].totalOverall += i.overallScore;
      domainMap[i.domain].count += 1;
    });

    const domainPerformance = Object.keys(domainMap).map((domain) => ({
      domain,
      avgTech: Math.round(domainMap[domain].totalTech / domainMap[domain].count),
      avgOverall: Math.round(domainMap[domain].totalOverall / domainMap[domain].count),
      interviewsCount: domainMap[domain].count,
    }));

    // Aggregate Sentiment Distribution across all candidate interviews
    let totalPositive = 0;
    let totalNeutral = 0;
    let totalNegative = 0;

    completed.forEach((i) => {
      if (i.sentimentDistribution) {
        totalPositive += i.sentimentDistribution.positive || 0;
        totalNeutral += i.sentimentDistribution.neutral || 0;
        totalNegative += i.sentimentDistribution.negative || 0;
      }
    });

    const sentimentDistribution = totalCompletedInterviews > 0
      ? [
          { name: 'Positive', value: Math.round(totalPositive / totalCompletedInterviews), color: '#10B981' },
          { name: 'Neutral', value: Math.round(totalNeutral / totalCompletedInterviews), color: '#6366F1' },
          { name: 'Negative', value: Math.round(totalNegative / totalCompletedInterviews), color: '#EF4444' },
        ]
      : [
          { name: 'Positive', value: 33, color: '#10B981' },
          { name: 'Neutral', value: 34, color: '#6366F1' },
          { name: 'Negative', value: 33, color: '#EF4444' },
        ];

    // Difficulty breakdown
    const difficultyDistribution = [
      { name: 'Easy', count: completed.filter((i) => i.difficulty === 'Easy').length },
      { name: 'Medium', count: completed.filter((i) => i.difficulty === 'Medium').length },
      { name: 'Hard', count: completed.filter((i) => i.difficulty === 'Hard').length },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        totalQuestions,
        totalInterviews: allInterviews.length,
        totalCompletedInterviews,
        avgTechScore,
        avgOverallScore,
        avgSentimentScore,
      },
      domainPerformance,
      sentimentDistribution,
      difficultyDistribution,
      recentInterviews: allInterviews.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
};
