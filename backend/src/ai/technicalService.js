/**
 * Technical Competency AI Evaluation Service
 * Evaluates candidate responses for:
 * 1. Relevance
 * 2. Correctness
 * 3. Concept Coverage (Keywords/concepts)
 * 4. Completeness
 * 5. Overall Technical Competency Score
 * Generates detectedConcepts, missingConcepts, strengths, weaknesses, and constructive feedback.
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function tokenize(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Checks if a concept phrase or keyword is present in the text
 */
function conceptMatches(concept, text) {
  const normText = normalizeText(text);
  const normConcept = normalizeText(concept);

  // Exact phrase match
  if (normText.includes(normConcept)) return true;

  // Word token overlap for multi-word concepts
  const conceptTokens = normConcept.split(/\s+/).filter(Boolean);
  if (conceptTokens.length === 0) return false;

  const textTokens = new Set(normText.split(/\s+/).filter(Boolean));
  const matchedTokens = conceptTokens.filter(t => textTokens.has(t));

  return matchedTokens.length / conceptTokens.length >= 0.75;
}

/**
 * Technical Competency Evaluation
 * @param {Object} params
 * @param {string} params.candidateAnswer
 * @param {string} params.questionText
 * @param {string} params.expectedAnswer
 * @param {Array<string>} params.keywords
 * @param {string} params.category
 * @param {number} params.maxScore
 */
