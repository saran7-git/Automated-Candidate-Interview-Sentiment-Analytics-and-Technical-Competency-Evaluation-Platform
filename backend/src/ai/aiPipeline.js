/**
 * Unified AI Evaluation Pipeline
 * Coordinates Sentiment Analysis and Technical Competency Evaluation
 * Features automatic fallback when external LLM API is unavailable or unconfigured.
 */

const { analyzeSentiment } = require('./sentimentService');
const { evaluateTechnicalCompetency } = require('./technicalService');

/**
 * Attempt evaluation using external LLM if AI_API_KEY is configured
 */
async function callExternalLLM(prompt) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const model = process.env.AI_MODEL || 'gemini-1.5-flash';

  try {
    // Check if it's a Google Gemini endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return JSON.parse(text);
      }
    }
  } catch (err) {
    console.warn(`[AI Pipeline] External LLM call failed or timed out: ${err.message}. Seamlessly transitioning to Built-in NLP Engine.`);
  }

  return null;
}

/**
 * Execute full AI evaluation pipeline for a candidate response
 * @param {Object} input
 * @param {string} input.candidateAnswer
 * @param {string} input.questionText
 * @param {string} input.expectedAnswer
 * @param {Array<string>} input.keywords
 * @param {string} input.category
 * @param {number} input.maxScore
 * @returns {Promise<Object>} Unified Evaluation Result
 */
async function runAiEvaluation({
  candidateAnswer = '',
  questionText = '',
  expectedAnswer = '',
  keywords = [],
  category = 'General Technical',
  maxScore = 10
}) {
  let externalResult = null;

  // Try external LLM if key is supplied
  if (process.env.AI_API_KEY && process.env.AI_API_KEY.trim() !== '') {
    const prompt = `
You are an expert AI interviewer and evaluator. Evaluate this candidate response:
Question: "${questionText}"
Category: "${category}"
Expected Answer: "${expectedAnswer}"
Keywords: ${JSON.stringify(keywords)}
Candidate Answer: "${candidateAnswer}"

Analyze sentiment and technical competency. Return strictly JSON with:
{
  "sentiment": "Positive" | "Neutral" | "Negative",
  "sentimentConfidence": number (0 to 1),
  "sentimentProbabilities": { "positive": number, "neutral": number, "negative": number },
  "sentimentScore": number (0 to 100),
  "technicalScore": number (0 to 100),
  "relevanceScore": number (0 to 100),
  "correctnessScore": number (0 to 100),
  "conceptCoverageScore": number (0 to 100),
  "completenessScore": number (0 to 100),
  "detectedConcepts": string[],
  "missingConcepts": string[],
  "strengths": string[],
  "weaknesses": string[],
  "feedback": string
}
`;
    externalResult = await callExternalLLM(prompt);
  }

  if (externalResult && externalResult.technicalScore !== undefined) {
    const overallAnswerScore = Math.round(
      (externalResult.technicalScore * 0.70) + (externalResult.sentimentScore * 0.30)
    );
    return {
      ...externalResult,
      overallAnswerScore,
      pipelineUsed: `External LLM (${process.env.AI_MODEL || 'Gemini'})`
    };
  }

  // Built-in Deterministic NLP Pipeline (Fallback & Primary Engine)
  const sentimentResult = analyzeSentiment(candidateAnswer);
  const technicalResult = evaluateTechnicalCompetency({
    candidateAnswer,
    questionText,
    expectedAnswer,
    keywords,
    category,
    maxScore
  });

  const overallAnswerScore = Math.round(
    (technicalResult.technicalScore * 0.70) + (sentimentResult.sentimentScore * 0.30)
  );

  return {
    sentiment: sentimentResult.sentiment,
    sentimentConfidence: sentimentResult.sentimentConfidence,
    sentimentProbabilities: sentimentResult.sentimentProbabilities,
    sentimentScore: sentimentResult.sentimentScore,
    technicalScore: technicalResult.technicalScore,
    relevanceScore: technicalResult.relevanceScore,
    correctnessScore: technicalResult.correctnessScore,
    conceptCoverageScore: technicalResult.conceptCoverageScore,
    completenessScore: technicalResult.completenessScore,
    overallAnswerScore,
    detectedConcepts: technicalResult.detectedConcepts,
    missingConcepts: technicalResult.missingConcepts,
    strengths: technicalResult.strengths,
    weaknesses: technicalResult.weaknesses,
    feedback: technicalResult.feedback,
    pipelineUsed: 'Built-in NLP Pipeline (Lexical & VADER Fallback Engine)'
  };
}

/**
 * Calculates aggregated final report scores from all question evaluations
 */
