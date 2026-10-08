# Automated Candidate Interview Sentiment Analytics and Technical Competency Evaluation Platform

A full-stack, production-grade automated candidate interview analytics platform designed for engineering recruitment teams. The system analyzes candidate interview responses across two fundamental dimensions: **AI/NLP Sentiment & Demeanor Analysis** and **Multi-Faceted Technical Competency Evaluation**.

The platform is designed as an end-to-end recruitment suite featuring role-based portals for both recruiters and candidates, real-time analytics dashboards, automated scoring pipelines, detailed evaluation dossiers, and candidate comparison matrices.

---

## 1. Project Architecture & System Flow

```
                      +---------------------------------------+
                      |       Candidate / Admin Portals       |
                      |       (React 19 + Vite + Tailwind)    |
                      +---------------------------------------+
                                          |
                                    HTTPS / REST
                                          v
                      +---------------------------------------+
                      |         Node.js + Express API         |
                      |   (Auth, Sessions, Responses, Admin)  |
                      +---------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
+-------------------------------+                  +-------------------------------+
|     AI Evaluation Pipeline    |                  |        Database Layer         |
|  - Sentiment Analysis (NLP)   |                  |  - Live MongoDB Daemon        |
|  - Technical Evaluation (NLP) |                  |  - Zero-Crash Embedded JSON   |
|  - Score Weighting (70/30)    |                  |    Document Engine (Fallback) |
|  - Qualitative AI Feedback    |                  +-------------------------------+
+-------------------------------+
                |
                v
+-------------------------------+
|  Aggregated Dossiers & Charts |
|  - Relevance, Correctness     |
|  - Concept Coverage (Detected)|
|  - Sentiment Timeline Trends  |
|  - Hiring Recommendation      |
+-------------------------------+
```

---

## 2. Key Features

### For Recruiters / Admins (`/admin`)
- **Executive Analytics Dashboard:**
  - Real-time aggregate statistics: Total Candidates, Total Interviews, Completed Sessions, Pending Sessions.
  - Average Technical Score (70% weight) and Average Sentiment Score (30% weight).
  - Sentiment Distribution Doughnut / Pie Chart (Positive, Neutral, Negative percentages).
  - Technical Competency Distribution (Excellent: $\ge 80$, Good: $70\text{--}79$, Average: $50\text{--}69$, Needs Improvement: $<50$).
  - Technical Category Performance Breakdown across 8 disciplines.
  - Recent candidate evaluations table with quick actions.
- **Candidate Management Suite:**
  - Live search across candidates by name, email, and interview role.
  - Multi-criteria filtering by Status, Sentiment Polarity, Score Tier, and Interview Template.
  - On-demand AI Re-Evaluation execution with real-time feedback.
  - One-click deletion with cascade cleanup of candidate responses and reports.
  - Candidate enrollment modal with instant interview assignment.
- **Interview Template & Question Builder:**
  - Dynamic question creation across 8 categories: Programming, Database, Networking, Operating Systems, Data Structures, AI/ML, General Technical, and HR/Behavioral.
  - Question configuration: Question Prompt, Difficulty, Maximum Marks, Key Concepts / Keywords, and Expected Model Reference Answer.
- **Candidate Evaluation Dossier (`/admin/reports/:sessionId`):**
  - Weighted overall score calculation: $\text{Overall} = (\text{Technical} \times 0.70) + (\text{Sentiment} \times 0.30)$.
  - Sub-metric breakdown: Relevance, Correctness, Key Concept Coverage, and Explanation Completeness.
  - Question-by-question timeline graph tracking technical score and sentiment across question sequence.
  - Concept detection breakdown: displays Detected Concepts (green tags) and Missing Concepts (rose tags).
  - AI-generated hiring recommendation: *Strong Hire*, *Recommended*, *Consider with Reservations*, or *Not Recommended*.
  - AI-generated qualitative strengths, gaps, and constructive feedback.
  - Print-ready format (`Export / Print Report`).
- **Candidate Comparison Matrix (`/admin/compare`):**
  - Side-by-side comparative analysis of 2 to 4 candidates.
  - Comparative bar charts contrasting technical vs sentiment performance.
  - Sub-scores and key strength differentials.

### For Candidates (`/candidate`)
- **Candidate Portal Dashboard:**
  - View assigned, in-progress, and completed interview assessments.
  - Review latest completed assessment score, recommendation, and status.
