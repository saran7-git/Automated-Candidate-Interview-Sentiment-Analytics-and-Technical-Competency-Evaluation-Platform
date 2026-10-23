import { query } from '../config/db.js';

export const saveAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionId, textAnswer, timeSpentSeconds = 0 } = req.body;
    const candidateId = req.user.id;

    if (!interviewId || !questionId) {
      return res.status(400).json({ success: false, message: 'interviewId and questionId are required.' });
    }

    const existing = await query(
      'SELECT id FROM answers WHERE interview_id = ? AND question_id = ? AND candidate_id = ?',
      [interviewId, questionId, candidateId]
    );

    if (existing && existing.length > 0) {
      await query(
        'UPDATE answers SET text_answer = ?, time_spent_seconds = ? WHERE id = ?',
        [textAnswer || '', timeSpentSeconds, existing[0].id]
      );
    } else {
      await query(
        'INSERT INTO answers (interview_id, question_id, candidate_id, text_answer, time_spent_seconds) VALUES (?, ?, ?, ?, ?)',
        [interviewId, questionId, candidateId, textAnswer || '', timeSpentSeconds]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewAnswers = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const rows = await query('SELECT * FROM answers WHERE interview_id = ?', [interviewId]);
    res.status(200).json({
      success: true,
      count: rows.length,
      answers: rows,
    });
  } catch (error) {
    next(error);
  }
};
