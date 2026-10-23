import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

const request = (path, options = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING INTERVIEWIQ BACKEND INTEGRATION TESTS ---');

  // 1. Health Check
  const health = await request('/health');
  console.log(`[1] Health Check: Status ${health.status} -> ${health.data?.status}`);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Candidate Login
  const candidateLogin = await request('/auth/login', { method: 'POST' }, {
    email: 'candidate@example.com',
    password: 'candidate123',
  });
  console.log(`[2] Candidate Login: Status ${candidateLogin.status} -> Token: ${!!candidateLogin.data?.token}`);
  if (candidateLogin.status !== 200) throw new Error('Candidate login failed');
  const candidateToken = candidateLogin.data.token;

  // 3. Admin Login
  const adminLogin = await request('/auth/login', { method: 'POST' }, {
    email: 'admin@example.com',
    password: 'admin123',
  });
  console.log(`[3] Admin Login: Status ${adminLogin.status} -> Role: ${adminLogin.data?.user?.role}`);
  if (adminLogin.status !== 200 || adminLogin.data.user.role !== 'admin') throw new Error('Admin login failed');
  const adminToken = adminLogin.data.token;

  // 4. Questions List
  const questionsRes = await request('/questions', {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  console.log(`[4] Fetch Questions: Status ${questionsRes.status} -> Count: ${questionsRes.data?.count}`);
  if (questionsRes.status !== 200 || questionsRes.data.count < 30) throw new Error('Questions fetch failed or count < 30');

  // 5. Start an Assessment
  const startRes = await request('/interviews/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
  }, {
    category: 'React',
    difficulty: 'Medium',
    questionCount: 5,
  });
  console.log(`[5] Start Interview: Status ${startRes.status} -> ID: ${startRes.data?.interview?.id}`);
  if (startRes.status !== 201) throw new Error('Start interview failed');
  const interviewId = startRes.data.interview.id;

  // 6. Submit Assessment with Answers
  const sampleQuestions = startRes.data.questions;
  const answersPayload = sampleQuestions.map((q, idx) => ({
    questionId: q.id,
    textAnswer: `In React and web development, ${q.skill || 'this concept'} involves virtual dom, diffing algorithm, reconciliation, and batching. We understand this clearly and it is efficient and optimized.`,
    timeSpentSeconds: 60,
  }));

  const completeRes = await request(`/interviews/${interviewId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
  }, {
    answers: answersPayload,
    durationSeconds: 300,
  });
  console.log(`[6] Complete Assessment: Status ${completeRes.status} -> Overall Score: ${completeRes.data?.report?.overallScore}%, Tech: ${completeRes.data?.report?.technicalScore}%, Rec: ${completeRes.data?.report?.recommendation}`);
  if (completeRes.status !== 200 || !completeRes.data.report.overallScore) throw new Error('Assessment completion failed');

  // 7. Candidate Dashboard
  const candDash = await request('/candidates/dashboard', {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  console.log(`[7] Candidate Dashboard: Status ${candDash.status} -> Average Score: ${candDash.data?.stats?.averageScore}%`);
  if (candDash.status !== 200) throw new Error('Candidate dashboard failed');

  // 8. Admin Dashboard
  const adminDash = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`[8] Admin Dashboard: Status ${adminDash.status} -> Total Candidates: ${adminDash.data?.stats?.totalCandidates}`);
  if (adminDash.status !== 200) throw new Error('Admin dashboard failed');

  // 9. Results Lookup
  const resultRes = await request(`/results/${interviewId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`[9] Result Report Lookup: Status ${resultRes.status} -> Overall Score: ${resultRes.data?.result?.overall_score}%`);
  if (resultRes.status !== 200) throw new Error('Result lookup failed');

  console.log('--- ALL INTERVIEWIQ BACKEND INTEGRATION TESTS PASSED! ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('[Test Failure]:', err.message);
  process.exit(1);
});
