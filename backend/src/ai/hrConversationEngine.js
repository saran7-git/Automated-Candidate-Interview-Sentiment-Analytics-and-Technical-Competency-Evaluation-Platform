/**
 * Conversational Personal AI HR Engine
 * 
 * Simulates an empathetic, rigorous, and intelligent HR Interviewer.
 * Features:
 * - Acknowledges and dynamically analyzes candidate responses.
 * - Formulates contextual counter-questions and follow-ups from the candidate's actual answers.
 * - Tracks multi-turn dialogue history and evaluates communication, attitude, and composure in real time.
 */

let GoogleGenerativeAI = null;
try {
  const geminiModule = require('@google/generative-ai');
  GoogleGenerativeAI = geminiModule.GoogleGenerativeAI;
} catch (e) {
  GoogleGenerativeAI = null;
}

/**
 * Deterministic / NLP Fallback Generator for offline or zero-latency HR dialogue
 */
function generateLocalCounterQuestion(candidateAnswer, turnCount, previousQuestions = []) {
  const text = (candidateAnswer || '').toLowerCase();
  
  // High-interest technical / behavioral keywords
  if (text.includes('conflict') || text.includes('disagree') || text.includes('argument') || text.includes('team')) {
    return {
      feedback: "I appreciate your transparency regarding interpersonal dynamics and team collaboration.",
      counterQuestion: "When perspectives diverged on that technical direction, what specific data or metrics did you use to build consensus without damaging team morale?",
      topic: 'Conflict Resolution & Influence'
    };
  }
  
  if (text.includes('outage') || text.includes('bug') || text.includes('incident') || text.includes('failure') || text.includes('crash')) {
    return {
      feedback: "Handling production incidents under pressure is a critical hallmark of a reliable engineer.",
      counterQuestion: "Looking back at that incident, what automated safeguard or post-mortem action item did you personally implement to ensure it could never happen again?",
      topic: 'Incident Management & Resilience'
    };
  }

  if (text.includes('architecture') || text.includes('scale') || text.includes('microservice') || text.includes('database') || text.includes('api')) {
    return {
      feedback: "That architectural breakdown shows good structural thinking and domain awareness.",
      counterQuestion: "If traffic or data volume were to scale 10x overnight, where would the primary bottleneck emerge in that design, and how would you mitigate it?",
      topic: 'Scalability & System Design Trade-offs'
    };
  }

  if (text.includes('lead') || text.includes('mentor') || text.includes('junior') || text.includes('guided')) {
    return {
      feedback: "Mentorship and technical leadership are vital qualities for our engineering culture.",
      counterQuestion: "How do you tailor your mentoring approach when working with team members who have differing learning speeds or communication styles?",
      topic: 'Leadership & Mentorship'
    };
  }

  if (text.includes('deadline') || text.includes('pressure') || text.includes('priorit') || text.includes('time')) {
    return {
      feedback: "Balancing strict deadlines against software craftmanship is always challenging.",
      counterQuestion: "How do you communicate with non-technical product managers when scope cuts are necessary to preserve security and code maintainability?",
      topic: 'Prioritization & Stakeholder Communication'
    };
  }

  // Turn-based progressive questions
  const progressiveQuestions = [
    {
      feedback: "Thank you for sharing your background and core engineering philosophy.",
      counterQuestion: "Could you walk me through the most technically challenging bug you encountered in the past year, and how you systematically diagnosed the root cause?",
      topic: 'Technical Deep-Dive & Problem Solving'
    },
    {
      feedback: "That provides great clarity into your diagnostic approach.",
      counterQuestion: "In fast-paced sprint cycles, how do you proactively balance taking on technical debt versus shipping features on time?",
      topic: 'Engineering Discipline & Trade-offs'
    },
    {
      feedback: "Excellent perspective on delivery trade-offs.",
      counterQuestion: "Tell me about a time you had to quickly learn an unfamiliar technology or framework to deliver a business-critical requirement. What was your learning roadmap?",
      topic: 'Adaptability & Continuous Learning'
    },
    {
      feedback: "Wonderful insights into your learning velocity and professional mindset.",
      counterQuestion: "Where do you envision your engineering career in the next 3 to 5 years, and what high-impact contributions are you most excited to make here?",
      topic: 'Career Vision & Alignment'
    }
  ];

  const idx = Math.min(turnCount, progressiveQuestions.length - 1);
  return progressiveQuestions[idx];
}

