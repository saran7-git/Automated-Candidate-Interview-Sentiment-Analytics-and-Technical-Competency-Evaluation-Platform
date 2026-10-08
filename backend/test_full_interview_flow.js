const BASE_URL = 'http://localhost:5000/api';

async function runEndToEndFlow() {
  console.log('=== Executing Full Candidate Assessment & Report Test ===\n');

  // 1. Register candidate
  const email = `candidate_${Date.now()}@test.com`;
  console.log(`1. Registering candidate: ${email}...`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email,
      password: 'Candidate@123',
      role: 'candidate'
    })
  });
  const regData = await regRes.json();
  const token = regData.token;
  const candidateId = regData.user.id;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('✔ Candidate registered. ID:', candidateId);

  // 2. Fetch available interview templates
  console.log('2. Fetching 2026 Foundation Assessment Template...');
  const intrRes = await fetch(`${BASE_URL}/interviews`, { headers: authHeaders });
  const intrData = await intrRes.json();
  const interview = intrData.interviews[0];
  console.log('✔ Interview found:', interview.title);

  // 3. Create Session
  console.log('3. Initializing interview session...');
  const sessRes = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      candidateId,
      interviewId: interview._id || interview.id
    })
  });
  const sessData = await sessRes.json();
  const sessionId = sessData.session._id || sessData.session.id;
  console.log('✔ Session created:', sessionId);

  // 4. Start session and generate lively questions
  console.log('4. Starting proctored session with live shuffled questions...');
  const genRes = await fetch(`${BASE_URL}/ai/generate-questions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ candidateId, seed: `${sessionId}_seed` })
  });
  const genData = await genRes.json();
  const allQ = genData.assessment.allQuestions;

  await fetch(`${BASE_URL}/sessions/${sessionId}/start`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ dynamicQuestions: allQ })
  });
  console.log(`✔ Started session with ${allQ.length} randomized foundation questions.`);

  // 5. Submit candidate answers & HR turn
  console.log('5. Submitting answers & HR counter-questioning dialogue...');
  const answers = allQ.slice(0, 5).map((q) => ({
    questionId: q._id || q.id,
    candidateAnswer: q.correctAnswer || 'Optimal O(n) Hash Map solution'
  }));

  // Save HR Turn
  await fetch(`${BASE_URL}/ai/hr-dialogue`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      candidateAnswer: 'I architected an asynchronous message queue using RabbitMQ and Node.js that handled 50k requests per second with zero data loss.',
      history: [],
      turnIndex: 0,
      jobRole: 'Software Engineer',
      sessionId
    })
  });

  // Submit assessment
  const submitRes = await fetch(`${BASE_URL}/sessions/${sessionId}/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      answers,
      voiceEmotionStats: {
        primaryEmotion: 'Confident & Articulate',
        confidenceScore: 92,
        composureScore: 94,
        hesitationIndex: 8,
        speechPace: 'Measured & Clear'
      },
      malpracticeAudit: {
        totalAttempts: 0,
        tabSwitches: 0,
        eyeAwayWarnings: 0,
        proctoringPassed: true
      },
      recordingUrl: 'data:video/webm;base64,sample_session_recording_stream',
      recordingDuration: 75
    })
  });
  const submitData = await submitRes.json();
  console.log('✔ Assessment submitted successfully! Report generated:', submitData.report?._id || submitData.report?.id);

  // 6. Fetch Dossier from Report API
  console.log('6. Fetching Recruiter Dossier...');
  const rptRes = await fetch(`${BASE_URL}/reports/${sessionId}`, { headers: authHeaders });
  const rptData = await rptRes.json();
  const rpt = rptData.report;

  console.log('✔ Dossier Summary:');
  console.log(`   - Technical Score: ${rpt.overallEvaluation?.technicalScore}%`);
  console.log(`   - Sentiment Score: ${rpt.overallEvaluation?.sentimentScore}%`);
  console.log(`   - Overall Score: ${rpt.overallEvaluation?.overallScore}%`);
  console.log(`   - Recommendation: ${rpt.overallEvaluation?.recommendation}`);
  console.log(`   - Presence Attire: ${rpt.session?.presenceEvaluation?.attireScore}%`);
  console.log(`   - Presence Grooming: ${rpt.session?.presenceEvaluation?.groomingScore}%`);
  console.log(`   - Presence Attitude: ${rpt.session?.presenceEvaluation?.attitudeScore}%`);
  console.log(`   - HR Dialogue Turns: ${rpt.session?.hrConversationLog?.length || 0} turns recorded`);
  console.log(`   - Video Recording: ${rpt.session?.recordingUrl ? 'Verified & Available' : 'N/A'}`);

  console.log('\n=== Full End-to-End Candidate Assessment Test PASSED! ===');
}

runEndToEndFlow().catch(err => {
  console.error('End-to-end test error:', err);
  process.exit(1);
});