- **Hardware Diagnostics & Pre-Assessment System Check:**
  - Mandatory webcam and microphone diagnostics before assessment launch.
  - Live video viewfinder mirror with face framing alignment guide.
  - Real-time microphone audio input visualizer with dynamic volume level meter.
  - Browser permissions and speech recognition capability verification.
- **Strict Real-Time AI Proctoring & Malpractice Auto-Termination:**
  - **Computer Vision Frame Analysis:** Live HTML5 canvas pixel analysis and facial centroid tracking running every 850ms.
  - **Out-of-Frame Detection:** Alerts if the candidate moves away from the camera or leaves the seat.
  - **Averted Gaze / Looking Away Detection:** Detects if the candidate looks away from the screen or exhibits persistent averted gaze.
  - **Window Blur / Tab Switch Detection:** Instant detection of tab switching, window minimization, or devtool opening.
  - **3-Second Emergency Warning HUD:** Displays a prominent pulsing red countdown timer. If the candidate fails to return their gaze to the screen within 3 seconds (or instantly upon tab blur), the assessment **terminates immediately**.
  - **Automatic Disqualification:** Server automatically marks the session as `disqualified`, records the specific violation reason, voids all scores to 0/100, and locks the candidate into a dedicated Disqualification Incident Page (`/candidate/terminated/:sessionId`).
- **Comprehensive 6-Round Multi-Modal Assessment Workspace:**
  - **Round 1 — MCQ Round:** Rapid-fire core computer science concepts with interactive A/B/C/D option cards and selection indicators.
  - **Round 2 — Technical Round:** Deep-dive architectural and system design engineering prompts with real-time word count telemetry.
  - **Round 3 — Aptitude Round:** Quantitative logic, work rate calculations, and algorithmic reasoning MCQs.
  - **Round 4 — Coding Round:** Built-in interactive code editor with syntax highlighting, language selector (JavaScript, Python, Java, C++), code template reset, and an in-browser sandbox runner with pass/fail test case badges.
  - **Round 5 — Communication Round:** Audio verbal dictation testing communication clarity, incident response articulation, and speech transcription.
  - **Round 6 — HR Final AI Round:** Behavioral, situational leadership, and ethical decision-making scenarios evaluated by multi-phase sentiment NLP.
- **Floating Proctoring Camera Widget:** Live picture-in-picture webcam feed with active monitoring indicator (`● PROCTORING ACTIVE`), head pose tracking, and real-time audio visualizer bars.
- **Question Jump Palette & Auto-Save:** Instant navigation between rounds and questions with continuous draft auto-saving.

---

## 3. AI & NLP Evaluation Methodology

The system operates a multi-stage evaluation pipeline for every submitted answer:

### A. Sentiment Analysis Engine
1. **Preprocessing:** Text cleaning, tokenization, bigram extraction, intensifier detection, and negation tracking (e.g. "not bad" vs "not good").
2. **Lexicon Scoring:** Evaluates communication enthusiasm, collaborative tone, and problem-solving confidence against professional lexicons.
3. **Probability Distribution:** Computes normalized probabilities across Positive, Neutral, and Negative classes.
4. **0–100 Normalized Sentiment Score:**
   - **Positive:** Normalized to 80–100 (confident, solution-oriented, enthusiastic).
   - **Neutral:** Normalized to 40–79 (objective, matter-of-fact technical definition).
   - **Negative:** Normalized to 0–39 (hesitant, frustrated, struggled, confused).

### B. Technical Competency Evaluation Engine
For each question, the answer is evaluated against the expected answer and key concepts:
1. **Relevance (0–100):** Measures question-to-answer topical alignment and semantic overlap.
2. **Correctness (0–100):** Validates technical accuracy against expected answer principles and absence of contradictions.
3. **Concept Coverage (0–100):** Performs exact and fuzzy n-gram matching against question keywords and concepts:
   $$\text{Coverage Score} = \left(\frac{\text{Detected Concepts}}{\text{Total Expected Concepts}}\right) \times 100$$
4. **Completeness & Depth (0–100):** Evaluates explanation depth, architectural reasoning indicators ("for example", "because", "trade-offs", "which means"), and structural elaboration.
5. **Technical Competency Score:**
   $$\text{Technical Score} = (\text{Relevance} \times 0.20) + (\text{Correctness} \times 0.40) + (\text{Coverage} \times 0.25) + (\text{Completeness} \times 0.15)$$

### C. Overall Candidate Score Formula
$$\text{Overall Candidate Score} = (\text{Technical Score} \times 0.70) + (\text{Sentiment Score} \times 0.30)$$