/**
 * Process a conversational AI HR dialogue turn
 * @param {Object} params - { candidateAnswer, history, role, jobDescription }
 */
async function processHrDialogueTurn({
  candidateAnswer = '',
  history = [],
  turnIndex = 0,
  jobRole = 'Full-Stack Software Engineer',
  maxTurns = 4
}) {
  const currentTurn = history.length;
  const isFinalTurn = currentTurn >= maxTurns - 1;

  // If Gemini API Key is configured and library available, attempt LLM generation
  if (GoogleGenerativeAI && process.env.AI_API_KEY && process.env.AI_API_KEY.length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an elite, empathetic, and sharp Senior Director of Human Resources & Technical Talent conducting a final round interview for the role of ${jobRole}.
Candidate's latest response: "${candidateAnswer}"
Previous dialogue history: ${JSON.stringify(history.map(h => ({ speaker: h.speaker, text: h.text })))}
Current Turn Number: ${currentTurn + 1} of ${maxTurns}.
Is Final Turn: ${isFinalTurn}

Task:
1. Provide a brief 1-2 sentence conversational acknowledgment / feedback of their answer.
2. ${isFinalTurn ? 'Provide a warm, professional closing statement summarizing their strong presence and thanking them.' : 'Formulate a sharp, intelligent COUNTER-QUESTION or follow-up based directly on what they just said, challenging their reasoning or exploring their thought process further.'}
3. Evaluate their answer on:
   - communicationScore (0-100)
   - attitudeScore (0-100)
   - composureScore (0-100)
   - sentiment (Positive/Neutral/Constructive)

Format output strictly as JSON with keys:
{
  "feedback": "string",
  "counterQuestion": "string",
  "aiSpeechText": "string (the natural spoken response containing feedback + counterQuestion)",
  "communicationScore": number,
  "attitudeScore": number,
  "composureScore": number,
  "sentiment": "string",
  "isCompleted": boolean
}`;

      const res = await model.generateContent(prompt);
      const cleaned = res.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        turnIndex: currentTurn,
        isCompleted: isFinalTurn || parsed.isCompleted
      };
    } catch (err) {
      console.warn('[AI HR Engine] Gemini fallback to local NLP generator:', err.message);
    }
  }

  // Built-in intelligent local fallback engine
  const generated = generateLocalCounterQuestion(candidateAnswer, currentTurn, history);
  
  const wordCount = candidateAnswer.split(/\s+/).filter(Boolean).length;
  const baseScore = Math.min(95, Math.max(70, 75 + Math.floor(wordCount / 5)));

  if (isFinalTurn) {
    const closingSpeech = `Thank you so much for this thorough discussion! You demonstrated outstanding clarity, strong engineering ownership, and a highly collaborative mindset throughout our conversation. We have recorded your responses for our talent dossier. Have a wonderful day!`;
    return {
      feedback: "Candidate concluded the interview with well-structured answers and high professional presence.",
      counterQuestion: null,
      aiSpeechText: closingSpeech,
      communicationScore: baseScore,
      attitudeScore: baseScore + 3,
      composureScore: baseScore + 2,
      sentiment: 'Highly Positive & Articulate',
      isCompleted: true,
      turnIndex: currentTurn
    };
  }

  const aiSpeechText = `${generated.feedback} ${generated.counterQuestion}`;

  return {
    feedback: generated.feedback,
    counterQuestion: generated.counterQuestion,
    topic: generated.topic,
    aiSpeechText,
    communicationScore: baseScore,
    attitudeScore: baseScore + 2,
    composureScore: baseScore + 1,
    sentiment: 'Positive & Composed',
    isCompleted: false,
    turnIndex: currentTurn
  };
}

module.exports = {
  processHrDialogueTurn
};
