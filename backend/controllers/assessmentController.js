/**
 * InterviewIQ - Timed Assessment Controller
 * Manages the 5 Assessment Sections:
 * 1. Aptitude (20 Qs, 30 Mins)
 * 2. Logical Reasoning (20 Qs, 30 Mins)
 * 3. Verbal Ability (20 Qs, 30 Mins)
 * 4. Numerical Reasoning (20 Qs, 30 Mins)
 * 5. Coding Assessment (2 Programming Problems, 60 Mins)
 */

import { query } from '../config/db.js';
import { runCodeTestCase, evaluateCodingSubmission } from '../services/compilerService.js';

const SECTION_CONFIG = {
  aptitude: {
    title: 'Aptitude Assessment',
    category: 'aptitude',
    durationMinutes: 30,
    totalQuestions: 20,
    description: 'Quantitative aptitude, arithmetic logic, and data interpretation.'
  },
  logical_reasoning: {
    title: 'Logical Reasoning Assessment',
    category: 'logical_reasoning',
    durationMinutes: 30,
    totalQuestions: 20,
    description: 'Analytical deductions, series, syllogisms, and pattern relationships.'
  },
  verbal_ability: {
    title: 'Verbal Ability Assessment',
    category: 'verbal_ability',
    durationMinutes: 30,
    totalQuestions: 20,
    description: 'Grammar, vocabulary, reading comprehension, and error spotting.'
  },
  numerical_reasoning: {
    title: 'Numerical Reasoning Assessment',
    category: 'numerical_reasoning',
    durationMinutes: 30,
    totalQuestions: 20,
    description: 'Quantitative comparisons, number patterns, and business math.'
  },
  coding: {
    title: 'Online Coding Assessment',
    category: 'coding',
    durationMinutes: 60,
    totalQuestions: 2,
    description: 'Algorithmic problem solving in C, C++, Python, Java, or MySQL.'
  }
};

/**
 * Get all available assessment sections with candidate completion status
 * GET /api/assessments/sections
 */
