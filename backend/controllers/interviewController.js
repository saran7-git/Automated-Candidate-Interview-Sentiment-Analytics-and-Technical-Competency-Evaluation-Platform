import { query } from '../config/db.js';
import { evaluateInterviewSession } from '../services/evaluationService.js';

/**
 * Start a new interview assessment session
 * POST /api/interviews/start
 */
export const startInterview = async (req, res, next) => {
  try {
    const { category, difficulty = 'Medium', questionCount = 5, title } = req.body;
    const candidateId = req.user.id;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      });
    }

    const count = parseInt(questionCount, 10) || 5;

    // 1. Fetch matching questions
    let questions = await query(
      'SELECT * FROM questions WHERE category = ? AND difficulty = ?',
      [category, difficulty]
    );

    // If fewer questions than requested, pull from same category with other difficulties
    if (questions.length < count) {
      const otherDiff = await query(
        'SELECT * FROM questions WHERE category = ? AND difficulty != ?',
        [category, difficulty]
      );
      questions = [...questions, ...otherDiff];
    }

    // If still fewer, pull from all questions
    if (questions.length < count) {
      const remaining = await query('SELECT * FROM questions LIMIT 20');
      questions = [...questions, ...remaining];
    }

    // Deduplicate and randomize
    const uniqueMap = new Map();
    questions.forEach((q) => uniqueMap.set(q.id, q));
    const uniqueQuestions = Array.from(uniqueMap.values()).sort(() => 0.5 - Math.random());
    const selected = uniqueQuestions.slice(0, count);

    if (selected.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available in question bank. Please seed the database.',
      });
    }

    // 2. Insert interview record
    const interviewTitle = title || `${category} ${difficulty} Technical Assessment`;
    const insertInterview = await query(
      `INSERT INTO interviews (candidate_id, title, category, difficulty, total_questions, status, started_at)
       VALUES (?, ?, ?, ?, ?, 'in_progress', NOW())`,
      [candidateId, interviewTitle, category, difficulty, selected.length]
    );

    const interviewId = insertInterview.insertId;

    // 3. Link questions via interview_questions table
    for (let i = 0; i < selected.length; i++) {
      await query(
        `INSERT INTO interview_questions (interview_id, question_id, order_index)
         VALUES (?, ?, ?)`,
        [interviewId, selected[i].id, i + 1]
      );
    }

    const parsedQuestions = selected.map((q, idx) => {
      let expectedConcepts = q.expected_concepts;
      if (typeof expectedConcepts === 'string') {
        try { expectedConcepts = JSON.parse(expectedConcepts); } catch (e) {}
      }
      return {
        id: q.id,
        question_id: q.id,
        order_index: idx + 1,
        question: q.question,
        category: q.category,
        skill: q.skill,
        difficulty: q.difficulty,
        expected_concepts: expectedConcepts,
        max_score: q.max_score || 10,
      };
    });

    res.status(201).json({
      success: true,
      message: 'Interview assessment initialized.',
      interview: {
        id: interviewId,
        candidate_id: candidateId,
        title: interviewTitle,
        category,
        difficulty,
        total_questions: selected.length,
        status: 'in_progress',
        started_at: new Date(),
      },
      questions: parsedQuestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview session details by ID
 * GET /api/interviews/:id
 */
export const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interviewRows = await query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       WHERE i.id = ?`,
      [id]
    );

    if (!interviewRows || interviewRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const interview = interviewRows[0];

    // Authorization check: candidates can only see their own interviews
    if (req.user.role === 'candidate' && interview.candidate_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own interviews.',
      });
    }

    // Fetch linked questions
    const questions = await query(
      `SELECT q.*, iq.order_index
       FROM interview_questions iq
       JOIN questions q ON iq.question_id = q.id
       WHERE iq.interview_id = ?
       ORDER BY iq.order_index ASC`,
      [id]
    );

    // Fetch candidate answers
    const answers = await query(
      `SELECT * FROM answers WHERE interview_id = ? ORDER BY id ASC`,
      [id]
    );

    // Fetch evaluations
    const evaluations = await query(
      `SELECT * FROM evaluations WHERE interview_id = ? ORDER BY id ASC`,
      [id]
    );

    // Fetch overall result
    const resultRows = await query(
      `SELECT * FROM results WHERE interview_id = ?`,
      [id]
    );

    const parsedResult = resultRows && resultRows.length > 0 ? resultRows[0] : null;
    if (parsedResult) {
      if (typeof parsedResult.strengths === 'string') {
        try { parsedResult.strengths = JSON.parse(parsedResult.strengths); } catch (e) {}
      }
      if (typeof parsedResult.areas_to_improve === 'string') {
        try { parsedResult.areas_to_improve = JSON.parse(parsedResult.areas_to_improve); } catch (e) {}
      }
    }

    res.status(200).json({
      success: true,
      interview,
      questions: questions.map(q => ({
        ...q,
        expected_concepts: typeof q.expected_concepts === 'string' ? JSON.parse(q.expected_concepts || '[]') : q.expected_concepts,
      })),
      answers,
      evaluations: evaluations.map(e => ({
        ...e,
        matched_concepts: typeof e.matched_concepts === 'string' ? JSON.parse(e.matched_concepts || '[]') : e.matched_concepts,
        missing_concepts: typeof e.missing_concepts === 'string' ? JSON.parse(e.missing_concepts || '[]') : e.missing_concepts,
      })),
      result: parsedResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit full interview, trigger AI/NLP analysis and save results
 * POST /api/interviews/:id/complete
 */
export const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers = [], durationSeconds = 0 } = req.body;
    const candidateId = req.user.id;

    // Fetch interview and linked questions
    const interviewRows = await query('SELECT * FROM interviews WHERE id = ?', [id]);
    if (!interviewRows || interviewRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const interview = interviewRows[0];
    if (req.user.role === 'candidate' && interview.candidate_id !== candidateId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const questions = await query(
      `SELECT q.*, iq.order_index
       FROM interview_questions iq
       JOIN questions q ON iq.question_id = q.id
       WHERE iq.interview_id = ?
       ORDER BY iq.order_index ASC`,
      [id]
    );

    // Run Comprehensive AI/NLP Evaluation Engine
    const evalReport = evaluateInterviewSession(questions, answers);

    // Save/Update answers in database
    for (const ans of answers) {
      const qId = ans.questionId || ans.question_id;
      const text = ans.textAnswer || ans.text_answer || '';
      const spent = ans.timeSpentSeconds || ans.timeSpent || 0;

      const existingAns = await query(
        'SELECT id FROM answers WHERE interview_id = ? AND question_id = ?',
        [id, qId]
      );

      if (existingAns && existingAns.length > 0) {
        await query(
          'UPDATE answers SET text_answer = ?, time_spent_seconds = ? WHERE id = ?',
          [text, spent, existingAns[0].id]
        );
      } else {
        await query(
          `INSERT INTO answers (interview_id, question_id, candidate_id, text_answer, time_spent_seconds)
           VALUES (?, ?, ?, ?, ?)`,
          [id, qId, candidateId, text, spent]
        );
      }
    }

    // Clear old evaluations if re-submitting
    await query('DELETE FROM evaluations WHERE interview_id = ?', [id]);

    // Save evaluations
    for (const ev of evalReport.evaluations) {
      await query(
        `INSERT INTO evaluations
         (interview_id, question_id, technical_score, relevance_score, sentiment_score, sentiment_label, matched_concepts, missing_concepts, matched_keywords, feedback)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          ev.question_id,
          ev.technical_score,
          ev.relevance_score,
          ev.sentiment_score,
          ev.sentiment_label,
          JSON.stringify(ev.matched_concepts || []),
          JSON.stringify(ev.missing_concepts || []),
          JSON.stringify(ev.matched_keywords || []),
          ev.feedback,
        ]
      );
    }

    // Save or update final Result
    const existingResult = await query('SELECT id FROM results WHERE interview_id = ?', [id]);
    if (existingResult && existingResult.length > 0) {
      await query(
        `UPDATE results SET
          overall_score = ?,
          technical_score = ?,
          relevance_score = ?,
          sentiment_score = ?,
          concept_coverage_score = ?,
          sentiment_positive_pct = ?,
          sentiment_neutral_pct = ?,
          sentiment_negative_pct = ?,
          strengths = ?,
          areas_to_improve = ?,
          recommendation = ?
         WHERE interview_id = ?`,
        [
          evalReport.overallScore,
          evalReport.technicalScore,
          evalReport.relevanceScore,
          evalReport.sentimentScore,
          evalReport.conceptCoverageScore,
          evalReport.sentimentDistribution.positive,
          evalReport.sentimentDistribution.neutral,
          evalReport.sentimentDistribution.negative,
          JSON.stringify(evalReport.strengths),
          JSON.stringify(evalReport.areasToImprove),
          evalReport.recommendation,
          id,
        ]
      );
    } else {
      await query(
        `INSERT INTO results
         (interview_id, candidate_id, overall_score, technical_score, relevance_score, sentiment_score, concept_coverage_score, sentiment_positive_pct, sentiment_neutral_pct, sentiment_negative_pct, strengths, areas_to_improve, recommendation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          candidateId,
          evalReport.overallScore,
          evalReport.technicalScore,
          evalReport.relevanceScore,
          evalReport.sentimentScore,
          evalReport.conceptCoverageScore,
          evalReport.sentimentDistribution.positive,
          evalReport.sentimentDistribution.neutral,
          evalReport.sentimentDistribution.negative,
          JSON.stringify(evalReport.strengths),
          JSON.stringify(evalReport.areasToImprove),
          evalReport.recommendation,
        ]
      );
    }

    // Update interview status
    await query(
      `UPDATE interviews SET
        status = 'evaluated',
        completed_at = NOW(),
        duration_seconds = ?
       WHERE id = ?`,
      [durationSeconds || 300, id]
    );

    res.status(200).json({
      success: true,
      message: 'Assessment completed and AI evaluation generated successfully.',
      interviewId: id,
      report: evalReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get candidate interview history
 * GET /api/interviews/history
 */
export const getCandidateHistory = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const rows = await query(
      `SELECT i.*, r.overall_score, r.technical_score, r.relevance_score, r.sentiment_score, r.recommendation
       FROM interviews i
       LEFT JOIN results r ON i.id = r.interview_id
       WHERE i.candidate_id = ?
       ORDER BY i.created_at DESC`,
      [candidateId]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      interviews: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all interviews (Admin only)
 * GET /api/interviews
 */
export const getAllInterviews = async (req, res, next) => {
  try {
    const { category, difficulty, status, search } = req.query;
    let sql = `
      SELECT i.*, u.name as candidate_name, u.email as candidate_email,
             r.overall_score, r.technical_score, r.relevance_score, r.sentiment_score, r.recommendation
      FROM interviews i
      JOIN users u ON i.candidate_id = u.id
      LEFT JOIN results r ON i.id = r.interview_id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND i.category = ?';
      params.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      sql += ' AND i.difficulty = ?';
      params.push(difficulty);
    }

    if (status && status !== 'All') {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR i.category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY i.created_at DESC';
    const rows = await query(sql, params);

    res.status(200).json({
      success: true,
      count: rows.length,
      interviews: rows,
    });
  } catch (error) {
    next(error);
  }
};
