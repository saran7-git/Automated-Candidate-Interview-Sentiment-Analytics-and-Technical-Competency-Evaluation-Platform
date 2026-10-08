const BASE_URL = 'http://localhost:5000/api';

async function testMalpracticeFlow() {
  console.log('=== Starting Anti-Malpractice Proctoring Termination Test ===\n');

  // 1. Register candidate
  const email = `cheater_${Date.now()}@test.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Malpractice Test Candidate',
      email,
      password: 'TestPassword@123',
      role: 'candidate',
      skills: ['Security Testing']
    })
  });
  const regData = await regRes.json();
  const token = regData.token;
  const candidateId = regData.user.candidateId || regData.user.id;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('1. Candidate Registered. Candidate ID:', candidateId);

  // 2. Fetch active session
  const sessRes = await fetch(`${BASE_URL}/sessions/candidate/${candidateId}`, {
    headers: authHeaders
  });
  const sessData = await sessRes.json();
  const session = sessData.sessions[0];
  const sessionId = session._id || session.id;
  console.log('2. Assessment Session active:', sessionId);

  // 3. Trigger immediate termination due to exceeding 10 malpractice attempts
  console.log('3. Triggering automated proctoring termination (10 Malpractice Strikes / Tab Switches)...');
  const termRes = await fetch(`${BASE_URL}/sessions/${sessionId}/terminate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      reason: '10 Malpractice warning attempts exceeded (Continuous eye gaze averted + 10 tab switches)',
      violationType: 'MALPRACTICE_LIMIT_EXCEEDED',
      totalAttempts: 10,
      totalTabSwitches: 10
    })
  });
  const termData = await termRes.json();
  console.log('✔ Termination API Response:', termData.message);
  console.log('✔ Session Status:', termData.session.status);
  console.log('✔ Malpractice Reason:', termData.session.malpracticeReason);

  // 4. Fetch final report and verify 0 score
  console.log('4. Verifying Candidate Disqualification Dossier in Recruiter Report...');
  const repRes = await fetch(`${BASE_URL}/reports/session/${sessionId}`, {
    headers: authHeaders
  });
  const repData = await repRes.json();
  const overall = repData.report.overallEvaluation;
  console.log('✔ Candidate Overall Score:', overall.overallScore);
  console.log('✔ Candidate Technical Score:', overall.technicalScore);
  console.log('✔ Candidate Recommendation:', overall.recommendation);
  console.log('✔ Proctoring Status:', overall.malpracticeAudit);

  if (overall.overallScore === 0 && overall.recommendation.includes('Disqualified')) {
    console.log('\n=== Anti-Malpractice 10-Strike Termination Workflow PASSED! ===');
  } else {
    throw new Error('Disqualification score was not 0 or status was not Disqualified');
  }
}

testMalpracticeFlow().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