### D. AI Fallback & Resilience
- If an external LLM API key (`AI_API_KEY`) is provided in `.env`, the system can utilize Gemini / OpenAI compatible endpoints.
- If external connectivity is unavailable or no key is provided, the deterministic built-in NLP engine executes locally without downtime. Every evaluation records `pipelineUsed` for full audit transparency.

---

## 4. Technology Stack

- **Frontend:**
  - React 19 + Vite 8
  - Tailwind CSS 3
  - React Router DOM 7
  - Recharts (Data visualization & charts)
  - Lucide React (Icons)
  - Axios (API client with JWT interceptor)
- **Backend:**
  - Node.js (v18+) + Express.js 4
  - JWT (JSON Web Tokens) & bcryptjs password hashing
  - Helmet (HTTP security headers)
  - CORS (Cross-origin resource sharing)
  - express-rate-limit (Rate limiting for AI endpoints)
- **Database:**
  - MongoDB via Mongoose ORM
  - Built-in Zero-Crash Embedded JSON Document Engine (automatically actives if local MongoDB daemon is offline, ensuring zero installation friction).

---

## 5. Project Directory Structure

```text
Mini-Project/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── aiPipeline.js          # Unified evaluation coordinator & fallback
│   │   │   ├── sentimentService.js    # NLP Sentiment & tone analyzer
│   │   │   └── technicalService.js    # Concept coverage & correctness scorer
│   │   ├── config/
│   │   │   └── db.js                  # Dual-engine database adapter
│   │   ├── controllers/
│   │   │   ├── aiController.js        # AI execution endpoints
│   │   │   ├── authController.js      # JWT register & login
│   │   │   ├── candidateController.js # Candidate CRUD
│   │   │   ├── dashboardController.js # Aggregate analytics & comparison
│   │   │   ├── interviewController.js # Interview templates & questions
│   │   │   ├── reportController.js    # Dossier generation
│   │   │   ├── responseController.js  # Answer persistence & autosave
│   │   │   └── sessionController.js   # Session lifecycle & submissions
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT & role authorization (admin/candidate)
│   │   │   └── errorHandler.js        # Global JSON error response handler
│   │   ├── models/
│   │   │   ├── Candidate.js
│   │   │   ├── Evaluation.js
│   │   │   ├── FinalReport.js
│   │   │   ├── Interview.js
│   │   │   ├── InterviewSession.js
│   │   │   ├── Question.js
│   │   │   ├── Response.js
│   │   │   ├── User.js
│   │   │   └── modelFactory.js
│   │   ├── routes/
│   │   │   ├── aiRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── candidateRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── responseRoutes.js
│   │   │   └── sessionRoutes.js
│   │   ├── utils/
│   │   │   └── seedData.js            # Comprehensive demo seeder
│   │   └── server.js                  # Express entry point
│   ├── data/                          # Persisted JSON collections (embedded mode)
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              # Axios instance & API modules
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx     # AI stage loaders
│   │   │   ├── Modal.jsx              # Reusable modal
│   │   │   ├── Navbar.jsx             # Top bar with user badge
│   │   │   ├── ScoreBadge.jsx         # Colored score & recommendation pills
│   │   │   ├── SentimentBadge.jsx     # Tone polarity pills
│   │   │   ├── Sidebar.jsx            # Admin sidebar
│   │   │   └── StatCard.jsx           # Metric cards
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth state & token storage
│   │   │   └── ToastContext.jsx       # Notification toasts
│   │   ├── layouts/
│   │   │   ├── CandidateLayout.jsx    # Candidate portal wrapper
│   │   │   └── MainLayout.jsx         # Admin dashboard wrapper
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── CandidateComparisonPage.jsx
│   │   │   │   ├── CandidateManagement.jsx
│   │   │   │   ├── CandidateReportPage.jsx
│   │   │   │   └── InterviewManagement.jsx
│   │   │   ├── candidate/
│   │   │   │   ├── CandidateDashboard.jsx
│   │   │   │   ├── InterviewCompletionPage.jsx
│   │   │   │   ├── InterviewInstructions.jsx
│   │   │   │   └── InterviewSessionPage.jsx
│   │   │   └── public/
│   │   │       ├── LoginPage.jsx
│   │   │       └── RegisterPage.jsx
│   │   ├── App.jsx                    # Routing configuration
│   │   ├── index.css                  # Tailwind styles
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── test_e2e.js                        # Complete end-to-end integration test suite
├── package.json                       # Root convenience commands
└── README.md
```

