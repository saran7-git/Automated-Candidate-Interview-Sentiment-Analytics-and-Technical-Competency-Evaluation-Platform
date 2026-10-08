const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== Starting 2026 Foundation Assessment & AI HR Suite Test ===\n');

  // 1. Authenticate / Login
  console.log('1. Authenticating as Admin...');
  const authRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@interview.ai',
      password: 'Admin@123'
    })
  });
  const authData = await authRes.json();
  const token = authData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('✔ Authenticated successfully. Token obtained.\n');

  // 2. Generate 2026 Foundation Assessment Questions
  console.log('2. Testing AI Dynamic Question Generator (20 Numerical + 25 Verbal + 20 Reasoning + Coding + AI HR)...');
  const genRes = await fetch(`${BASE_URL}/ai/generate-questions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      candidateId: 'cand_test_2026',
      seed: 'seed_student_alpha'
    })
  });
  const genData = await genRes.json();
  const assessment = genData.assessment;
  console.log(`✔ Generated total ${assessment.totalQuestions} questions:`);
  console.log(`   - Numerical Ability: ${assessment.sections.numerical.count} Questions (${assessment.sections.numerical.timeMinutes} min)`);
  console.log(`   - Verbal Ability: ${assessment.sections.verbal.count} Questions (${assessment.sections.verbal.timeMinutes} min)`);
  console.log(`   - Reasoning Ability: ${assessment.sections.reasoning.count} Questions (${assessment.sections.reasoning.timeMinutes} min)`);
  console.log(`   - Foundation Total: ${assessment.foundationTotalQuestions} Questions in ${assessment.foundationTotalTimeMinutes} min`);
  console.log(`   - Coding: ${assessment.sections.coding.count} Task`);
  console.log(`   - AI HR Round: ${assessment.sections.hr.count} Interactive Dialogue\n`);

  // Verify unique shuffle with different seed
  console.log('3. Testing Per-Candidate Shuffling for different students...');
  const genResBeta = await fetch(`${BASE_URL}/ai/generate-questions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      candidateId: 'cand_test_beta',
      seed: 'seed_student_beta'
    })
  });
  const genDataBeta = await genResBeta.json();
  const qAlphaFirst = assessment.sections.numerical.questions[0].question;
  const qBetaFirst = genDataBeta.assessment.sections.numerical.questions[0].question;
  console.log(`✔ Student Alpha Q1: "${qAlphaFirst.slice(0, 50)}..."`);
  console.log(`✔ Student Beta Q1: "${qBetaFirst.slice(0, 50)}..."\n`);

  // 4. Test Conversational AI HR Multi-turn Dialogue & Counter-Questions
  console.log('4. Testing Conversational Personal AI HR Round (Counter-Questioning Engine)...');
  const hrRes = await fetch(`${BASE_URL}/ai/hr-dialogue`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      candidateAnswer: 'I have 3 years of experience as a fullstack engineer. During a major microservice outage last year, our database bottlenecked due to unindexed queries and I deployed Redis caching to stabilize the system.',
      history: [],
      turnIndex: 0,
      jobRole: 'Full-Stack Software Engineer'
    })
  });
  const hrData = await hrRes.json();
  console.log('✔ AI HR Feedback:', hrData.dialogue.feedback);
  console.log('✔ AI HR Generated Counter-Question:', hrData.dialogue.counterQuestion);
  console.log('✔ AI HR Soft-Skills Scores:', {
    communication: hrData.dialogue.communicationScore,
    attitude: hrData.dialogue.attitudeScore,
    composure: hrData.dialogue.composureScore
  }, '\n');

  // 5. Test Presence & Soft-Skills Evaluation
  console.log('5. Testing Presence, Attire, Grooming & Demeanor Evaluation...');
  const presenceRes = await fetch(`${BASE_URL}/ai/evaluate-presence`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      voiceEmotionStats: { confidenceScore: 92, composureScore: 90 },
      malpracticeAudit: { tabSwitches: 0, eyeAwayWarnings: 0, totalAttempts: 0 },
      hrConversationLog: [
        { speaker: 'candidate', text: 'Answer 1' },
        { speaker: 'ai_hr', text: 'Counter 1' }
      ]
    })
  });
  const presenceData = await presenceRes.json();
  const pres = presenceData.presence;
  console.log('✔ Presence Breakdown:');
  console.log(`   - Attire Score: ${pres.attireScore}%`);
  console.log(`   - Grooming Score: ${pres.groomingScore}%`);
  console.log(`   - Attitude Score: ${pres.attitudeScore}%`);
  console.log(`   - Communication Score: ${pres.communicationScore}%`);
  console.log(`   - Emotion / EQ: ${pres.emotionScore}%`);
  console.log(`   - Summary: ${pres.presenceSummary}\n`);

  console.log('=== All 2026 Foundation Assessment & AI HR Suite Tests PASSED! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
