import { query } from '../config/db.js';

export const getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;
    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      sql += ' AND (question LIKE ? OR skill LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);

    const questions = rows.map((q) => {
      let expectedConcepts = q.expected_concepts;
      if (typeof expectedConcepts === 'string') {
        try { expectedConcepts = JSON.parse(expectedConcepts); } catch (e) { expectedConcepts = [expectedConcepts]; }
      }
      let keywords = q.keywords;
      if (typeof keywords === 'string') {
        try { keywords = JSON.parse(keywords); } catch (e) { keywords = []; }
      }
      return {
        ...q,
        expected_concepts: expectedConcepts,
        keywords,
      };
    });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const q = rows[0];
    let expectedConcepts = q.expected_concepts;
    if (typeof expectedConcepts === 'string') {
      try { expectedConcepts = JSON.parse(expectedConcepts); } catch (e) {}
    }
    let keywords = q.keywords;
    if (typeof keywords === 'string') {
      try { keywords = JSON.parse(keywords); } catch (e) {}
    }

    res.status(200).json({
      success: true,
      question: { ...q, expected_concepts: expectedConcepts, keywords },
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const {
      question,
      category,
      skill,
      difficulty = 'Medium',
      expected_answer,
      expected_concepts = [],
      keywords = [],
      max_score = 10,
    } = req.body;

    if (!question || !category || !skill || !expected_answer) {
      return res.status(400).json({
        success: false,
        message: 'Question text, category, skill, and expected answer are required.',
      });
    }

    const conceptsArr = Array.isArray(expected_concepts)
      ? expected_concepts
      : expected_concepts.split(',').map((c) => c.trim()).filter(Boolean);

    const keywordsArr = Array.isArray(keywords)
      ? keywords
      : keywords.split(',').map((k) => k.trim()).filter(Boolean);

    const result = await query(
      `INSERT INTO questions (question, category, skill, difficulty, expected_answer, expected_concepts, keywords, max_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question.trim(),
        category.trim(),
        skill.trim(),
        difficulty,
        expected_answer.trim(),
        JSON.stringify(conceptsArr),
        JSON.stringify(keywordsArr),
        Number(max_score) || 10,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      questionId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      question,
      category,
      skill,
      difficulty,
      expected_answer,
      expected_concepts,
      keywords,
      max_score,
    } = req.body;

    const existing = await query('SELECT * FROM questions WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const conceptsArr = expected_concepts !== undefined
      ? (Array.isArray(expected_concepts) ? expected_concepts : expected_concepts.split(',').map((c) => c.trim()).filter(Boolean))
      : existing[0].expected_concepts;

    const keywordsArr = keywords !== undefined
      ? (Array.isArray(keywords) ? keywords : keywords.split(',').map((k) => k.trim()).filter(Boolean))
      : existing[0].keywords;

    await query(
      `UPDATE questions SET
        question = COALESCE(?, question),
        category = COALESCE(?, category),
        skill = COALESCE(?, skill),
        difficulty = COALESCE(?, difficulty),
        expected_answer = COALESCE(?, expected_answer),
        expected_concepts = ?,
        keywords = ?,
        max_score = COALESCE(?, max_score)
       WHERE id = ?`,
      [
        question,
        category,
        skill,
        difficulty,
        expected_answer,
        typeof conceptsArr === 'string' ? conceptsArr : JSON.stringify(conceptsArr),
        typeof keywordsArr === 'string' ? keywordsArr : JSON.stringify(keywordsArr),
        max_score,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM questions WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
