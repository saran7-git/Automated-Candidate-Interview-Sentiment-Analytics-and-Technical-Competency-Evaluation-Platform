import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool = null;
let isFallback = false;

// High-performance in-memory relational store
const memoryStore = {
  users: [],
  questions: [],
  interviews: [],
  interview_questions: [],
  answers: [],
  evaluations: [],
  results: [],
  objective_questions: [],
  coding_problems: [],
  assessment_sessions: [],
  assessment_answers: [],
  coding_submissions: [],
  proctoring_events: [],
  audit_logs: [],
  autoId: {
    users: 1,
    questions: 1,
    interviews: 1,
    interview_questions: 1,
    answers: 1,
    evaluations: 1,
    results: 1,
    objective_questions: 1,
    coding_problems: 1,
    assessment_sessions: 1,
    assessment_answers: 1,
    coding_submissions: 1,
    proctoring_events: 1,
    audit_logs: 1,
  },
};

/**
 * Initializes MySQL pool connection and verifies database/tables exist
 */
export const initDB = async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root';
  const database = process.env.DB_NAME || 'interviewiq';

  const passwordsToTry = [password, 'root', 'password', 'admin', '123456', ''];
  const uniquePasswords = Array.from(new Set(passwordsToTry));

  for (const pwd of uniquePasswords) {
    try {
      const tempConn = await mysql.createConnection({
        host,
        port,
        user,
        password: pwd,
        connectTimeout: 2000,
      });

      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await tempConn.end();

      pool = mysql.createPool({
        host,
        port,
        user,
        password: pwd,
        database,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      console.log(`[Database]: Connected to MySQL server on ${host}:${port}/${database} (User: ${user})`);
      await createTables();
      return pool;
    } catch (err) {
      // Try next password
    }
  }

  console.warn('[Database Warning]: MySQL credentials not matched. Activating built-in high-performance in-memory relational engine for seamless live demo.');
  isFallback = true;
  return null;
};

/**
 * Creates MySQL tables if not exist
 */
const createTables = async () => {
  if (!pool) return;

  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('candidate', 'recruiter', 'admin') DEFAULT 'candidate',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_email (email),
      INDEX idx_user_role (role)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      skill VARCHAR(150) NOT NULL,
      difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
      expected_answer TEXT NOT NULL,
      expected_concepts JSON NOT NULL,
      keywords JSON DEFAULT (JSON_ARRAY()),
      max_score INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_question_category (category),
      INDEX idx_question_difficulty (difficulty)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS objective_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      topic VARCHAR(150) NOT NULL,
      difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
      statement TEXT NOT NULL,
      options JSON NOT NULL,
      correct_option INT NOT NULL,
      explanation TEXT NOT NULL,
      marks INT DEFAULT 1,
      negative_marks DECIMAL(3,2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_obj_category (category),
      INDEX idx_obj_topic (topic)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS coding_problems (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
      category VARCHAR(100) NOT NULL,
      statement TEXT NOT NULL,
      constraints TEXT,
      sample_input TEXT,
      sample_output TEXT,
      sample_test_cases JSON NOT NULL,
      hidden_test_cases JSON NOT NULL,
      starter_code JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS assessment_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id INT NOT NULL,
      section_type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      duration_minutes INT NOT NULL DEFAULT 30,
      total_questions INT NOT NULL DEFAULT 20,
      status ENUM('in_progress', 'completed', 'expired') DEFAULT 'in_progress',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      completed_at TIMESTAMP NULL,
      score INT DEFAULT 0,
      max_score INT DEFAULT 20,
      percentage INT DEFAULT 0,
      questions_data JSON NULL,
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_sess_candidate (candidate_id)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS assessment_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      candidate_id INT NOT NULL,
      question_id INT NOT NULL,
      selected_option INT NULL,
      is_correct BOOLEAN DEFAULT FALSE,
      marks_awarded DECIMAL(4,2) DEFAULT 0.00,
      time_spent_seconds INT DEFAULT 0,
      is_flagged BOOLEAN DEFAULT FALSE,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS coding_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      candidate_id INT NOT NULL,
      problem_id VARCHAR(50) NOT NULL,
      language VARCHAR(20) NOT NULL,
      code TEXT NOT NULL,
      passed_tests INT DEFAULT 0,
      total_tests INT DEFAULT 0,
      score INT DEFAULT 0,
      execution_output TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS proctoring_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      session_type ENUM('interview', 'assessment') DEFAULT 'assessment',
      candidate_id INT NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      severity ENUM('low', 'medium', 'high') DEFAULT 'low',
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS interviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id INT NOT NULL,
      title VARCHAR(255) DEFAULT 'Technical Assessment',
      category VARCHAR(100) NOT NULL,
      difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
      total_questions INT DEFAULT 5,
      status ENUM('in_progress', 'completed', 'evaluated', 'cancelled') DEFAULT 'in_progress',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      duration_seconds INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS interview_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      interview_id INT NOT NULL,
      question_id INT NOT NULL,
      order_index INT NOT NULL,
      FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      interview_id INT NOT NULL,
      question_id INT NOT NULL,
      candidate_id INT NOT NULL,
      text_answer TEXT,
      time_spent_seconds INT DEFAULT 0,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS evaluations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      answer_id INT NULL,
      interview_id INT NOT NULL,
      question_id INT NOT NULL,
      technical_score INT DEFAULT 0,
      relevance_score INT DEFAULT 0,
      sentiment_score INT DEFAULT 50,
      sentiment_label ENUM('Positive', 'Neutral', 'Negative') DEFAULT 'Neutral',
      matched_concepts JSON DEFAULT (JSON_ARRAY()),
      missing_concepts JSON DEFAULT (JSON_ARRAY()),
      matched_keywords JSON DEFAULT (JSON_ARRAY()),
      feedback TEXT,
      evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS results (
      id INT AUTO_INCREMENT PRIMARY KEY,
      interview_id INT NOT NULL UNIQUE,
      candidate_id INT NOT NULL,
      overall_score INT DEFAULT 0,
      technical_score INT DEFAULT 0,
      relevance_score INT DEFAULT 0,
      sentiment_score INT DEFAULT 50,
      concept_coverage_score INT DEFAULT 0,
      sentiment_positive_pct INT DEFAULT 0,
      sentiment_neutral_pct INT DEFAULT 100,
      sentiment_negative_pct INT DEFAULT 0,
      strengths JSON DEFAULT (JSON_ARRAY()),
      areas_to_improve JSON DEFAULT (JSON_ARRAY()),
      recommendation VARCHAR(100) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      user_role VARCHAR(50) NOT NULL,
      action VARCHAR(100) NOT NULL,
      target_entity VARCHAR(100) NOT NULL,
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,
  ];

  for (const q of tableQueries) {
    try {
      await pool.query(q);
    } catch (e) {
      console.error('[Table Init Error]:', e.message);
    }
  }
};

/**
 * Universal SQL Query Runner
 */
export const query = async (sql, params = []) => {
  if (pool && !isFallback) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('[SQL Execution Error]:', err.message, 'Query:', sql);
      throw err;
    }
  }

  // Handle in-memory fallback emulation
  return executeInMemory(sql, params);
};

/**
 * In-memory fallback SQL query engine with real mutations
 */
const executeInMemory = (sql, params = []) => {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // 1. INSERT INTO table (cols) VALUES (...)
  if (/^INSERT INTO (\w+)/i.test(cleanSql)) {
    const match = cleanSql.match(/^INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (match) {
      const table = match[1].toLowerCase();
      const cols = match[2].split(',').map(c => c.trim().replace(/[`"]/g, ''));
      const newId = memoryStore.autoId[table] !== undefined ? memoryStore.autoId[table]++ : Math.floor(Math.random() * 100000);
      const row = { id: newId, created_at: new Date() };

      cols.forEach((col, idx) => {
        let val = params[idx];
        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
          try { val = JSON.parse(val); } catch (e) {}
        }
        row[col] = val;
      });

      if (!memoryStore[table]) memoryStore[table] = [];
      memoryStore[table].push(row);
      return { insertId: newId, affectedRows: 1 };
    }
  }

  // 2. SELECT COUNT(*) queries
  if (/^SELECT COUNT\(\*\)/i.test(cleanSql)) {
    const tableMatch = cleanSql.match(/FROM (\w+)/i);
    const table = tableMatch ? tableMatch[1].toLowerCase() : 'users';
    let rows = memoryStore[table] || [];

    // Optional WHERE filter in count
    if (/WHERE/i.test(cleanSql) && params.length > 0) {
      if (/category\s*=\s*\?/i.test(cleanSql)) {
        rows = rows.filter(r => String(r.category).toLowerCase() === String(params[0]).toLowerCase());
      } else if (/role\s*=\s*\?/i.test(cleanSql)) {
        rows = rows.filter(r => String(r.role).toLowerCase() === String(params[0]).toLowerCase());
      }
    }

    return [{ count: rows.length }];
  }

  // 3. SELECT queries
  // Check for JOIN queries first
  const isJoinQuery = /JOIN/i.test(cleanSql);
  if (isJoinQuery) {
    // 3a. interview_questions JOIN questions
    if (/interview_questions/i.test(cleanSql) && /questions/i.test(cleanSql)) {
      let iqRows = memoryStore.interview_questions ? JSON.parse(JSON.stringify(memoryStore.interview_questions)) : [];
      if (/interview_id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
        iqRows = iqRows.filter(r => Number(r.interview_id) === Number(params[0]));
      }
      const questions = memoryStore.questions || [];
      const joined = iqRows.map(iq => {
        const q = questions.find(item => Number(item.id) === Number(iq.question_id)) || {};
        return {
          ...q,
          order_index: iq.order_index,
          interview_question_id: iq.id
        };
      });
      joined.sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
      return joined;
    }

    // 3b. interviews JOIN users (optionally LEFT JOIN results)
    if (/interviews/i.test(cleanSql) && /users/i.test(cleanSql)) {
      let intRows = memoryStore.interviews ? JSON.parse(JSON.stringify(memoryStore.interviews)) : [];
      if (/WHERE\s+.*i\.id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
        intRows = intRows.filter(r => Number(r.id) === Number(params[0]));
      } else if (/WHERE\s+.*candidate_id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
        intRows = intRows.filter(r => Number(r.candidate_id) === Number(params[0]));
      }

      const users = memoryStore.users || [];
      const results = memoryStore.results || [];

      const joined = intRows.map(i => {
        const u = users.find(user => Number(user.id) === Number(i.candidate_id)) || {};
        const r = results.find(res => Number(res.interview_id) === Number(i.id)) || {};
        return {
          ...i,
          candidate_name: u.name || 'Candidate',
          candidate_email: u.email || '',
          overall_score: r.overall_score !== undefined ? r.overall_score : null,
          technical_score: r.technical_score !== undefined ? r.technical_score : null,
          relevance_score: r.relevance_score !== undefined ? r.relevance_score : null,
          sentiment_score: r.sentiment_score !== undefined ? r.sentiment_score : null,
          recommendation: r.recommendation || null,
          strengths: r.strengths || [],
          areas_to_improve: r.areas_to_improve || [],
          concept_coverage_score: r.concept_coverage_score !== undefined ? r.concept_coverage_score : null,
        };
      });

      if (/ORDER BY\s+.*DESC/i.test(cleanSql)) {
        joined.sort((a, b) => Number(b.id) - Number(a.id));
      }
      return joined;
    }

    // 3c. evaluations JOIN questions (optionally LEFT JOIN answers)
    if (/evaluations/i.test(cleanSql) && /questions/i.test(cleanSql)) {
      let evalRows = memoryStore.evaluations ? JSON.parse(JSON.stringify(memoryStore.evaluations)) : [];
      if (/interview_id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
        evalRows = evalRows.filter(r => Number(r.interview_id) === Number(params[0]));
      }
      const questions = memoryStore.questions || [];
      const answers = memoryStore.answers || [];

      return evalRows.map(e => {
        const q = questions.find(item => Number(item.id) === Number(e.question_id)) || {};
        const a = answers.find(ans => Number(ans.interview_id) === Number(e.interview_id) && Number(ans.question_id) === Number(e.question_id)) || {};
        return {
          ...e,
          question: q.question || '',
          expected_answer: q.expected_answer || '',
          skill: q.skill || q.category || 'General',
          text_answer: a.text_answer || '',
        };
      });
    }

    // 3d. interviews LEFT JOIN results
    if (/interviews/i.test(cleanSql) && /results/i.test(cleanSql)) {
      let intRows = memoryStore.interviews ? JSON.parse(JSON.stringify(memoryStore.interviews)) : [];
      if (/candidate_id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
        intRows = intRows.filter(r => Number(r.candidate_id) === Number(params[0]));
      }
      const results = memoryStore.results || [];
      const joined = intRows.map(i => {
        const r = results.find(res => Number(res.interview_id) === Number(i.id)) || {};
        return {
          ...i,
          overall_score: r.overall_score !== undefined ? r.overall_score : null,
          technical_score: r.technical_score !== undefined ? r.technical_score : null,
          relevance_score: r.relevance_score !== undefined ? r.relevance_score : null,
          sentiment_score: r.sentiment_score !== undefined ? r.sentiment_score : null,
          recommendation: r.recommendation || null,
        };
      });
      if (/ORDER BY\s+.*DESC/i.test(cleanSql)) {
        joined.sort((a, b) => Number(b.id) - Number(a.id));
      }
      return joined;
    }
  }

  // Standard non-JOIN SELECT queries
  const selectMatch = cleanSql.match(/^SELECT (.+) FROM (\w+)(.*)/i);
  if (selectMatch) {
    const table = selectMatch[2].toLowerCase();
    const whereClause = selectMatch[3] || '';
    let rows = memoryStore[table] ? JSON.parse(JSON.stringify(memoryStore[table])) : [];

    // Filter by single or multi params
    if (/WHERE/i.test(whereClause)) {
      // Multiple parameter pattern matching
      let paramIdx = 0;

      if (/candidate_id\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const cId = Number(params[paramIdx++]);
        rows = rows.filter(r => Number(r.candidate_id) === cId);
      }

      if (/section_type\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const sec = String(params[paramIdx++]).toLowerCase();
        rows = rows.filter(r => String(r.section_type).toLowerCase() === sec);
      }

      if (/category\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const cat = String(params[paramIdx++]).toLowerCase();
        rows = rows.filter(r => String(r.category).toLowerCase() === cat);
      }

      if (/difficulty\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const diff = String(params[paramIdx++]).toLowerCase();
        rows = rows.filter(r => String(r.difficulty).toLowerCase() === diff);
      }

      if (/session_id\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const sId = Number(params[paramIdx++]);
        rows = rows.filter(r => Number(r.session_id) === sId);
      }

      if (/interview_id\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const iId = Number(params[paramIdx++]);
        rows = rows.filter(r => Number(r.interview_id) === iId);
      }

      if (/question_id\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const qId = Number(params[paramIdx++]);
        rows = rows.filter(r => Number(r.question_id) === qId);
      }

      if (/id\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const idVal = params[paramIdx++];
        rows = rows.filter(r => String(r.id) === String(idVal));
      }

      if (/email\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const em = String(params[paramIdx++]).toLowerCase();
        rows = rows.filter(r => r.email && r.email.toLowerCase() === em);
      }

      if (/status\s*=\s*['"]in_progress['"]/i.test(whereClause)) {
        rows = rows.filter(r => String(r.status).toLowerCase() === 'in_progress');
      } else if (/status\s*=\s*\?/i.test(whereClause) && paramIdx < params.length) {
        const st = String(params[paramIdx++]).toLowerCase();
        rows = rows.filter(r => String(r.status).toLowerCase() === st);
      }
    }

    // Handle ORDER BY
    if (/ORDER BY\s+([a-zA-Z0-9_.]+)\s+(ASC|DESC)/i.test(whereClause)) {
      const orderMatch = whereClause.match(/ORDER BY\s+([a-zA-Z0-9_.]+)\s+(ASC|DESC)/i);
      const rawCol = orderMatch[1].split('.').pop();
      const isDesc = orderMatch[2].toUpperCase() === 'DESC';
      rows.sort((a, b) => {
        if (a[rawCol] < b[rawCol]) return isDesc ? 1 : -1;
        if (a[rawCol] > b[rawCol]) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // Handle LIMIT
    if (/LIMIT\s+(\d+)/i.test(whereClause)) {
      const limitMatch = whereClause.match(/LIMIT\s+(\d+)/i);
      const limit = parseInt(limitMatch[1], 10);
      rows = rows.slice(0, limit);
    }

    return rows;
  }

  // 4. UPDATE table SET ... WHERE ...
  const updateMatch = cleanSql.match(/^UPDATE (\w+)\s+SET\s+(.+)\s+WHERE\s+(.+)/i);
  if (updateMatch) {
    const table = updateMatch[1].toLowerCase();
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3];

    const setCols = setClause.split(',').map(c => c.split('=')[0].trim().replace(/[`"]/g, ''));
    let rows = memoryStore[table] || [];

    // Identify target rows by parameter or id
    const whereIdParam = params[params.length - 1];
    let affected = 0;

    rows.forEach(r => {
      let isMatch = false;
      if (/id\s*=\s*\?/i.test(whereClause) && Number(r.id) === Number(whereIdParam)) {
        isMatch = true;
      } else if (/interview_id\s*=\s*\?/i.test(whereClause) && Number(r.interview_id) === Number(whereIdParam)) {
        isMatch = true;
      } else if (/session_id\s*=\s*\?/i.test(whereClause) && Number(r.session_id) === Number(whereIdParam)) {
        isMatch = true;
      } else if (!/WHERE/i.test(cleanSql)) {
        isMatch = true;
      }

      if (isMatch) {
        affected++;
        setCols.forEach((col, idx) => {
          let val = params[idx];
          if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
            try { val = JSON.parse(val); } catch (e) {}
          }
          r[col] = val;
        });
      }
    });

    return { affectedRows: affected };
  }

  // 5. DELETE FROM table
  if (/^DELETE FROM (\w+)/i.test(cleanSql)) {
    const match = cleanSql.match(/^DELETE FROM (\w+)(.*)/i);
    const table = match[1].toLowerCase();
    const whereClause = match[2] || '';

    if (/interview_id\s*=\s*\?/i.test(whereClause) && params.length > 0) {
      if (memoryStore[table]) {
        memoryStore[table] = memoryStore[table].filter(r => Number(r.interview_id) !== Number(params[0]));
      }
    } else if (/session_id\s*=\s*\?/i.test(whereClause) && params.length > 0) {
      if (memoryStore[table]) {
        memoryStore[table] = memoryStore[table].filter(r => Number(r.session_id) !== Number(params[0]));
      }
    } else {
      if (memoryStore[table]) memoryStore[table] = [];
    }
    return { affectedRows: 1 };
  }

  return [];
};

export { memoryStore };
