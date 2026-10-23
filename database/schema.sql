-- ==============================================================================
-- InterviewIQ - Production Enterprise Database Schema
-- Automated Candidate Interview Sentiment Analytics & Technical Evaluation Platform
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS interviewiq CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE interviewiq;

-- 1. Users Table (Candidates, Recruiters, Administrators)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'recruiter', 'admin') DEFAULT 'candidate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. Open-Ended Interview Questions Bank
CREATE TABLE IF NOT EXISTS questions (
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
) ENGINE=InnoDB;

-- 3. Objective Assessment Questions Bank (Aptitude, Logical Reasoning, Verbal Ability, Numerical Reasoning)
CREATE TABLE IF NOT EXISTS objective_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'aptitude', 'logical_reasoning', 'verbal_ability', 'numerical_reasoning'
    topic VARCHAR(150) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    statement TEXT NOT NULL,
    options JSON NOT NULL, -- Array of 4 strings
    correct_option INT NOT NULL, -- 0, 1, 2, or 3
    explanation TEXT NOT NULL,
    marks INT DEFAULT 1,
    negative_marks DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_obj_category (category),
    INDEX idx_obj_topic (topic),
    INDEX idx_obj_difficulty (difficulty)
) ENGINE=InnoDB;

-- 4. Coding Assessment Problems Bank
CREATE TABLE IF NOT EXISTS coding_problems (
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
) ENGINE=InnoDB;

-- 5. Timed Assessment Sessions (Aptitude, Logical, Verbal, Numerical, Coding)
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    section_type VARCHAR(50) NOT NULL, -- 'aptitude', 'logical_reasoning', 'verbal_ability', 'numerical_reasoning', 'coding'
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
    INDEX idx_sess_candidate (candidate_id),
    INDEX idx_sess_section (section_type),
    INDEX idx_sess_status (status)
) ENGINE=InnoDB;

-- 6. Objective Assessment Candidate Answers
CREATE TABLE IF NOT EXISTS assessment_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    candidate_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option INT NULL, -- 0, 1, 2, 3 or null
    is_correct BOOLEAN DEFAULT FALSE,
    marks_awarded DECIMAL(4,2) DEFAULT 0.00,
    time_spent_seconds INT DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ans_session (session_id)
) ENGINE=InnoDB;

-- 7. Coding Assessment Submissions
CREATE TABLE IF NOT EXISTS coding_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    candidate_id INT NOT NULL,
    problem_id VARCHAR(50) NOT NULL,
    language VARCHAR(20) NOT NULL, -- 'c', 'cpp', 'python', 'java', 'mysql'
    code TEXT NOT NULL,
    passed_tests INT DEFAULT 0,
    total_tests INT DEFAULT 0,
    score INT DEFAULT 0,
    execution_output TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_coding_session (session_id)
) ENGINE=InnoDB;

-- 8. Proctoring Events and Violation Logs
CREATE TABLE IF NOT EXISTS proctoring_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    session_type ENUM('interview', 'assessment') DEFAULT 'assessment',
    candidate_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'face_missing', 'multiple_faces', 'gaze_away', 'excessive_noise', 'low_lighting', 'tab_switch', 'window_blur'
    severity ENUM('low', 'medium', 'high') DEFAULT 'low',
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_proctor_session (session_id),
    INDEX idx_proctor_candidate (candidate_id),
    INDEX idx_proctor_type (event_type)
) ENGINE=InnoDB;

-- 9. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    title VARCHAR(255) DEFAULT 'Technical Competency Evaluation',
    category VARCHAR(100) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    total_questions INT DEFAULT 5,
    status ENUM('in_progress', 'completed', 'evaluated', 'cancelled') DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_interview_candidate (candidate_id),
    INDEX idx_interview_status (status)
) ENGINE=InnoDB;

-- 10. Interview Questions Junction
CREATE TABLE IF NOT EXISTS interview_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question_id INT NOT NULL,
    order_index INT NOT NULL,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_iq_interview (interview_id)
) ENGINE=InnoDB;

-- 11. Candidate Interview Answers
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question_id INT NOT NULL,
    candidate_id INT NOT NULL,
    text_answer TEXT,
    time_spent_seconds INT DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_answer_interview (interview_id)
) ENGINE=InnoDB;

-- 12. Question Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
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
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_eval_interview (interview_id)
) ENGINE=InnoDB;

-- 13. Final Results Table
CREATE TABLE IF NOT EXISTS results (
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
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_result_candidate (candidate_id)
) ENGINE=InnoDB;

-- 14. Audit Logs Table (Recruiter and Admin Activity)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB;