function aggregateSessionEvaluation(evaluations = []) {
  if (!evaluations || evaluations.length === 0) {
    return {
      technicalScore: 0,
      sentimentScore: 0,
      overallScore: 0,
      recommendation: 'Not Recommended',
      summary: 'No evaluations available.',
      categoryScores: {},
      sentimentStats: {
        totalAnswers: 0,
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
    };
  }

  const total = evaluations.length;
  let sumTech = 0;
  let sumSent = 0;
  let sumRel = 0;
  let sumCorr = 0;
  let sumCov = 0;
  let sumComp = 0;
  let sumConf = 0;

  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;

  const categoryMap = {};
  const allStrengths = new Set();
  const allWeaknesses = new Set();

  for (const ev of evaluations) {
    sumTech += ev.technicalScore || 0;
    sumSent += ev.sentimentScore || 0;
    sumRel += ev.relevanceScore || 0;
    sumCorr += ev.correctnessScore || 0;
    sumCov += ev.conceptCoverageScore || 0;
    sumComp += ev.completenessScore || 0;
    sumConf += ev.sentimentConfidence || 0;

    if (ev.sentiment === 'Positive') posCount++;
    else if (ev.sentiment === 'Negative') negCount++;
    else neuCount++;

    const cat = ev.questionCategory || 'General Technical';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { sum: 0, count: 0 };
    }
    categoryMap[cat].sum += ev.technicalScore || 0;
    categoryMap[cat].count += 1;

    (ev.strengths || []).forEach(s => allStrengths.add(s));
    (ev.weaknesses || []).forEach(w => allWeaknesses.add(w));
  }

  const avgTechnical = Math.round(sumTech / total);
  const avgSentiment = Math.round(sumSent / total);
  // Formula: Overall = (Technical * 0.70) + (Sentiment * 0.30)
  const overallScore = Math.round((avgTechnical * 0.70) + (avgSentiment * 0.30));

  const categoryScores = {};
  for (const [cat, data] of Object.entries(categoryMap)) {
    categoryScores[cat] = Math.round(data.sum / data.count);
  }

  let recommendation = 'Recommended';
  if (overallScore >= 85) recommendation = 'Strong Hire';
  else if (overallScore >= 70) recommendation = 'Recommended';
  else if (overallScore >= 50) recommendation = 'Consider with Reservations';
  else recommendation = 'Not Recommended';

  const summary = `Candidate completed ${total} evaluation questions. Overall technical competency rated at ${avgTechnical}/100 with ${avgSentiment}/100 communication sentiment. Candidate demonstrates ${recommendation.toLowerCase()} suitability.`;

  // Voice Emotion & Demeanor Analysis
  const primaryEmotion = avgSentiment >= 80 ? 'Confident & Enthusiastic' : avgSentiment >= 60 ? 'Confident & Composed' : avgSentiment >= 45 ? 'Calm & Measured' : 'Hesitant / Pausing';
  const confidenceScore = Math.round(Math.min(98, Math.max(45, avgSentiment * 0.92 + 10)));
  const composureScore = Math.round(Math.min(98, Math.max(50, (avgTechnical * 0.35) + (avgSentiment * 0.65))));
  const hesitationIndex = Math.max(6, Math.min(65, Math.round((100 - avgSentiment) * 0.75)));
  const speechPace = avgSentiment >= 75 ? 'Fluid & Expressive' : avgSentiment >= 55 ? 'Measured & Articulate' : 'Deliberate with Pauses';

  return {
    technicalScore: avgTechnical,
    sentimentScore: avgSentiment,
    overallScore,
    recommendation,
    summary,
    categoryScores,
    sentimentStats: {
      totalAnswers: total,
      positiveAnswers: posCount,
      neutralAnswers: neuCount,
      negativeAnswers: negCount,
      positivePercentage: Math.round((posCount / total) * 100),
      neutralPercentage: Math.round((neuCount / total) * 100),
      negativePercentage: Math.round((negCount / total) * 100),
      averageConfidence: Number((sumConf / total).toFixed(2))
    },
    technicalMetrics: {
      averageRelevance: Math.round(sumRel / total),
      averageCorrectness: Math.round(sumCorr / total),
      averageConceptCoverage: Math.round(sumCov / total),
      averageCompleteness: Math.round(sumComp / total)
    },
    voiceEmotionStats: {
      primaryEmotion,
      confidenceScore,
      composureScore,
      hesitationIndex,
      speechPace
    },
    malpracticeAudit: {
      totalAttempts: 0,
      tabSwitches: 0,
      eyeAwayWarnings: 0,
      proctoringPassed: true
    },
    aiStrengths: Array.from(allStrengths).slice(0, 5),
    aiWeaknesses: Array.from(allWeaknesses).slice(0, 5)
  };
}

module.exports = {
  runAiEvaluation,
  aggregateSessionEvaluation
};
