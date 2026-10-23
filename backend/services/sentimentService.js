/**
 * InterviewIQ - Sentiment & Communication Analytics Engine
 * Provides deterministic, explainable communication sentiment analysis
 */

const POSITIVE_LEXICON = [
  'confident', 'correct', 'understand', 'efficient', 'good', 'successfully', 'clear',
  'optimize', 'optimized', 'scalable', 'robust', 'effective', 'accurate', 'properly',
  'reliable', 'best practice', 'great', 'excellent', 'seamless', 'easily', 'structured',
  'clean', 'modular', 'performant', 'safe', 'secure', 'beneficial', 'advantage', 'strong',
  'handled', 'implemented', 'achieved', 'solution', 'clarity'
];

const NEGATIVE_LEXICON = [
  'confused', 'difficult', 'unsure', "don't know", 'dont know', 'cannot', "can't",
  'problem', 'error', 'bug', 'failed', 'failing', 'doubt', 'struggle', 'struggling',
  'unclear', 'messy', 'complicated', 'slow', 'vulnerable', 'broken', 'impossible',
  'hesitant', 'unsatisfactory', 'hard', 'forgot', 'stuck', 'blank'
];

const NEGATION_MODIFIERS = [
  'not', 'never', 'no', "n't", 'without', 'hardly', 'barely'
];

/**
 * Analyzes candidate text answer sentiment and communication pattern
 * @param {string} text - Candidate answer text
 * @returns {Object} Sentiment breakdown, score, label, and insights
 */
export const analyzeSentiment = (text = '') => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      sentiment: 'Neutral',
      sentimentScore: 50,
      positiveCount: 0,
      negativeCount: 0,
      wordCount: 0,
      confidenceInsight: 'No response text provided.',
    };
  }

  const normalized = text.toLowerCase().replace(/[^\w\s'-]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  let posCount = 0;
  let negCount = 0;
  const matchedPos = [];
  const matchedNeg = [];

  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const prev = i > 0 ? words[i - 1] : '';
    const isNegated = NEGATION_MODIFIERS.includes(prev);

    // Multi-word phrase check
    if (i < words.length - 1) {
      const twoGram = `${current} ${words[i + 1]}`;
      if (twoGram === "don't know" || twoGram === "dont know") {
        negCount += 1.5;
        matchedNeg.push(twoGram);
        continue;
      }
      if (twoGram === 'best practice') {
        posCount += isNegated ? -1 : 1.5;
        if (!isNegated) matchedPos.push(twoGram);
        continue;
      }
    }

    if (POSITIVE_LEXICON.includes(current)) {
      if (isNegated) {
        negCount += 1;
        matchedNeg.push(`not ${current}`);
      } else {
        posCount += 1;
        matchedPos.push(current);
      }
    } else if (NEGATIVE_LEXICON.includes(current)) {
      if (isNegated) {
        posCount += 0.8;
        matchedPos.push(`not ${current}`);
      } else {
        negCount += 1;
        matchedNeg.push(current);
      }
    }
  }

  // Base score calculation
  let sentimentScore = 50;
  if (posCount + negCount > 0) {
    const diff = posCount - negCount;
    const delta = (diff / Math.max(posCount + negCount, 3)) * 40;
    sentimentScore = Math.min(100, Math.max(15, Math.round(50 + delta)));
  } else if (totalWords >= 15) {
    // Professional, objective, factual technical explanation
    sentimentScore = 75;
  }

  let sentiment = 'Neutral';
  if (sentimentScore >= 68) {
    sentiment = 'Positive';
  } else if (sentimentScore <= 42) {
    sentiment = 'Negative';
  }

  let confidenceInsight = 'Clear, objective, and structured technical delivery.';
  if (sentiment === 'Positive') {
    confidenceInsight = 'Exhibits high clarity, structured reasoning, and confident articulation.';
  } else if (sentiment === 'Negative') {
    confidenceInsight = 'Candidate expressed hesitation, uncertainty, or flagged technical difficulty.';
  }

  return {
    sentiment,
    sentimentScore,
    positiveCount: posCount,
    negativeCount: negCount,
    matchedPos: Array.from(new Set(matchedPos)),
    matchedNeg: Array.from(new Set(matchedNeg)),
    wordCount: totalWords,
    confidenceInsight,
  };
};

/**
 * Calculates aggregate sentiment distribution across interview answers
 */
export const calculateSentimentAggregate = (evaluations = []) => {
  if (!evaluations.length) {
    return { positive: 0, neutral: 100, negative: 0, averageScore: 50 };
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalScore = 0;

  evaluations.forEach((e) => {
    const s = e.sentiment_label || e.sentiment || 'Neutral';
    const score = e.sentiment_score ?? e.sentimentScore ?? 50;
    totalScore += score;

    if (s === 'Positive') positiveCount++;
    else if (s === 'Negative') negativeCount++;
    else neutralCount++;
  });

  const total = evaluations.length;
  return {
    positive: Math.round((positiveCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    negative: Math.round((negativeCount / total) * 100),
    averageScore: Math.round(totalScore / total),
  };
};