export const getAssessmentSections = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    // Fetch existing sessions for this candidate
    const existingSessions = await query(
      'SELECT * FROM assessment_sessions WHERE candidate_id = ? ORDER BY id DESC',
      [candidateId]
    );

    const sections = Object.entries(SECTION_CONFIG).map(([key, config]) => {
      const session = existingSessions.find(s => s.section_type === key);
      return {
        id: key,
        title: config.title,
        category: config.category,
        durationMinutes: config.durationMinutes,
        totalQuestions: config.totalQuestions,
        description: config.description,
        status: session ? session.status : 'not_started',
        sessionId: session ? session.id : null,
        score: session ? session.score : 0,
        maxScore: session ? session.max_score : (key === 'coding' ? 20 : 20),
        percentage: session ? session.percentage : 0,
        completedAt: session ? session.completed_at : null
      };
    });

    res.status(200).json({
      success: true,
      sections
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start or resume a timed assessment section
 * POST /api/assessments/start/:sectionType
 */
export const startAssessmentSession = async (req, res, next) => {
  try {
    const { sectionType } = req.params;
    const candidateId = req.user.id;

    const config = SECTION_CONFIG[sectionType];
    if (!config) {
      return res.status(400).json({
        success: false,
        message: `Invalid assessment section: ${sectionType}`
      });
    }

    // Check if an in-progress session already exists
    const existingSessions = await query(
      'SELECT * FROM assessment_sessions WHERE candidate_id = ? AND section_type = ? AND status = "in_progress"',
      [candidateId, sectionType]
    );

    if (existingSessions && existingSessions.length > 0) {
      const activeSession = existingSessions[0];
      const now = Date.now();
      const expiresAt = new Date(activeSession.expires_at).getTime();
      const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

      // If expired, auto-submit
      if (remainingSeconds <= 0) {
        await query(
          'UPDATE assessment_sessions SET status = "expired", completed_at = NOW() WHERE id = ?',
          [activeSession.id]
        );
      } else {
        // Return existing active session
        let questionsData = activeSession.questions_data;
        if (typeof questionsData === 'string') {
          try { questionsData = JSON.parse(questionsData); } catch (e) {}
        }

        // Fetch candidate's saved answers
        const savedAnswers = await query(
          'SELECT * FROM assessment_answers WHERE session_id = ?',
          [activeSession.id]
        );

        return res.status(200).json({
          success: true,
          message: 'Resuming active assessment session.',
          session: {
            ...activeSession,
            remainingSeconds,
            questions: questionsData,
            savedAnswers
          }
        });
      }
    }

    // Initialize new session
    let selectedQuestions = [];
    if (sectionType === 'coding') {
      const allProblems = await query('SELECT * FROM coding_problems');
      const shuffled = [...allProblems].sort(() => 0.5 - Math.random());
      const problems = shuffled.slice(0, 2);
      selectedQuestions = problems.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        category: p.category,
        statement: p.statement,
        constraints: p.constraints,
        sample_input: p.sample_input,
        sample_output: p.sample_output,
        sample_test_cases: typeof p.sample_test_cases === 'string' ? JSON.parse(p.sample_test_cases) : p.sample_test_cases,
        starter_code: typeof p.starter_code === 'string' ? JSON.parse(p.starter_code) : p.starter_code
      }));
    } else {
      // Fetch 20 objective questions for this section
      const allQs = await query(
        'SELECT id, category, topic, difficulty, statement, options, marks FROM objective_questions WHERE category = ?',
        [sectionType]
      );

      // Randomize questions
      const shuffled = [...allQs].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, config.totalQuestions).map((q, idx) => {
        let opts = q.options;
        if (typeof opts === 'string') {
          try { opts = JSON.parse(opts); } catch (e) {}
        }
        return {
          id: q.id,
          orderIndex: idx + 1,
          category: q.category,
          topic: q.topic,
          difficulty: q.difficulty,
          statement: q.statement,
          options: opts,
          marks: q.marks || 1
        };
      });
    }

    // Calculate server-authoritative expiry time
    const durationMs = config.durationMinutes * 60 * 1000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs);

    const insertResult = await query(
      `INSERT INTO assessment_sessions
       (candidate_id, section_type, title, duration_minutes, total_questions, status, started_at, expires_at, score, max_score, percentage, questions_data)
       VALUES (?, ?, ?, ?, ?, 'in_progress', NOW(), ?, 0, ?, 0, ?)`,
      [
        candidateId,
        sectionType,
        config.title,
        config.durationMinutes,
        selectedQuestions.length,
        expiresAt,
        sectionType === 'coding' ? 20 : 20,
        JSON.stringify(selectedQuestions)
      ]
    );

    const sessionId = insertResult.insertId;

    res.status(201).json({
      success: true,
      message: 'Assessment session started.',
      session: {
        id: sessionId,
        candidate_id: candidateId,
        section_type: sectionType,
        title: config.title,
        duration_minutes: config.durationMinutes,
        total_questions: selectedQuestions.length,
        status: 'in_progress',
        started_at: now,
        expires_at: expiresAt,
        remainingSeconds: config.durationMinutes * 60,
        questions: selectedQuestions,
        savedAnswers: []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Autosave single answer during objective assessment
 * POST /api/assessments/session/:sessionId/save-answer
 */
export const saveAssessmentAnswer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { questionId, selectedOption, isFlagged = false, timeSpentSeconds = 0 } = req.body;
    const candidateId = req.user.id;

    // Verify session belongs to user and is in_progress
    const sessionRows = await query(
      'SELECT * FROM assessment_sessions WHERE id = ? AND candidate_id = ?',
      [sessionId, candidateId]
    );

    if (!sessionRows || sessionRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const session = sessionRows[0];
    if (session.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment session is no longer active.' });
    }

    // Check if answer already exists
    const existing = await query(
      'SELECT id FROM assessment_answers WHERE session_id = ? AND question_id = ?',
      [sessionId, questionId]
    );

    if (existing && existing.length > 0) {
      await query(
        `UPDATE assessment_answers SET selected_option = ?, is_flagged = ?, time_spent_seconds = ? WHERE id = ?`,
        [selectedOption, isFlagged ? 1 : 0, timeSpentSeconds, existing[0].id]
      );
    } else {
      await query(
        `INSERT INTO assessment_answers (session_id, candidate_id, question_id, selected_option, is_flagged, time_spent_seconds)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, candidateId, questionId, selectedOption, isFlagged ? 1 : 0, timeSpentSeconds]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Answer saved.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit objective assessment and evaluate all answers
 * POST /api/assessments/session/:sessionId/submit
 */
export const submitAssessmentSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const candidateId = req.user.id;

    const sessionRows = await query(
      'SELECT * FROM assessment_sessions WHERE id = ? AND candidate_id = ?',
      [sessionId, candidateId]
    );

    if (!sessionRows || sessionRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    const session = sessionRows[0];
    let questionsData = session.questions_data;
    if (typeof questionsData === 'string') {
      try { questionsData = JSON.parse(questionsData); } catch (e) {}
    }

    // Fetch candidate answers
    const answers = await query(
      'SELECT * FROM assessment_answers WHERE session_id = ?',
      [sessionId]
    );

    // Fetch master correct answers for assigned questions
    const questionIds = (questionsData || []).map(q => q.id);
    let totalScore = 0;
    const evaluations = [];

    for (const q of (questionsData || [])) {
      const candidateAns = answers.find(a => Number(a.question_id) === Number(q.id));
      const masterRows = await query(
        'SELECT correct_option, explanation, marks, negative_marks FROM objective_questions WHERE id = ?',
        [q.id]
      );

      const master = masterRows && masterRows.length > 0 ? masterRows[0] : null;
      const correctOption = master ? master.correct_option : null;
      const isSelected = candidateAns && candidateAns.selected_option !== null && candidateAns.selected_option !== undefined;
      const isCorrect = isSelected && Number(candidateAns.selected_option) === Number(correctOption);

      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = master?.marks || 1;
        totalScore += marksAwarded;
      }

      // Update answer record
      if (candidateAns) {
        await query(
          'UPDATE assessment_answers SET is_correct = ?, marks_awarded = ? WHERE id = ?',
          [isCorrect ? 1 : 0, marksAwarded, candidateAns.id]
        );
      }

      evaluations.push({
        questionId: q.id,
        statement: q.statement,
        selectedOption: candidateAns ? candidateAns.selected_option : null,
        correctOption,
        isCorrect,
        marksAwarded,
        explanation: master ? master.explanation : ''
      });
    }

    const maxScore = (questionsData || []).length;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Update session status to completed
    await query(
      `UPDATE assessment_sessions SET
       status = 'completed',
       completed_at = NOW(),
       score = ?,
       max_score = ?,
       percentage = ?
       WHERE id = ?`,
      [totalScore, maxScore, percentage, sessionId]
    );

    res.status(200).json({
      success: true,
      message: 'Assessment completed and submitted successfully.',
      result: {
        sessionId,
        sectionType: session.section_type,
        title: session.title,
        totalQuestions: maxScore,
        answeredCount: answers.filter(a => a.selected_option !== null).length,
        score: totalScore,
        maxScore,
        percentage,
        evaluations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute code in real sandbox against sample test cases
 * POST /api/assessments/coding/run
 */
export const runCodingCode = async (req, res, next) => {
  try {
    const { problemId, language, code, customInput } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Code and language are required.' });
    }

    // Fetch problem details
    const problemRows = await query('SELECT * FROM coding_problems WHERE id = ?', [problemId]);
    if (!problemRows || problemRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    const problem = problemRows[0];
    let sampleTests = problem.sample_test_cases;
    if (typeof sampleTests === 'string') {
      try { sampleTests = JSON.parse(sampleTests); } catch (e) {}
    }

    // If custom input provided, run against custom input
    if (customInput !== undefined && customInput !== null && customInput !== '') {
      const singleRun = await runCodeTestCase(language, code, customInput);
      return res.status(200).json({
        success: true,
        isCustom: true,
        output: singleRun.stdout,
        stderr: singleRun.stderr,
        status: singleRun.status,
        executionTimeMs: singleRun.executionTimeMs
      });
    }

    // Run against sample test cases
    const results = [];
    for (let i = 0; i < (sampleTests || []).length; i++) {
      const tc = sampleTests[i];
      const exec = await runCodeTestCase(language, code, tc.input || '');
      const isMatch = exec.stdout.trim() === (tc.expected_output || '').trim();

      results.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: exec.stdout,
        stderr: exec.stderr,
        passed: isMatch,
        executionTimeMs: exec.executionTimeMs
      });
    }

    res.status(200).json({
      success: true,
      allPassed: results.every(r => r.passed),
      testResults: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit code for evaluation against all sample + hidden test cases
 * POST /api/assessments/coding/submit
 */
export const submitCodingSolution = async (req, res, next) => {
  try {
    const { sessionId, problemId, language, code } = req.body;
    const candidateId = req.user.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({ success: false, message: 'Problem ID, language, and code are required.' });
    }

    const problemRows = await query('SELECT * FROM coding_problems WHERE id = ?', [problemId]);
    if (!problemRows || problemRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    const problem = problemRows[0];
    if (typeof problem.sample_test_cases === 'string') {
      try { problem.sample_test_cases = JSON.parse(problem.sample_test_cases); } catch (e) {}
    }
    if (typeof problem.hidden_test_cases === 'string') {
      try { problem.hidden_test_cases = JSON.parse(problem.hidden_test_cases); } catch (e) {}
    }

    // Run full evaluation
    const evalResult = await evaluateCodingSubmission(language, code, problem);

    // Save submission record
    const insertSub = await query(
      `INSERT INTO coding_submissions
       (session_id, candidate_id, problem_id, language, code, passed_tests, total_tests, score, execution_output)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId || 0,
        candidateId,
        problemId,
        language,
        code,
        evalResult.passedCount,
        evalResult.totalTests,
        evalResult.scorePercentage,
        JSON.stringify(evalResult.testResults)
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Coding submission evaluated successfully.',
      submissionId: insertSub.insertId,
      evaluation: evalResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive scores for candidate across all 5 sections
 * GET /api/assessments/candidate-summary/:candidateId
 */
export const getCandidateAssessmentSummary = async (req, res, next) => {
  try {
    const targetCandidateId = req.params.candidateId || req.user.id;

    // Fetch user details
    const userRows = await query('SELECT id, name, email FROM users WHERE id = ?', [targetCandidateId]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const candidate = userRows[0];

    // Fetch assessment sessions
    const sessions = await query(
      'SELECT * FROM assessment_sessions WHERE candidate_id = ? ORDER BY id DESC',
      [targetCandidateId]
    );

    // Fetch open-ended interview results
    const interviewResults = await query(
      'SELECT * FROM results WHERE candidate_id = ? ORDER BY id DESC LIMIT 1',
      [targetCandidateId]
    );

    // Fetch proctoring events
    const proctorEvents = await query(
      'SELECT * FROM proctoring_events WHERE candidate_id = ? ORDER BY id DESC',
      [targetCandidateId]
    );

    const summary = {
      candidate,
      sections: {
        aptitude: sessions.find(s => s.section_type === 'aptitude') || null,
        logical_reasoning: sessions.find(s => s.section_type === 'logical_reasoning') || null,
        verbal_ability: sessions.find(s => s.section_type === 'verbal_ability') || null,
        numerical_reasoning: sessions.find(s => s.section_type === 'numerical_reasoning') || null,
        coding: sessions.find(s => s.section_type === 'coding') || null,
      },
      interviewResult: interviewResults.length > 0 ? interviewResults[0] : null,
      proctoringEventsCount: proctorEvents.length,
      proctoringEvents: proctorEvents.slice(0, 10)
    };

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};
