# InterviewIQ

### Automated Candidate Interview Sentiment Analytics & Technical Competency Evaluation Platform
**"Smarter Interviews. Better Decisions."**

InterviewIQ is a commercial-grade, production-style AI Interview Analytics SaaS platform split into two dedicated web applications powered by a centralized backend:

1. **Candidate & User Portal (`frontend-user`)**: `http://localhost:3000`
2. **Admin & Recruiter Console (`frontend-admin`)**: `http://localhost:3001`
3. **Centralized REST API Backend (`backend`)**: `http://localhost:5000`

---

## 🌟 Dual-Application Architecture

```text
                                  ┌─────────────────────────────┐
                                  │      InterviewIQ Backend    │
                                  │    Node.js / Express (5000) │
                                  └──────────────┬──────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
        ┌───────────────────────────────┐                 ┌───────────────────────────────┐
        │     Candidate & User Portal   │                 │   Recruiter & Admin Console   │
        │      (frontend-user: 3000)    │                 │     (frontend-admin: 3001)    │
        ├───────────────────────────────┤                 ├───────────────────────────────┤
        │ • SaaS Marketing Landing Page │                 │ • Recruiter Dashboard         │
        │ • Real-Time Device Check      │                 │ • 40+ Question Bank Manager   │
        │ • Technical Assessment Room   │                 │ • Multi-Stream Media Audit    │
        │ • AI Performance Report       │                 │ • Candidate Directory         │
        │ • Longitudinal Analytics      │                 │ • Cohort Analytics & Trends   │
        └───────────────────────────────┘                 └───────────────────────────────┘
```

---

## 🔑 Demo Login Credentials

Both portals provide **1-Click Quick Demo Autofill** buttons:

| Portal | Port | Demo Account | Password | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Candidate Portal** | `http://localhost:3000` | `candidate@example.com` | `candidate123` | Full access to technical tests & personal report cards |
| **Admin Console** | `http://localhost:3001` | `admin@example.com` | `admin123` | Full access to recruitment metrics, question bank & audits |

---

## 📐 AI Evaluation Model

$$\text{Overall Score} = (\text{Technical Competency} \times 0.60) + (\text{Answer Relevance} \times 0.25) + (\text{Communication Sentiment} \times 0.15)$$

- **Technical Competency (60%)**: Concept coverage against expected model answers, keyword presence, and architectural depth.
- **Answer Relevance (25%)**: Semantic intent alignment and question overlap.
- **Communication Sentiment (15%)**: Lexicon polarity, confidence markers, and clarity index.

---

## 🚀 How to Run the Applications

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm run seed     # Seeds 40+ questions, demo accounts, and sample assessments
npm start        # Runs on http://localhost:5000
```

### 2. Start the Candidate Website (Port 3000)
```bash
cd frontend-user
npm install
npm run dev      # Runs on http://localhost:3000
```

### 3. Start the Admin & Recruiter Website (Port 3001)
```bash
cd frontend-admin
npm install
npm run dev      # Runs on http://localhost:3001
```

---

## 📂 Project Structure

```text
├── backend/                          # Express.js REST API on Port 5000
│   ├── config/db.js                  # MySQL2 database connection & memory engine
│   ├── controllers/                  # Auth, Interviews, Questions, Evaluations, Admin
│   ├── middleware/                   # JWT verification & error handling
│   ├── services/                     # AI sentiment, competency & evaluation pipelines
│   ├── seeds/seedData.js             # 40+ questions across 10 domains & demo data
│   └── server.js                     # Express server entry point
│
├── frontend-user/                    # Candidate Web Application on Port 3000
│   ├── src/
│   │   ├── pages/landing/            # Marketing Landing Page
│   │   ├── pages/auth/               # Candidate Sign-in & Register
│   │   ├── pages/candidate/          # Dashboard, Assessment Room, AI Report, Performance
│   │   ├── components/               # Gauges, charts, visualizers & modals
│   │   └── App.jsx                   # Candidate Route Hierarchy
│   └── vite.config.js                # Port 3000 + Proxy to Backend
│
└── frontend-admin/                   # Recruiter Web Application on Port 3001
    ├── src/
    │   ├── pages/auth/               # Dedicated Recruiter Sign-in
    │   ├── pages/admin/              # Dashboard, Candidates, Question Bank, Submissions
    │   ├── components/admin/         # Media sync player, Question timeline, Modals
    │   └── App.jsx                   # Admin Route Hierarchy
    └── vite.config.js                # Port 3001 + Proxy to Backend
```