function evaluateTechnicalCompetency({
  candidateAnswer,
  questionText = '',
  expectedAnswer = '',
  keywords = [],
  category = 'General Technical',
  maxScore = 10
}) {
  const answer = (candidateAnswer || '').trim();

  // If answer is empty or trivially short (< 5 chars)
  if (!answer || answer.length < 5) {
    return {
      technicalScore: 0,
      relevanceScore: 0,
      correctnessScore: 0,
      conceptCoverageScore: 0,
      completenessScore: 0,
      detectedConcepts: [],
      missingConcepts: keywords.length > 0 ? keywords : ['Fundamental concepts'],
      strengths: [],
      weaknesses: ['No meaningful response provided for the technical question.'],
      feedback: 'The candidate did not submit an answer to this question.'
    };
  }

  // Combine provided keywords with extracted terms from expected answer if keywords array is small
  let expectedConcepts = [...(keywords || [])];
  if (expectedConcepts.length === 0 && expectedAnswer) {
    const rawTerms = expectedAnswer.split(/[,;\n.]/).map(s => s.trim()).filter(s => s.length > 4);
    expectedConcepts = rawTerms.slice(0, 6);
  }

  // 1. CONCEPT COVERAGE
  const detectedConcepts = [];
  const missingConcepts = [];

  for (const concept of expectedConcepts) {
    if (conceptMatches(concept, answer)) {
      detectedConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  }

  const coverageRatio = expectedConcepts.length > 0
    ? detectedConcepts.length / expectedConcepts.length
    : 0.5;
  const conceptCoverageScore = Math.min(100, Math.round(coverageRatio * 100));

  // 2. RELEVANCE SCORE
  // Check overlap of question keywords and candidate answer
  const qTokens = tokenize(questionText);
  const aTokens = tokenize(answer);
  const aTokenSet = new Set(aTokens);

  let qOverlap = 0;
  for (const qt of qTokens) {
    if (aTokenSet.has(qt)) qOverlap++;
  }
  const qRatio = qTokens.length > 0 ? qOverlap / Math.min(qTokens.length, 6) : 0.6;
  let relevanceScore = Math.min(100, Math.round((qRatio * 0.45 + (coverageRatio > 0 ? 0.55 : 0.2)) * 100));
  if (detectedConcepts.length > 0) relevanceScore = Math.max(relevanceScore, 65);

  // 3. COMPLETENESS SCORE
  // Based on word count and explanation depth
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  let completenessScore = 30;
  if (wordCount > 15) completenessScore = 50;
  if (wordCount > 35) completenessScore = 70;
  if (wordCount > 65) completenessScore = 85;
  if (wordCount > 100) completenessScore = 95;

  // Depth indicators: "for example", "because", "due to", "in order to", "advantages", "which means", "such as"
  const depthMarkers = ['for example', 'because', 'such as', 'which means', 'in order to', 'trade-off', 'advantage', 'architecture'];
  let depthCount = 0;
  for (const marker of depthMarkers) {
    if (answer.toLowerCase().includes(marker)) depthCount++;
  }
  completenessScore = Math.min(100, completenessScore + (depthCount * 4));

  // 4. CORRECTNESS SCORE
  // Weighted by concept coverage, lack of triviality, and overlap with expected answer
  const expTokens = tokenize(expectedAnswer);
  let expOverlap = 0;
  for (const et of expTokens) {
    if (aTokenSet.has(et)) expOverlap++;
  }
  const expRatio = expTokens.length > 0 ? expOverlap / Math.min(expTokens.length, 12) : coverageRatio;
  let correctnessScore = Math.round((coverageRatio * 0.55 + expRatio * 0.35 + (completenessScore / 100) * 0.1) * 100);
  correctnessScore = Math.min(100, Math.max(15, correctnessScore));

  // If candidate answer is just repeating the question, deduct
  if (wordCount < 10 && detectedConcepts.length === 0) {
    correctnessScore = Math.min(correctnessScore, 25);
    relevanceScore = Math.min(relevanceScore, 30);
  }

  // 5. OVERALL TECHNICAL SCORE (Weighted combination)
  // Technical Competency = Relevance (20%) + Correctness (40%) + Concept Coverage (25%) + Completeness (15%)
  const rawTech = (relevanceScore * 0.20) + (correctnessScore * 0.40) + (conceptCoverageScore * 0.25) + (completenessScore * 0.15);
  const technicalScore = Math.min(100, Math.max(0, Math.round(rawTech)));

  // Generate qualitative Strengths
  const strengths = [];
  if (conceptCoverageScore >= 75) {
    strengths.push(`Identified core key concepts including: ${detectedConcepts.slice(0, 3).join(', ')}.`);
  } else if (detectedConcepts.length > 0) {
    strengths.push(`Correctly touched upon: ${detectedConcepts.join(', ')}.`);
  }

  if (completenessScore >= 80) {
    strengths.push('Provided a comprehensive, well-structured explanation with detailed technical context.');
  } else if (completenessScore >= 60) {
    strengths.push('Offered a coherent explanation with adequate fundamental understanding.');
  }

  if (relevanceScore >= 80) {
    strengths.push('Directly addressed the prompt without drifting off-topic.');
  }

  if (strengths.length === 0 && technicalScore >= 40) {
    strengths.push('Demonstrated basic awareness of the core topic.');
  }

  // Generate qualitative Weaknesses
  const weaknesses = [];
  if (missingConcepts.length > 0) {
    weaknesses.push(`Omitted expected key terminology/concepts: ${missingConcepts.slice(0, 3).join(', ')}.`);
  }
  if (wordCount < 25) {
    weaknesses.push('Response is brief; could benefit from more in-depth architectural or practical examples.');
  }
  if (correctnessScore < 60) {
    weaknesses.push('Technical depth could be strengthened by clarifying exact mechanisms and implementation details.');
  }

  // Qualitative Feedback summary
  let feedback = '';
  if (technicalScore >= 85) {
    feedback = `Strong response displaying solid mastery of ${category}. Covers critical concepts accurately with sound technical explanation.`;
  } else if (technicalScore >= 70) {
    feedback = `Good response demonstrating clear understanding of ${category}. Touches upon the primary principles; could expand on ${missingConcepts[0] || 'advanced corner cases'}.`;
  } else if (technicalScore >= 50) {
    feedback = `Satisfactory answer with partial concept coverage. Understands the high-level concept but missed essential details like ${missingConcepts.slice(0, 2).join(' and ') || 'specific mechanisms'}.`;
  } else {
    feedback = `Needs improvement. The response lacks key technical depth for ${category} and missed major required concepts (${missingConcepts.slice(0, 2).join(', ')}).`;
  }

  return {
    technicalScore,
    relevanceScore,
    correctnessScore,
    conceptCoverageScore,
    completenessScore,
    detectedConcepts,
    missingConcepts,
    strengths,
    weaknesses,
    feedback
  };
}

module.exports = {
  evaluateTechnicalCompetency
};
