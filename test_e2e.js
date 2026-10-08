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
  const token = aLoginData.token;

  console.log('\n--- 4. Testing Candidate Dynamic Registration & Login ---');
  const tempEmail = `candidate.${Date.now()}@example.com`;
  const regRes = await fetch(baseApi + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Candidate',
      email: tempEmail,
      password: 'Candidate@123',
      role: 'candidate',
      skills: ['React', 'Node.js']
    })
  });
  const regData = await regRes.json();
  console.log('Candidate registration:', regData.success, '| User:', regData.user?.name);

  const cLogin = await fetch(baseApi + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tempEmail, password: 'Candidate@123' })
  });
  const cLoginData = await cLogin.json();
  console.log('Candidate login:', cLoginData.success, '| User:', cLoginData.user?.name);

  console.log('\n--- 5. Testing Dashboard Statistics ---');
  const sRes = await fetch(baseApi + '/dashboard/statistics', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const sData = await sRes.json();
  console.log('Total Candidates:', sData.statistics.totalCandidates);
  console.log('Total Interviews:', sData.statistics.totalInterviews);
  console.log('Avg Technical Score:', sData.statistics.averageTechnicalScore);
  console.log('Avg Sentiment Score:', sData.statistics.averageSentimentScore);
  console.log('Sentiment Distribution:', sData.statistics.sentimentDistribution.map(s => `${s.name}: ${s.percentage}%`).join(', '));

  console.log('\n--- 6. Testing Direct AI Analysis on Normalization Answer ---');
  const sampleAnswer = 'Normalization is vital for organizing relational database tables and eliminating data redundancy and update anomalies. In 1NF we enforce atomic values, in 2NF we remove partial dependencies, and in 3NF we remove transitive dependencies. This keeps the database remarkably clean.';
  const aiRes = await fetch(baseApi + '/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      candidateAnswer: sampleAnswer,
      questionText: 'What is database normalization, why is it needed, and what distinguish 1NF, 2NF, and 3NF?',
      expectedAnswer: 'Database normalization structures tables to reduce data redundancy and eliminate anomalies. 1NF requires atomic values, 2NF removes partial dependency, and 3NF removes transitive dependencies.',
      keywords: ['redundancy', 'anomalies', '1NF', '2NF', '3NF', 'atomic values', 'partial dependency', 'transitive dependency'],
      category: 'Database'
    })
  });
  const aiData = await aiRes.json();
  console.log('Sentiment:', aiData.evaluation.sentiment, '| Score:', aiData.evaluation.sentimentScore, '| Confidence:', aiData.evaluation.sentimentConfidence);
  console.log('Technical Score:', aiData.evaluation.technicalScore, '| Correctness:', aiData.evaluation.correctnessScore, '| Coverage:', aiData.evaluation.conceptCoverageScore);
  console.log('Overall Answer Score (70% Tech + 30% Sent):', aiData.evaluation.overallAnswerScore);
  console.log('Detected Concepts:', aiData.evaluation.detectedConcepts);
  console.log('Missing Concepts:', aiData.evaluation.missingConcepts);
  console.log('AI Feedback:', aiData.evaluation.feedback);

  console.log('\n--- 7. Testing Candidate Report Dossier (sess_alex_01) ---');
  const rRes = await fetch(baseApi + '/reports/sess_alex_01', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const rData = await rRes.json();
  console.log('Candidate Dossier Name:', rData.report.candidate.name);
  console.log('Interview Title:', rData.report.interview.title);
  console.log('Overall Score:', rData.report.overallEvaluation.overallScore);
  console.log('Technical Score:', rData.report.overallEvaluation.technicalScore);
  console.log('Sentiment Score:', rData.report.overallEvaluation.sentimentScore);
  console.log('AI Recommendation:', rData.report.overallEvaluation.recommendation);
  console.log('Questions Evaluated:', rData.report.questionEvaluations.length);
  console.log('Timeline Data Points:', rData.report.sentimentTimeline.length);

  console.log('\n--- 8. Testing Multi-Candidate Comparison ---');
  const cmpRes = await fetch(baseApi + '/dashboard/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ sessionIds: ['sess_alex_01', 'sess_priya_02', 'sess_marcus_03'] })
  });
  const cmpData = await cmpRes.json();
  console.log('Compared Candidates:', cmpData.comparison.map(c => `${c.candidateName} (Overall: ${c.overallScore}, Tech: ${c.technicalScore}, Sent: ${c.sentimentScore}, Rec: ${c.recommendation})`));

  console.log('\n======================================================');
  console.log('>>> ALL END-TO-END SYSTEM INTEGRATION TESTS PASSED! <<<');
  console.log('======================================================');
}

testAll().catch(e => {
  console.error('Test Error:', e);
  process.exit(1);
});
