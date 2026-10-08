# 2026 Foundation Assessment, Coding & Conversational Personal AI HR Recruitment Platform

A state-of-the-art, full-stack automated evaluation platform designed for high-volume campus hiring and technical recruitment. The platform faithfully implements the official **2026 Foundation Assessment Pattern (65 Questions / 75 Minutes)**, **Interactive Coding IDE**, **Live Conversational Personal AI HR Round with Real-Time Counter-Questioning**, **Zero-Tolerance Anti-Malpractice Proctoring**, and **Video Session Recording & Presence Evaluation**.

---

## 1. 2026 Foundation Assessment Architecture

| Section | Number of Questions | Section Time Limit | Key Focus Topics |
| :--- | :---: | :---: | :--- |
| **1. Numerical Ability** | **20 Questions** | **25 Minutes** | Percentages, Ratio & Proportion, Profit & Loss, Averages, Time & Work, Time/Speed & Distance, Number System, LCM/HCF, Probability, Permutation & Combination, Mixtures, Data Interpretation |
| **2. Verbal Ability** | **25 Questions** | **25 Minutes** | Sentence completion, Grammar, Vocabulary, Reading comprehension, Sentence correction, Para/sentence arrangement |
| **3. Reasoning Ability** | **20 Questions** | **25 Minutes** | Number/letter series, Coding-decoding, Blood relations, Syllogisms, Directions, Seating arrangement, Data arrangement, Logical reasoning, Puzzles |
| **Foundation Total** | **65 Questions** | **75 Minutes** | **Standard 20 + 25 + 20 Structure with Dynamic Shuffling** |
| **4. Coding Assessment** | **1 Task** | **30 Minutes** | Interactive IDE sandbox with real-time test execution (JS, Python, Java, C++) |
| **5. Personal AI HR Round** | **Multi-Turn Dialogue** | **20 Minutes** | Conversational voice/text HR interview with dynamic counter-questions |

---

## 2. Key Platform Features

### 1. Dynamic AI Question Generator & Per-Student Shuffling
- **Live Question Synthesis:** Dynamically generates questions across all 12 Numerical subtopics, 6 Verbal subtopics, and 9 Reasoning subtopics.
- **Seeded Randomized Shuffling:** Generates candidate-specific question order and option permutations based on student identity, guaranteeing distinct question sets to prevent collusion.

### 2. Conversational Personal AI HR Interviewer
- **Interactive Multi-Turn Dialogue:** AI HR acts as a real interviewer, speaking questions and listening to candidate responses via Web Speech API (Text-to-Speech & Speech-to-Text).
- **Dynamic Context-Aware Counter-Questioning:** The AI analyzes candidate responses in real time, formulates contextual reactions, and challenges candidates with tailored follow-up counter-questions based on what they said.
- **Continuous Turn Logging:** Full conversation transcripts with turn-level communication, attitude, and composure metrics are saved directly into the candidate's recruiter dossier.

### 3. Presence, Attire, Grooming & Soft-Skills Evaluation
- **Visual & Audio Presence AI:** Evaluates candidate presentation from live video stream and voice frequencies.
- **6 Presence Scoring Dimensions:**
  - **Attire Score (0–100):** Business-appropriate clothing and camera framing.
  - **Grooming Score (0–100):** Lighting, background cleanliness, and presentation.
  - **Attitude Score (0–100):** Collaborative openness and receptive demeanor.
  - **Communication Score (0–100):** Articulation clarity, structured explanations, vocabulary.
  - **Emotion / EQ Score (0–100):** Vocal composure under time pressure.
  - **Posture / Gaze Score (0–100):** Screen focus and stability.
- **Qualitative Recruiter Dossier:** Synthesizes an executive narrative of candidate presence for hiring managers.

### 4. Zero-Tolerance Anti-Malpractice Proctoring
- **10-Second Continuous Eye Gaze Tracking:** Uses computer vision centroid & brightness tracking to detect averted gaze. Looking away from the screen for 10 continuous seconds logs a malpractice strike.
- **10 Tab Switch Warnings:** Fullscreen mode is strictly monitored; switching tabs prompts a warning modal (maximum 10 allowed).
- **Max 10 Malpractice Strikes Limit:** A unified strike counter monitors integrity infractions. Exceeding 10 total attempts results in **immediate assessment termination, disqualification, and zero score logging**.

### 5. Session Video Recording & Media Storage
- **Browser MediaRecorder Stream:** Records candidate video and audio into an encrypted WebM archive.
- **Recruiter Playback:** Hiring managers can review the candidate's recorded interview session directly within the Recruiter Report Dossier.

---

## 3. Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Recharts, Web Speech API, Web Audio API, MediaRecorder API.
- **Backend:** Node.js, Express, Rate Limiter, Helmet, CORS, JWT Authentication, Bcrypt.js.
- **Database:** Local MongoDB Daemon with resilient Mongoose fallback models.
- **AI / NLP Engine:** Dual-mode Hybrid Engine (Google Gemini 1.5 Flash + Deterministic Parametric Rule Engine).

---

## 4. Quick Start & Credentials

### Default User Credentials
- **Recruiter / Admin Account:**
  - Email: `admin@interview.ai`
  - Password: `Admin@123`
- **Candidate Account:**
  - Email: `candidate@interview.ai`
  - Password: `Candidate@123`
  - *(Or register any new candidate via the public registration portal)*

### Running Locally
```bash
# Start Backend (Port 5000)
cd backend
npm install
npm start

# Start Frontend (Port 5173)
cd frontend
npm install
npm run dev
```

---

## 5. Verification & Testing

Run the automated test suites:
```bash
# Test Foundation Question Generator, AI HR Counter-Questioning & Presence Engine
node backend/test_foundation_suite.js

# Test End-to-End Candidate Assessment, Video Recording & Report Synthesis
node backend/test_full_interview_flow.js
```
