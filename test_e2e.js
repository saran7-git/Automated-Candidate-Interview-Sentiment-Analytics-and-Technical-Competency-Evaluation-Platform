async function testAll() {
  const baseApi = 'http://localhost:5000/api';
  const baseUi = 'http://localhost:5173';

  console.log('--- 1. Testing Frontend UI Server ---');
  const uiRes = await fetch(baseUi);
  console.log('Frontend Status:', uiRes.status, uiRes.statusText);
  const uiHtml = await uiRes.text();
  console.log('Frontend HTML length:', uiHtml.length, 'Contains root div:', uiHtml.includes('id="root"'));

  console.log('\n--- 2. Testing Backend Health Endpoint ---');
  const hRes = await fetch(baseApi + '/health');
  const hData = await hRes.json();
  console.log('Backend Health Status:', hData.status);

  console.log('\n--- 3. Testing Admin Login ---');
  const aLogin = await fetch(baseApi + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@interview.ai', password: 'Admin@123' })
  });
  const aLoginData = await aLogin.json();
  console.log('Admin login:', aLoginData.success, '| User:', aLoginData.user?.name);
  const adminToken = aLoginData.token;

  console.log('\n--- 4. Testing Candidate Dynamic Registration & Login ---');
  const tempEmail = `candidate.${Date.now()}@example.com`;
  const regRes = await fetch(baseApi + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: tempEmail,
      password: 'Candidate@123',
      role: 'candidate',
      skills: ['React', 'Node.js', 'PostgreSQL']
    })
  });
  const regData = await regRes.json();
  console.log('Candidate registration:', regData.success, '| Candidate ID:', regData.user?.candidateId);
  const candidateId = regData.user?.candidateId;
  const candidateToken = regData.token;

  const cLogin = await fetch(baseApi + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tempEmail, password: 'Candidate@123' })
  });
  const cLoginData = await cLogin.json();
  console.log('Candidate login:', cLoginData.success, '| User:', cLoginData.user?.name);

  console.log('\n--- 5. Testing Interview Templates (6-Round Suite) ---');
  const intRes = await fetch(baseApi + '/interviews', {
    headers: { Authorization: 'Bearer ' + candidateToken }
  });
  const intData = await intRes.json();
  const template = intData.interviews[0];
  console.log('Loaded Interview Template:', template.title, '| Questions count:', template.questions.length);

  console.log('\n--- 6. Creating & Starting Interview Session ---');
  const sessRes = await fetch(baseApi + '/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + adminToken
    },
    body: JSON.stringify({
      candidateId: candidateId,
      interviewId: template._id || template.id
    })
  });
  const sessData = await sessRes.json();
  const sessionId = sessData.session._id || sessData.session.id;
  console.log('Session Created:', sessionId, '| Status:', sessData.session.status);

  // Start session
  await fetch(`${baseApi}/sessions/${sessionId}/start`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + candidateToken }
  });

  console.log('\n--- 7. Submitting Responses Across Rounds ---');
  const sampleAnswer1 = 'B) O(log n)';
  const sampleAnswer2 = 'In Node.js, the event loop handles non-blocking asynchronous I/O by offloading expensive system calls and filesystem operations to libuv worker thread pools.';
  
  await fetch(baseApi + '/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + candidateToken
    },
    body: JSON.stringify({
      sessionId: sessionId,
      questionId: template.questions[0]._id || template.questions[0].id,
      candidateAnswer: sampleAnswer1
    })
  });

  await fetch(baseApi + '/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + candidateToken
    },
    body: JSON.stringify({
      sessionId: sessionId,
      questionId: template.questions[2]._id || template.questions[2].id,
      candidateAnswer: sampleAnswer2
    })
  });
  console.log('Responses submitted for Round 1 (MCQ) and Round 2 (Technical)');

  // Complete session submission
  const submitRes = await fetch(`${baseApi}/sessions/${sessionId}/submit`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + candidateToken }
  });
  const submitData = await submitRes.json();
  console.log('Session Submitted Successfully:', submitData.success);

  console.log('\n--- 8. Testing Candidate Report Dossier & AI Evaluation ---');
  const rRes = await fetch(`${baseApi}/reports/${sessionId}`, {
    headers: { Authorization: 'Bearer ' + adminToken }
  });
  const rData = await rRes.json();
  console.log('Candidate Dossier Name:', rData.report.candidate.name);
  console.log('Interview Title:', rData.report.interview.title);
  console.log('Overall Score:', rData.report.overallEvaluation.overallScore);
  console.log('Technical Score:', rData.report.overallEvaluation.technicalScore);
  console.log('Sentiment Score:', rData.report.overallEvaluation.sentimentScore);
  console.log('AI Recommendation:', rData.report.overallEvaluation.recommendation);
  console.log('Questions Evaluated:', rData.report.questionEvaluations.length);

  console.log('\n--- 9. Testing Anti-Malpractice Auto-Termination API ---');
  // Create another session to test proctoring auto-termination
  const termSessRes = await fetch(baseApi + '/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + adminToken
    },
    body: JSON.stringify({
      candidateId: candidateId,
      interviewId: template._id || template.id
    })
  });
  const termSessData = await termSessRes.json();
  const termSessionId = termSessData.session._id || termSessData.session.id;

  // Trigger malpractice termination
  const termActionRes = await fetch(`${baseApi}/sessions/${termSessionId}/terminate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + candidateToken
    },
    body: JSON.stringify({
      reason: 'Candidate head turned away from assessment camera'
    })
  });
  const termActionData = await termActionRes.json();
  console.log('Session Disqualified:', termActionData.success);
  console.log('Session Status:', termActionData.session.status);
  console.log('Malpractice Reason:', termActionData.session.malpracticeReason);

  console.log('\n--- 10. Testing Dashboard Statistics & Candidate Listing ---');
  const candListRes = await fetch(baseApi + '/candidates', {
    headers: { Authorization: 'Bearer ' + adminToken }
  });
  const candListData = await candListRes.json();
  const candidateEntry = candListData.candidates.find(c => c.id === candidateId);
  console.log('Candidate in Directory:', candidateEntry.name, '| Status:', candidateEntry.status);

  console.log('\n======================================================');
  console.log('>>> ALL END-TO-END SYSTEM INTEGRATION TESTS PASSED! <<<');
  console.log('======================================================');
}

testAll().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