---

## 6. Installation & Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- *(Optional)* Local MongoDB daemon (if not running, the system automatically uses its embedded JSON engine with zero configuration needed).

### Step 1: Install Dependencies
From the project root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Step 2: Configure Environment Variables
Verify or create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/interview_analytics
JWT_SECRET=super_secret_jwt_key_for_interview_sentiment_platform_2026
AI_API_KEY=
AI_MODEL=gemini-1.5-flash
NODE_ENV=development
```

### Step 3: Seed Database (Demo Data)
Populate realistic candidates, interviews, questions, and evaluated dossiers:
```bash
npm run seed
```

### Step 4: Start Backend and Frontend
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
npm run start:backend
# Backend starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run start:frontend
# Frontend starts on http://localhost:5173
```

---

## 7. Account Management & Database Administration

The platform is designed to maintain real user accounts with password hashing (bcrypt) and JWT session tokens. All demo data has been removed to provide a clean database.

### System Administrator Access
The system initializes with a default administrator account:
| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin / Recruiter** | `admin@interview.ai` | `Admin@123` | Full dashboard, candidate directory, report dossier, and interview management |

### Candidate Registration Flow
1. Navigate to `http://localhost:5173/register` or click **"Create New Candidate Account"** on the login page.
2. Enter your Name, Email, Password, and Technical Skills.
3. Upon registration, an account is created in the database and automatically enrolled in the active technical interview template.
4. Candidates can log in anytime at `http://localhost:5173/login` using their registered email and password to start or continue interviews.

### Database Maintenance Commands
From the `backend` directory:
```bash
# Initialize clean database baseline (Admin account & interview question bank)
npm run db:init

# Reset database (purges candidate entries and leaves clean admin + templates)
npm run db:reset
```

---

## 8. REST API Reference

### Authentication
- `POST /api/auth/register` — Register a candidate or admin account
- `POST /api/auth/login` — Sign in and obtain JWT access token
- `GET  /api/auth/me` — Verify authenticated user profile

### Dashboard & Analytics
- `GET  /api/dashboard/statistics` — Retrieve aggregate dashboard metrics, distributions, category breakdowns, and top candidates
- `POST /api/dashboard/compare` — Compare 2–4 candidates side-by-side (`sessionIds: [...]`)

### Candidates
- `GET    /api/candidates` — List all candidates with latest scores and session statuses
- `GET    /api/candidates/:id` — Get candidate details with all interview sessions
- `POST   /api/candidates` — Add candidate and assign interview
- `PUT    /api/candidates/:id` — Update candidate profile
- `DELETE /api/candidates/:id` — Cascade delete candidate and associated interview data

### Interviews
- `GET    /api/interviews` — List interview templates
- `GET    /api/interviews/:id` — Get interview template details and questions
- `POST   /api/interviews` — Create new interview template with questions
- `PUT    /api/interviews/:id` — Update interview template
- `DELETE /api/interviews/:id` — Delete interview template

### Interview Sessions & Responses
- `POST /api/sessions` — Assign interview session to candidate
- `GET  /api/sessions/:id` — Get session details, questions, and responses
- `GET  /api/sessions/candidate/:candidateId` — Get all sessions for a candidate
- `POST /api/sessions/:id/start` — Mark interview session as started
- `POST /api/sessions/:id/submit` — Submit answers and trigger AI evaluation pipeline
- `POST /api/sessions/:id/terminate` — Immediately disqualify and terminate session due to detected malpractice
- `POST /api/responses` — Save or autosave candidate response for a question
- `GET  /api/responses/:sessionId` — Retrieve all responses for a session

### AI Evaluation & Reports
- `POST /api/ai/analyze` — Analyze raw answer on the fly
- `POST /api/ai/analyze/:responseId` — Evaluate specific response document
- `POST /api/ai/analyze-session/:sessionId` — Execute full AI evaluation pipeline on all session responses
- `GET  /api/reports/:sessionId` — Retrieve candidate evaluation report dossier
- `GET  /api/reports/candidate/:candidateId` — Retrieve candidate's latest report

---

## 9. Running Automated Integration Tests

Run the built-in end-to-end integration test suite to verify all APIs, NLP pipelines, scoring logic, and UI server:
```bash
npm test
```
Outputs status checks across Frontend UI (HTTP 200), Backend Health (online), Admin & Candidate Auth, Dashboard Statistics, Concept Matching, Report Generation, and Multi-Candidate Comparisons.
