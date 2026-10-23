/**
 * InterviewIQ - Comprehensive Evaluation Engine
 * Aggregates Technical Competency (60%), Answer Relevance (25%), and Communication Sentiment (15%)
 */

import { analyzeSentiment, calculateSentimentAggregate } from './sentimentService.js';
import { evaluateCompetency } from './competencyService.js';

/**
 * Evaluates a single candidate answer against a question
 */
export const evaluateSingleAnswer = (question, answerText = '') => {
  const competencyResult = evaluateCompetency(question, answerText);
  const sentimentResult = analyzeSentiment(answerText);

  const {
    technicalScore,
    relevanceScore,
    matchedConcepts,
    missingConcepts,
    matchedKeywords,
    conceptCoverageScore,
  } = competencyResult;

  const { sentiment, sentimentScore, confidenceInsight } = sentimentResult;

  // Question-level AI Feedback generation
  let feedback = '';
  if (technicalScore >= 85 && relevanceScore >= 80) {
    feedback = `Exceptional explanation. Effectively addressed core concepts (${matchedConcepts.join(', ')}) with precise technical terminology and high relevance.`;
  } else if (technicalScore >= 65) {
    feedback = `Solid answer. Successfully explained ${matchedConcepts.join(', ')}. Could be strengthened by discussing ${missingConcepts.slice(0, 2).join(' and ')}.`;
  } else if (technicalScore >= 40) {
    feedback = `Partial coverage. Mentioned ${matchedConcepts.length > 0 ? matchedConcepts.join(', ') : 'foundational ideas'}, but omitted key concepts such as ${missingConcepts.join(', ')}.`;
  } else {
    feedback = `Answer lacked sufficient technical depth. Expected coverage of: ${missingConcepts.slice(0, 3).join(', ')}.`;
  }

  return {
    technical_score: technicalScore,
    relevance_score: relevanceScore,
    sentiment_score: sentimentScore,
    sentiment_label: sentiment,
    matched_concepts: matchedConcepts,
    missing_concepts: missingConcepts,
    matched_keywords: matchedKeywords,
    concept_coverage_score: conceptCoverageScore,
    feedback,
    confidence_insight: confidenceInsight,
  };
};

/**
 * Evaluates full candidate interview session and generates report analytics
 */
export const evaluateInterviewSession = (questions = [], answers = []) => {
  const evaluations = [];
  let totalTech = 0;
  let totalRelevance = 0;
  let totalSentiment = 0;
  let totalConceptCoverage = 0;

  const skillScoreMap = {};

  questions.forEach((q, idx) => {
    const qId = q.id || q.question_id;
    const ansObj = answers.find(
      (a) => (a.question_id || a.questionId) == qId || a.order_index == idx || a.index == idx
    );

    const answerText = ansObj?.text_answer || ansObj?.textAnswer || '';
    const evaluation = evaluateSingleAnswer(q, answerText);
    evaluation.question_id = qId;
    evaluation.question = q.question;
    evaluation.skill = q.skill || q.category || 'General';
    evaluation.candidate_answer = answerText;

    evaluations.push(evaluation);

    totalTech += evaluation.technical_score;
    totalRelevance += evaluation.relevance_score;
    totalSentiment += evaluation.sentiment_score;
    totalConceptCoverage += evaluation.concept_coverage_score;

    // Track skill category aggregation
    const skillName = q.skill || q.category || 'General';
    if (!skillScoreMap[skillName]) {
      skillScoreMap[skillName] = { total: 0, count: 0 };
    }
    skillScoreMap[skillName].total += evaluation.technical_score;
    skillScoreMap[skillName].count += 1;
  });

  const questionCount = Math.max(questions.length, 1);
  const avgTechScore = Math.round(totalTech / questionCount);
  const avgRelevanceScore = Math.round(totalRelevance / questionCount);
  const avgSentimentScore = Math.round(totalSentiment / questionCount);
  const avgConceptCoverage = Math.round(totalConceptCoverage / questionCount);

  // Scoring model: 60% Technical + 25% Relevance + 15% Sentiment
  const overallScore = Math.min(
    100,
    Math.round(
      avgTechScore * 0.60 +
      avgRelevanceScore * 0.25 +
      avgSentimentScore * 0.15
    )
  );

  // Sentiment aggregate distribution
  const sentimentStats = calculateSentimentAggregate(evaluations);

  // Skill category breakdown
  const skillBreakdown = Object.keys(skillScoreMap).map((skill) => ({
    skill,
    score: Math.round(skillScoreMap[skill].total / skillScoreMap[skill].count),
    questionCount: skillScoreMap[skill].count,
  }));

  // Deterministic AI Strengths & Improvement Areas
  const strengths = [];
  const areasToImprove = [];

  skillBreakdown.forEach((item) => {
    if (item.score >= 75) {
      strengths.push(`Strong mastery in ${item.skill} (${item.score}%)`);
    } else if (item.score < 60) {
      areasToImprove.push(`Improve depth in ${item.skill} concepts (${item.score}%)`);
    }
  });

  if (avgRelevanceScore >= 80) {
    strengths.push('High response relevance and question intent alignment');
  } else if (avgRelevanceScore < 65) {
    areasToImprove.push('Structure answers to directly address the primary question prompt');
  }

  if (avgSentimentScore >= 75) {
    strengths.push('Clear, confident, and professional communication patterns');
  } else if (avgSentimentScore < 50) {
    areasToImprove.push('Incorporate more definitive technical terminology and structured examples');
  }

  if (strengths.length === 0) {
    strengths.push('Completed full assessment session within allocated duration');
  }

  if (areasToImprove.length === 0) {
    areasToImprove.push('Continue refining high-level architectural trade-offs and edge cases');
  }

  // Recommendation classification
  let recommendation = 'Needs Improvement';
  if (overallScore >= 84 && avgTechScore >= 80) {
    recommendation = 'Strong Performance';
  } else if (overallScore >= 70 && avgTechScore >= 65) {
    recommendation = 'Good Candidate';
  } else if (overallScore >= 55) {
    recommendation = 'Consider with Reservations';
  }

  return {
    evaluations,
    overallScore,
    technicalScore: avgTechScore,
    relevanceScore: avgRelevanceScore,
    sentimentScore: avgSentimentScore,
    conceptCoverageScore: avgConceptCoverage,
    sentimentDistribution: {
      positive: sentimentStats.positive,
      neutral: sentimentStats.neutral,
      negative: sentimentStats.negative,
    },
    skillBreakdown,
    strengths,
    areasToImprove,
    recommendation,
  };
};
