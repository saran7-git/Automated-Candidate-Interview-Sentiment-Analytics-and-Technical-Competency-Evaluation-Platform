/**
 * InterviewIQ - Technical Competency & Answer Relevance Engine
 * Evaluates semantic concept coverage, keyword density, and question intent alignment
 */

const normalizeText = (str = '') => {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for',
  'with', 'to', 'from', 'by', 'as', 'that', 'this', 'it', 'are', 'was', 'be'
]);

// Extensive technical domain synonyms dictionary
const TECHNICAL_SYNONYMS = {
  'stateless': ['no state', 'statelessness', 'without state', 'session independent'],
  'http': ['https', 'hypertext', 'rest', 'endpoints', 'status codes', 'request headers'],
  'client': ['frontend', 'browser', 'consumer', 'user interface', 'client side'],
  'server': ['backend', 'api server', 'node server', 'host', 'server side'],
  'get': ['fetch', 'retrieve', 'querying', 'read data', 'select'],
  'post': ['create', 'insert', 'submit', 'save data', 'add record'],
  'put': ['update', 'replace', 'modify', 'overwrite'],
  'delete': ['remove', 'destroy', 'drop'],
  'asynchronous': ['async', 'await', 'promise', 'callback', 'non-blocking', 'event driven'],
  'virtual dom': ['vdom', 'diffing', 'reconciliation', 'lightweight dom', 'in-memory dom'],
  'middleware': ['request handler', 'interceptor', 'pipeline', 'next function', 'guard'],
  'indexing': ['b-tree', 'index', 'primary key', 'lookup speed', 'binary search tree'],
  'acid': ['atomicity', 'consistency', 'isolation', 'durability', 'transaction integrity'],
  'normalization': ['1nf', '2nf', '3nf', 'redundancy reduction', 'table decomposition'],
  'closure': ['lexical scope', 'outer function scope', 'enclosed variables', 'preserved state'],
  'encapsulation': ['data hiding', 'private fields', 'getters setters', 'access control'],
  'polymorphism': ['method overriding', 'method overloading', 'dynamic dispatch'],
  'inheritance': ['extends', 'subclass', 'super class', 'derived class', 'prototype chain'],
  'garbage collection': ['gc', 'mark and sweep', 'memory cleanup', 'heap reclamation', 'deallocation'],
  'deadlock': ['circular wait', 'resource lock', 'mutual exclusion', 'hold and wait'],
};

/**
 * Checks if a concept is covered in candidate's text answer
 */
export const isConceptCovered = (concept, normalizedAnswer) => {
  const normConcept = normalizeText(concept);
  if (!normConcept) return false;

  // 1. Direct substring match
  if (normalizedAnswer.includes(normConcept)) {
    return true;
  }

  // 2. Token-level partial match for multi-word phrases (e.g. "virtual dom reconciliation")
  const tokens = normConcept.split(' ').filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  if (tokens.length > 1) {
    const matchedCount = tokens.filter((t) => normalizedAnswer.includes(t)).length;
    if (matchedCount / tokens.length >= 0.7) {
      return true;
    }
  }

  // 3. Synonym dictionary matching
  if (Object.prototype.hasOwnProperty.call(TECHNICAL_SYNONYMS, normConcept)) {
    const synonyms = TECHNICAL_SYNONYMS[normConcept];
    if (Array.isArray(synonyms)) {
      return synonyms.some((syn) => normalizedAnswer.includes(syn));
    }
  }

  return false;
};

/**
 * Calculates Answer Relevance score (0-100) based on question intent & answer semantic overlap
 */
export const calculateAnswerRelevance = (questionText, sampleAnswer, candidateAnswer) => {
  const normCandidate = normalizeText(candidateAnswer);
  const words = normCandidate.split(' ').filter(Boolean);

  if (words.length === 0) return 0;
  if (words.length < 5) return 25;

  const qTokens = new Set(
    normalizeText(questionText)
      .split(' ')
      .filter((t) => t.length > 3 && !STOP_WORDS.has(t))
  );

  const sampleTokens = new Set(
    normalizeText(sampleAnswer)
      .split(' ')
      .filter((t) => t.length > 3 && !STOP_WORDS.has(t))
  );

  // Question intent overlap
  let qMatches = 0;
  qTokens.forEach((t) => {
    if (normCandidate.includes(t)) qMatches++;
  });
  const qRatio = qTokens.size > 0 ? qMatches / qTokens.size : 0.8;

  // Sample answer semantic alignment
  let sMatches = 0;
  sampleTokens.forEach((t) => {
    if (normCandidate.includes(t)) sMatches++;
  });
  const sRatio = sampleTokens.size > 0 ? sMatches / sampleTokens.size : 0.7;

  // Length and depth scaling
  let depthFactor = 1.0;
  if (words.length >= 25) depthFactor = 1.1;
  else if (words.length < 10) depthFactor = 0.6;

  const rawRelevance = (qRatio * 0.45 + sRatio * 0.55) * 100 * depthFactor;
  return Math.min(100, Math.max(15, Math.round(rawRelevance)));
};

/**
 * Evaluates candidate's single technical answer
 */
export const evaluateCompetency = (question, answerText = '') => {
  const normAnswer = normalizeText(answerText);
  const words = normAnswer.split(' ').filter(Boolean);
  const wordCount = words.length;

  let expectedConcepts = [];
  let keywords = [];

  if (Array.isArray(question.expected_concepts)) {
    expectedConcepts = question.expected_concepts;
  } else if (typeof question.expected_concepts === 'string') {
    try {
      expectedConcepts = JSON.parse(question.expected_concepts);
    } catch (e) {
      expectedConcepts = question.expected_concepts.split(',').map((c) => c.trim()).filter(Boolean);
    }
  }

  if (Array.isArray(question.keywords)) {
    keywords = question.keywords;
  } else if (typeof question.keywords === 'string') {
    try {
      keywords = JSON.parse(question.keywords);
    } catch (e) {
      keywords = question.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }

  const matchedConcepts = [];
  const missingConcepts = [];

  expectedConcepts.forEach((concept) => {
    if (isConceptCovered(concept, normAnswer)) {
      matchedConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  });

  const matchedKeywords = keywords.filter((kw) => normAnswer.includes(normalizeText(kw)));

  // Concept coverage ratio
  const conceptRatio = expectedConcepts.length > 0 ? matchedConcepts.length / expectedConcepts.length : 0.8;
  const keywordRatio = keywords.length > 0 ? matchedKeywords.length / keywords.length : conceptRatio;

  let depthMultiplier = 1.0;
  if (wordCount < 10 && expectedConcepts.length > 0) depthMultiplier = 0.5;
  else if (wordCount >= 30) depthMultiplier = 1.08;

  let technicalScore = Math.round(((conceptRatio * 0.75) + (keywordRatio * 0.25)) * 100 * depthMultiplier);
  if (wordCount === 0) technicalScore = 0;
  technicalScore = Math.min(100, Math.max(0, technicalScore));

  const relevanceScore = calculateAnswerRelevance(
    question.question,
    question.expected_answer || '',
    answerText
  );

  return {
    technicalScore,
    relevanceScore,
    matchedConcepts,
    missingConcepts,
    matchedKeywords,
    conceptCoverageScore: Math.round(conceptRatio * 100),
  };
};
