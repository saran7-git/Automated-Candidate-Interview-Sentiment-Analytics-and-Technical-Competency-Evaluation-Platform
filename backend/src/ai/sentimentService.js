/**
 * NLP Sentiment Analysis Service
 * Evaluates candidate responses for tone, confidence, emotional polarity,
 * and professional communication demeanor.
 */

// Lexicons tailored for professional interview responses
const POSITIVE_LEXICON = {
  'successfully': 2.5, 'optimized': 2.5, 'effective': 2.2, 'efficient': 2.2,
  'proficient': 2.4, 'achieved': 2.3, 'improved': 2.3, 'collaborated': 2.2,
  'reliable': 2.1, 'scalable': 2.0, 'robust': 2.2, 'confident': 2.5,
  'enthusiastic': 2.6, 'streamlined': 2.2, 'solved': 2.2, 'passionate': 2.6,
  'innovative': 2.4, 'dedicated': 2.2, 'proactive': 2.4, 'clear': 1.9,
  'thorough': 2.1, 'best': 2.2, 'seamless': 2.3, 'advantage': 2.0,
  'benefit': 2.0, 'productive': 2.1, 'positive': 2.2, 'excellent': 2.8,
  'great': 2.2, 'good': 1.8, 'love': 2.4, 'enjoyed': 2.3, 'structured': 1.9,
  'consistent': 1.9, 'resilient': 2.3, 'valuable': 2.1, 'accurate': 2.0,
  'strengthened': 2.2, 'enhanced': 2.1, 'resolved': 2.3, 'delivered': 2.2,
  'vital': 1.8, 'high': 1.5, 'guarantee': 2.0, 'effortlessly': 2.5, 'consensus': 2.2
};

const NEGATIVE_LEXICON = {
  'failed': -2.5, 'struggled': -2.4, 'confusing': -2.2, 'broken': -2.4,
  'frustrated': -2.6, 'terrible': -2.8, 'disorganized': -2.4, 'unclear': -2.2,
  'doubt': -2.2, 'painful': -2.5, 'worst': -2.8, 'bad': -2.2, 'poor': -2.4,
  'ineffective': -2.4, 'hate': -2.6, 'dislike': -2.2, 'difficult': -1.8,
  'annoying': -2.4, 'flawed': -2.3, 'unprepared': -2.6, 'unable': -2.2,
  'couldnt': -2.0, 'cannot': -1.6, 'never': -1.4, 'sloppy': -2.5,
  'useless': -2.7, 'stuck': -2.2, 'messy': -2.3, 'unstable': -2.4,
  'stressful': -2.4, 'disaster': -3.0, 'regret': -2.5, 'inferior': -2.3,
  'weak': -2.0, 'misunderstanding': -2.0, 'flaw': -2.2
};

const INTENSIFIERS = {
  'very': 1.4, 'extremely': 1.8, 'deeply': 1.5, 'highly': 1.5,
  'exceptionally': 1.8, 'really': 1.3, 'significantly': 1.5, 'substantially': 1.4,
  'strongly': 1.5, 'absolutely': 1.6
};

const NEGATIONS = ['not', "don't", "didn't", "won't", "haven't", "hardly", "barely", "never", "no", "without"];

function cleanToken(w) {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Perform rule-based NLP sentiment analysis on candidate answer
 * @param {string} text 
 * @returns {Object} Sentiment metrics
 */
function analyzeSentiment(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      sentiment: 'Neutral',
      sentimentConfidence: 0.70,
      sentimentProbabilities: { positive: 0.15, neutral: 0.70, negative: 0.15 },
      sentimentScore: 50,
      detail: 'No response provided'
    };
  }

  const rawTokens = text.split(/\s+/);
  const tokens = rawTokens.map(cleanToken).filter(Boolean);

  let positiveScore = 0;
  let negativeScore = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const prevWord = i > 0 ? tokens[i - 1] : '';
    const prev2Word = i > 1 ? tokens[i - 2] : '';

    const isNegated = NEGATIONS.includes(prevWord) || NEGATIONS.includes(prev2Word);
    let intensity = 1.0;
    if (INTENSIFIERS[prevWord]) intensity = INTENSIFIERS[prevWord];

    // Check bigrams
    const bigram = i > 0 ? `${tokens[i - 1]} ${word}` : '';
    if (POSITIVE_LEXICON[bigram]) {
      const val = POSITIVE_LEXICON[bigram] * intensity;
      if (isNegated) negativeScore += val * 0.9;
      else positiveScore += val;
      continue;
    }

    if (POSITIVE_LEXICON[word]) {
      const val = POSITIVE_LEXICON[word] * intensity;
      if (isNegated) negativeScore += val * 0.9;
      else positiveScore += val;
    } else if (NEGATIVE_LEXICON[word]) {
      const val = Math.abs(NEGATIVE_LEXICON[word]) * intensity;
      if (isNegated) positiveScore += val * 0.8;
      else negativeScore += val;
    }
  }

  // Calculate polarity metrics
  const wordCount = Math.max(tokens.length, 1);
  const posDensity = positiveScore / Math.sqrt(wordCount);
  const negDensity = negativeScore / Math.sqrt(wordCount);

  // Softmax-like probability distribution
  const expPos = Math.exp(Math.min(4.0, posDensity * 2.2));
  const expNeg = Math.exp(Math.min(4.0, negDensity * 2.2));
  const expNeu = Math.exp(1.5); // Fixed balanced neutral baseline

  const sumExp = expPos + expNeg + expNeu;
  let probPos = Number((expPos / sumExp).toFixed(3));
  let probNeg = Number((expNeg / sumExp).toFixed(3));
  let probNeu = Number(Math.max(0.05, 1.0 - (probPos + probNeg)).toFixed(3));

  // Normalize
  const totalProb = probPos + probNeg + probNeu;
  probPos = Number((probPos / totalProb).toFixed(3));
  probNeg = Number((probNeg / totalProb).toFixed(3));
  probNeu = Number((1.0 - probPos - probNeg).toFixed(3));

  let sentiment = 'Neutral';
  let sentimentScore = 55;
  let confidence = probNeu;

  // Decision logic matching requirements:
  // Positive -> 80 - 100
  // Neutral -> 40 - 79
  // Negative -> 0 - 39
  if (probPos >= 0.40 && probPos > probNeg * 1.3) {
    sentiment = 'Positive';
    confidence = Math.max(probPos, 0.78);
    // Normalized score: 80 - 98
    sentimentScore = Math.round(80 + Math.min(18, (probPos - 0.38) * 35));
  } else if (probNeg >= 0.35 && probNeg > probPos * 1.2) {
    sentiment = 'Negative';
    confidence = Math.max(probNeg, 0.75);
    // Normalized score: 10 - 39
    sentimentScore = Math.round(Math.max(10, 39 - (probNeg - 0.35) * 45));
  } else {
    sentiment = 'Neutral';
    confidence = Math.max(probNeu, 0.65);
    // Normalized score: 45 - 75
    const net = (probPos - probNeg);
    sentimentScore = Math.round(58 + (net * 28));
    sentimentScore = Math.min(78, Math.max(45, sentimentScore));
  }

  return {
    sentiment,
    sentimentConfidence: Number(confidence.toFixed(2)),
    sentimentProbabilities: {
      positive: probPos,
      neutral: probNeu,
      negative: probNeg
    },
    sentimentScore: Math.min(100, Math.max(0, sentimentScore))
  };
}

module.exports = {
  analyzeSentiment
};
