import { query } from '../config/db.js';
import { evaluateSingleAnswer } from '../services/evaluationService.js';

/**
 * Standalone NLP evaluation analyzer
 * POST /api/evaluation/analyze
 */
export const analyzeAnswer = async (req, res, next) => {
  try {
    const { question, answerText } = req.body;
    if (!question || !answerText) {
      return res.status(400).json({ success: false, message: 'Question object and answerText are required.' });
    }

    const evaluation = evaluateSingleAnswer(question, answerText);
    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive result report by Interview ID
 * GET /api/results/:interviewId
 */
export const getInterviewResult = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    const interviewRows = await query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       WHERE i.id = ?`,
      [interviewId]
    );

    if (!interviewRows || interviewRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    const interview = interviewRows[0];

    const resultRows = await query('SELECT * FROM results WHERE interview_id = ?', [interviewId]);
    if (!resultRows || resultRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation results not found for this interview.' });
    }

    const result = resultRows[0];
    if (typeof result.strengths === 'string') {
      try { result.strengths = JSON.parse(result.strengths); } catch (e) {}
    }
    if (typeof result.areas_to_improve === 'string') {
      try { result.areas_to_improve = JSON.parse(result.areas_to_improve); } catch (e) {}
    }

    // Fetch question-level evaluations
    const evaluations = await query(
      `SELECT e.*, q.question as question_text, q.category, q.skill, q.difficulty, q.expected_answer,
              a.text_answer as candidate_answer, a.time_spent_seconds
       FROM evaluations e
       JOIN questions q ON e.question_id = q.id
       LEFT JOIN answers a ON (a.interview_id = e.interview_id AND a.question_id = e.question_id)
       WHERE e.interview_id = ?
       ORDER BY e.id ASC`,
      [interviewId]
    );

    const parsedEvaluations = evaluations.map((ev) => {
      let matched = ev.matched_concepts;
      if (typeof matched === 'string') {
        try { matched = JSON.parse(matched); } catch (e) { matched = []; }
      }
      let missing = ev.missing_concepts;
      if (typeof missing === 'string') {
        try { missing = JSON.parse(missing); } catch (e) { missing = []; }
      }
      let keywords = ev.matched_keywords;
      if (typeof keywords === 'string') {
        try { keywords = JSON.parse(keywords); } catch (e) { keywords = []; }
      }
      return {
        ...ev,
        matched_concepts: matched,
        missing_concepts: missing,
        matched_keywords: keywords,
      };
    });

    res.status(200).json({
      success: true,
      interview,
      result,
      evaluations: parsedEvaluations,
    });
  } catch (error) {
    next(error);
  }
};
