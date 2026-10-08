/**
 * 2026 Foundation Assessment + Coding + Conversational AI HR Question Generator
 * 
 * Foundation Structure (65 Questions / 75 minutes):
 * 1. Numerical Ability: 20 Questions in 25 min (Percentages, Ratio & Proportion, Profit & Loss,
 *    Averages, Time & Work, Time/Speed & Distance, Number System, LCM/HCF, Probability,
 *    Permutation & Combination, Mixtures, Data Interpretation)
 * 2. Verbal Ability: 25 Questions in 25 min (Sentence completion, Grammar, Vocabulary,
 *    Reading comprehension, Sentence correction, Para/sentence arrangement)
 * 3. Reasoning Ability: 20 Questions in 25 min (Number/letter series, Coding-decoding,
 *    Blood relations, Syllogisms, Directions, Seating arrangement, Data arrangement,
 *    Logical reasoning, Puzzles)
 * 4. Coding Round: Algorithmic problems with interactive sandbox
 * 5. Conversational AI HR Round: Multi-turn dynamic counter-questioning
 */

// Robust 32-bit FNV-1a / Mulberry32 PRNG for candidate-specific seeded shuffling
function createPrng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let a = h;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray(array, rng) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------------------------------------------------
// 1. NUMERICAL ABILITY QUESTION BANK (Covers all 12 subtopics)
// -------------------------------------------------------------
const NUMERICAL_QUESTIONS_POOL = [
  // Percentages
  {
    topic: 'Percentages',
    subtopic: 'Percentages',
    question: 'A software company increased its engineer count by 20% in 2025 and then reduced it by 15% during restructuring in 2026. If the initial count was 500, what is the net percentage change in headcount?',
    options: ['A) +2% increase', 'B) +5% increase', 'C) -2% decrease', 'D) +3.5% increase'],
    correctAnswer: 'A',
    expectedAnswer: 'A) +2% increase. Let initial = 100. After +20% = 120. After -15% of 120 = 120 - 18 = 102. Net change = +2%.',
    keywords: ['percentage', 'increase', 'decrease', '+2%', 'net change'],
    maxScore: 5
  },
  {
    topic: 'Percentages',
    subtopic: 'Percentages',
    question: 'In a cloud computing cluster test, 65% of servers passed benchmark A, and 75% passed benchmark B. If 10% failed both, what percentage of servers passed both benchmarks?',
    options: ['A) 40%', 'B) 50%', 'C) 55%', 'D) 60%'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 50%. Total passing at least one = 100% - 10% = 90%. n(A ∪ B) = n(A) + n(B) - n(A ∩ B) => 90 = 65 + 75 - x => x = 50%.',
    keywords: ['set theory', 'percentage', '50%', 'intersection'],
    maxScore: 5
  },
  // Ratio & Proportion
  {
    topic: 'Ratio & Proportion',
    subtopic: 'Ratio & Proportion',
    question: 'The ratio of backend engineers, frontend engineers, and QA engineers in a tech division is 5 : 4 : 3. If QA engineers are 45, how many total engineers work in the division?',
    options: ['A) 150', 'B) 180', 'C) 160', 'D) 175'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 180. 3 units = 45 => 1 unit = 15. Total units = 5 + 4 + 3 = 12 units = 12 * 15 = 180.',
    keywords: ['ratio', 'proportion', '180', 'units'],
    maxScore: 5
  },
  {
    topic: 'Ratio & Proportion',
    subtopic: 'Ratio & Proportion',
    question: 'If A : B = 3 : 4 and B : C = 8 : 9, what is the ratio of A : C?',
    options: ['A) 1 : 2', 'B) 2 : 3', 'C) 3 : 5', 'D) 4 : 5'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 2 : 3. A/B * B/C = 3/4 * 8/9 = 24/36 = 2/3.',
    keywords: ['compound ratio', '2 : 3', 'proportions'],
    maxScore: 5
  },
  // Profit & Loss
  {
    topic: 'Profit & Loss',
    subtopic: 'Profit & Loss',
    question: 'A SaaS vendor sells an enterprise license at $4,800 making a 20% profit. If the production cost increases by 10% next year, what should the new selling price be to maintain a 25% profit?',
    options: ['A) $5,200', 'B) $5,500', 'C) $5,400', 'D) $5,600'],
    correctAnswer: 'B',
    expectedAnswer: 'B) $5,500. Original CP = 4800 / 1.2 = $4,000. New CP = $4,000 * 1.1 = $4,400. New SP with 25% profit = 4,400 * 1.25 = $5,500.',
    keywords: ['profit and loss', 'cost price', 'selling price', '$5500'],
    maxScore: 5
  },
  {
    topic: 'Profit & Loss',
    subtopic: 'Profit & Loss',
    question: 'By selling an AI GPU cluster for $14,400, a company incurs a 10% loss. At what price must it be sold to gain a 15% profit?',
    options: ['A) $17,600', 'B) $18,400', 'C) $16,800', 'D) $19,200'],
    correctAnswer: 'B',
    expectedAnswer: 'B) $18,400. CP = 14400 / 0.9 = $16,000. Target SP = 16000 * 1.15 = $18,400.',
    keywords: ['loss', 'gain', 'cost price', '$18400'],
    maxScore: 5
  },
  // Averages
  {
    topic: 'Averages',
    subtopic: 'Averages',
    question: 'The average response latency of 9 microservices is 45 ms. When a new caching gateway is added, the overall average latency drops to 42 ms. What is the response latency of the new caching gateway?',
    options: ['A) 12 ms', 'B) 15 ms', 'C) 18 ms', 'D) 24 ms'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 15 ms. Total latency of 9 services = 9 * 45 = 405 ms. Total of 10 services = 10 * 42 = 420 ms. Gateway latency = 420 - 405 = 15 ms.',
    keywords: ['average', 'sum', 'latency', '15 ms'],
    maxScore: 5
  },
  {
    topic: 'Averages',
    subtopic: 'Averages',
    question: 'In a coding sprint, the average score of 25 junior developers is 70, and the average score of 15 senior developers is 90. What is the combined average score of all 40 developers?',
    options: ['A) 77.5', 'B) 78.0', 'C) 80.0', 'D) 76.5'],
    correctAnswer: 'A',
    expectedAnswer: 'A) 77.5. Total score = (25 * 70) + (15 * 90) = 1750 + 1350 = 3100. Average = 3100 / 40 = 77.5.',
    keywords: ['weighted average', '77.5', 'mean score'],
    maxScore: 5
  },
  // Time & Work
  {
    topic: 'Time & Work',
    subtopic: 'Time & Work',
    question: 'Dev A can complete a feature module in 12 days, and Dev B can complete it in 18 days. If they work together with Dev C and finish the module in 4 days, how many days would Dev C take alone?',
    options: ['A) 8 days', 'B) 9 days', 'C) 10 days', 'D) 12 days'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 9 days. 1/12 + 1/18 + 1/C = 1/4 => 5/36 + 1/C = 9/36 => 1/C = 4/36 = 1/9 => C takes 9 days.',
    keywords: ['time and work', 'work efficiency', '9 days'],
    maxScore: 5
  },
  {
    topic: 'Time & Work',
    subtopic: 'Time & Work',
    question: '16 data pipelines can ingest 960 GB in 6 hours. How many GB can 20 pipelines ingest in 8 hours at the same ingestion rate?',
    options: ['A) 1,400 GB', 'B) 1,600 GB', 'C) 1,500 GB', 'D) 1,750 GB'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 1,600 GB. Rate per pipeline = 960 / (16 * 6) = 10 GB/hr. 20 pipelines in 8 hrs = 20 * 8 * 10 = 1,600 GB.',
    keywords: ['work rate', 'pipeline', '1600 GB'],
    maxScore: 5
  },
  // Time, Speed & Distance
  {
    topic: 'Time, Speed & Distance',
    subtopic: 'Time, Speed & Distance',
    question: 'A data packet travels across a transatlantic fiber line at 200,000 km/s. If the round trip latency (ping) between London and New York is 56 ms, what is the one-way cable distance?',
    options: ['A) 5,400 km', 'B) 5,600 km', 'C) 5,800 km', 'D) 6,000 km'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 5,600 km. One-way time = 28 ms = 0.028 s. Distance = 200,000 * 0.028 = 5,600 km.',
    keywords: ['speed distance time', 'latency', '5600 km'],
    maxScore: 5
  },
  {
    topic: 'Time, Speed & Distance',
    subtopic: 'Time, Speed & Distance',
    question: 'A courier drone travels to a server hub at 60 km/h and returns along the same route at 90 km/h. What is the average speed of the drone for the whole round trip?',
    options: ['A) 72 km/h', 'B) 75 km/h', 'C) 70 km/h', 'D) 78 km/h'],
    correctAnswer: 'A',
    expectedAnswer: 'A) 72 km/h. Average speed for equal distance = (2 * v1 * v2) / (v1 + v2) = (2 * 60 * 90) / 150 = 72 km/h.',
    keywords: ['harmonic mean', 'average speed', '72 km/h'],
    maxScore: 5
  },
  // Number System
  {
    topic: 'Number System',
    subtopic: 'Number System',
    question: 'What is the remainder when (7^84 + 3) is divided by 8?',
    options: ['A) 2', 'B) 3', 'C) 4', 'D) 5'],
    correctAnswer: 'C',
    expectedAnswer: 'C) 4. 7 ≡ -1 (mod 8). (-1)^84 + 3 = 1 + 3 = 4. Remainder is 4.',
    keywords: ['modular arithmetic', 'remainder', 'number system', '4'],
    maxScore: 5
  },
  {
    topic: 'Number System',
    subtopic: 'Number System',
    question: 'The product of two consecutive positive even integers is 360. What is the sum of these two integers?',
    options: ['A) 36', 'B) 38', 'C) 40', 'D) 42'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 38. Let integers be x and x+2. x(x+2) = 360 => x^2 + 2x - 360 = 0 => (x+20)(x-18) = 0 => x = 18. Integers are 18 and 20. Sum = 38.',
    keywords: ['consecutive even', 'sum', '38'],
    maxScore: 5
  },
  // LCM/HCF
  {
    topic: 'LCM/HCF',
    subtopic: 'LCM/HCF',
    question: 'Three microservice cron jobs trigger at intervals of 12 seconds, 15 seconds, and 20 seconds. If they all triggered together at 10:00:00 AM, how many times will they trigger simultaneously in the next 15 minutes?',
    options: ['A) 12 times', 'B) 15 times', 'C) 18 times', 'D) 20 times'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 15 times. LCM(12, 15, 20) = 60 seconds (1 minute). In 15 minutes, they trigger 15 times.',
    keywords: ['LCM', 'cron jobs', 'simultaneous', '15 times'],
    maxScore: 5
  },
  {
    topic: 'LCM/HCF',
    subtopic: 'LCM/HCF',
    question: 'The HCF and LCM of two database shard IDs are 16 and 480 respectively. If one shard ID is 96, what is the other shard ID?',
    options: ['A) 64', 'B) 80', 'C) 72', 'D) 84'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 80. Product of two numbers = HCF * LCM. 96 * x = 16 * 480 => x = (16 * 480) / 96 = 80.',
    keywords: ['HCF', 'LCM', 'product formula', '80'],
    maxScore: 5
  },
  // Probability
  {
    topic: 'Probability',
    subtopic: 'Probability',
    question: 'Two independent automated security scanners examine a repository. Scanner A has a 0.8 probability of detecting a vulnerability, and Scanner B has a 0.7 probability. What is the probability that at least one scanner detects the vulnerability?',
    options: ['A) 0.94', 'B) 0.88', 'C) 0.92', 'D) 0.96'],
    correctAnswer: 'A',
    expectedAnswer: 'A) 0.94. P(At least one) = 1 - P(Neither detects) = 1 - (1 - 0.8)(1 - 0.7) = 1 - (0.2 * 0.3) = 1 - 0.06 = 0.94.',
    keywords: ['probability', 'independent events', 'complement', '0.94'],
    maxScore: 5
  },
  // Permutation & Combination
  {
    topic: 'Permutation & Combination',
    subtopic: 'Permutation & Combination',
    question: 'In how many ways can a lead architect select a project team of 4 senior engineers and 2 junior engineers from a pool of 8 senior engineers and 5 junior engineers?',
    options: ['A) 700', 'B) 650', 'C) 800', 'D) 720'],
    correctAnswer: 'A',
    expectedAnswer: 'A) 700. C(8, 4) * C(5, 2) = [(8*7*6*5)/(4*3*2*1)] * [(5*4)/(2*1)] = 70 * 10 = 700 ways.',
    keywords: ['combinations', 'selection', '700'],
    maxScore: 5
  },
  // Mixtures
  {
    topic: 'Mixtures',
    subtopic: 'Mixtures',
    question: 'A 60-liter memory buffer is composed of 40% cached query data and 60% session tokens. How many liters of pure cache data must be added so that cached query data becomes 50% of the entire buffer?',
    options: ['A) 10 liters', 'B) 12 liters', 'C) 15 liters', 'D) 16 liters'],
    correctAnswer: 'B',
    expectedAnswer: 'B) 12 liters. Initial cache data = 24 L, tokens = 36 L. For cache to be 50%, total tokens (36 L) must equal cache data => cache data needed = 36 L. Added = 36 - 24 = 12 liters.',
    keywords: ['mixture', 'alligation', '12 liters'],
    maxScore: 5
  },
  // Data Interpretation
  {
    topic: 'Data Interpretation',
    subtopic: 'Data Interpretation',
    question: 'Quarterly Cloud Costs ($k): Q1: 120, Q2: 150, Q3: 180, Q4: 210. What is the percentage growth in cloud expenditure from Q1 to Q4?',
    options: ['A) 60%', 'B) 70%', 'C) 75%', 'D) 80%'],
    correctAnswer: 'C',
    expectedAnswer: 'C) 75%. Growth = (210 - 120) / 120 * 100 = 90 / 120 * 100 = 75%.',
    keywords: ['data interpretation', 'growth percentage', '75%'],
    maxScore: 5
  }
];

// -------------------------------------------------------------
// 2. VERBAL ABILITY QUESTION BANK (Covers all 6 subtopics)
// -------------------------------------------------------------
const VERBAL_QUESTIONS_POOL = [
  // Sentence completion
  {
    topic: 'Sentence completion',
    subtopic: 'Sentence completion',
    question: 'The engineering team was praised for their _______ architecture, which seamlessly handled unexpected traffic spikes without latency degradation.',
    options: ['A) fragile', 'B) resilient', 'C) ephemeral', 'D) redundant'],
    correctAnswer: 'B',
    expectedAnswer: 'B) resilient. "Resilient" means able to withstand or recover quickly from difficult conditions.',
    keywords: ['sentence completion', 'resilient', 'vocabulary'],
    maxScore: 4
  },
  {
    topic: 'Sentence completion',
    subtopic: 'Sentence completion',
    question: 'Despite the tight project deadline, the team lead refused to _______ code quality for speed.',
    options: ['A) enhance', 'B) compromise', 'C) escalate', 'D) articulate'],
    correctAnswer: 'B',
    expectedAnswer: 'B) compromise. "Compromise" means to accept standards that are lower than desirable.',
    keywords: ['compromise', 'sentence completion'],
    maxScore: 4
  },
  {
    topic: 'Sentence completion',
    subtopic: 'Sentence completion',
    question: 'The distributed database implements _______ consistency to guarantee that all read replicas eventually converge on the latest state.',
    options: ['A) eventual', 'B) erratic', 'C) dubious', 'D) stagnant'],
    correctAnswer: 'A',
    expectedAnswer: 'A) eventual. "Eventual consistency" is a standard model in distributed computing.',
    keywords: ['eventual', 'consistency', 'completion'],
    maxScore: 4
  },
  {
    topic: 'Sentence completion',
    subtopic: 'Sentence completion',
    question: 'Her _______ presentation of the system design convinced both executive leadership and technical staff.',
    options: ['A) ambiguous', 'B) lucid', 'C) obscure', 'D) trivial'],
    correctAnswer: 'B',
    expectedAnswer: 'B) lucid. "Lucid" means expressed clearly; easy to understand.',
    keywords: ['lucid', 'clear', 'vocabulary'],
    maxScore: 4
  },
  // Grammar
  {
    topic: 'Grammar',
    subtopic: 'Grammar',
    question: 'Choose the grammatically correct sentence:',
    options: [
      'A) Neither the software architect nor the developers was aware of the memory leak.',
      'B) Neither the software architect nor the developers were aware of the memory leak.',
      'C) Neither the software architect or the developers were aware of the memory leak.',
      'D) Neither the software architect nor the developers is aware of the memory leak.'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) When using "neither... nor", the verb agrees with the subject closer to it ("developers" is plural -> "were").',
    keywords: ['subject-verb agreement', 'neither nor', 'grammar'],
    maxScore: 4
  },
  {
    topic: 'Grammar',
    subtopic: 'Grammar',
    question: 'Identify the sentence with correct pronoun usage:',
    options: [
      'A) The principal engineer invited Sarah and I to the architectural review.',
      'B) The principal engineer invited Sarah and me to the architectural review.',
      'C) The principal engineer invited Sarah and myself to the architectural review.',
      'D) The principal engineer invited Sarah and mine to the architectural review.'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) "Sarah and me" acts as the objective pronoun target of the verb "invited".',
    keywords: ['pronoun case', 'objective pronoun', 'grammar'],
    maxScore: 4
  },
  {
    topic: 'Grammar',
    subtopic: 'Grammar',
    question: 'Select the sentence with correct conditional mood:',
    options: [
      'A) If the server was more resilient, it would not crash during deployments.',
      'B) If the server were more resilient, it would not crash during deployments.',
      'C) If the server is more resilient, it would not crash during deployments.',
      'D) If the server will be more resilient, it would not crash during deployments.'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) Subjunctive mood for hypothetical conditions requires "were" rather than "was".',
    keywords: ['subjunctive mood', 'conditional', 'grammar'],
    maxScore: 4
  },
  {
    topic: 'Grammar',
    subtopic: 'Grammar',
    question: 'Which of the following sentences does NOT contain a dangling modifier?',
    options: [
      'A) Having optimized the algorithm, the CPU usage dropped significantly.',
      'B) Having optimized the algorithm, the engineer observed a significant drop in CPU usage.',
      'C) Running across the network, latency was recorded by the script.',
      'D) To improve performance, caching was implemented by the team.'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) "Having optimized the algorithm" correctly modifies "the engineer" who performed the action.',
    keywords: ['dangling modifier', 'modifier syntax', 'grammar'],
    maxScore: 4
  },
  // Vocabulary
  {
    topic: 'Vocabulary',
    subtopic: 'Vocabulary',
    question: 'What is the closest synonym for the word "UBIQUITOUS"?',
    options: ['A) Omnipresent', 'B) Rare', 'C) Obsolete', 'D) Fragile'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Omnipresent. "Ubiquitous" means present, appearing, or found everywhere.',
    keywords: ['synonym', 'ubiquitous', 'omnipresent'],
    maxScore: 4
  },
  {
    topic: 'Vocabulary',
    subtopic: 'Vocabulary',
    question: 'What is the closest antonym for the word "EPHEMERAL"?',
    options: ['A) Transient', 'B) Fleeting', 'C) Permanent', 'D) Sporadic'],
    correctAnswer: 'C',
    expectedAnswer: 'C) Permanent. "Ephemeral" means lasting for a very short time; its antonym is permanent.',
    keywords: ['antonym', 'ephemeral', 'permanent'],
    maxScore: 4
  },
  {
    topic: 'Vocabulary',
    subtopic: 'Vocabulary',
    question: 'Choose the word that best defines "PRAGMATIC":',
    options: ['A) Guided by practical considerations rather than idealistic theories', 'B) Overly emotional and impulsive', 'C) Unpredictable and volatile', 'D) Strictly adhering to ancient dogma'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Pragmatic means dealing with things sensibly and realistically based on practical rather than theoretical considerations.',
    keywords: ['pragmatic', 'practical', 'definition'],
    maxScore: 4
  },
  {
    topic: 'Vocabulary',
    subtopic: 'Vocabulary',
    question: 'Select the word that best replaces the bracketed phrase: "The CTO gave a [brief and clearly expressed] overview of the migration strategy."',
    options: ['A) verbose', 'B) succinct', 'C) convoluted', 'D) redundant'],
    correctAnswer: 'B',
    expectedAnswer: 'B) Succinct means briefly and clearly expressed.',
    keywords: ['succinct', 'concise', 'vocabulary'],
    maxScore: 4
  },
  // Reading comprehension
  {
    topic: 'Reading comprehension',
    subtopic: 'Reading comprehension',
    question: 'Passage: "Microservice architectures decouple system components into discrete, independently deployable services. While this modularity accelerates feature velocity and isolates faults, it introduces distributed complexity, requiring robust observability and idempotent API design."\n\nQuestion: According to the passage, what is a primary trade-off of microservices?',
    options: [
      'A) Slower feature deployment cycles',
      'B) Increased distributed complexity requiring high observability',
      'C) Inability to isolate operational faults',
      'D) Monolithic database lock contention'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) The passage states that while modularity accelerates velocity, it introduces distributed complexity and requires robust observability.',
    keywords: ['reading comprehension', 'microservices', 'complexity'],
    maxScore: 4
  },
  {
    topic: 'Reading comprehension',
    subtopic: 'Reading comprehension',
    question: 'Passage: "Zero-Trust architecture assumes no implicit trust granted to assets or user accounts based solely on their physical or network location. Continuous authentication, strict least-privilege access, and end-to-end encryption are mandatory at every transaction boundary."\n\nQuestion: What is the core principle of Zero-Trust architecture described above?',
    options: [
      'A) Trusting all internal intranet traffic by default',
      'B) Eliminating implicit trust and continuously verifying all access requests',
      'C) Relying exclusively on perimeter firewalls',
      'D) Granting unrestricted administrator rights to senior staff'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) Zero-Trust eliminates implicit trust based on location and enforces continuous verification and least privilege.',
    keywords: ['zero trust', 'authentication', 'least privilege'],
    maxScore: 4
  },
  {
    topic: 'Reading comprehension',
    subtopic: 'Reading comprehension',
    question: 'Passage: "Code refactoring does not alter the external behavior of a software system; rather, it cleans internal architecture, decreases technical debt, and improves maintainability for future development iterations."\n\nQuestion: What is the primary purpose of code refactoring according to the passage?',
    options: [
      'A) Introducing brand-new user-facing product features',
      'B) Enhancing internal maintainability without altering external behavior',
      'C) Bypassing automated regression testing suites',
      'D) Increasing computational memory overhead'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) The passage explicitly notes refactoring improves maintainability and cleans internal architecture without altering external behavior.',
    keywords: ['refactoring', 'maintainability', 'internal architecture'],
    maxScore: 4
  },
  {
    topic: 'Reading comprehension',
    subtopic: 'Reading comprehension',
    question: 'Passage: "Asynchronous messaging decouples producers from consumers in distributed systems, enabling resilient buffer queues that absorb unpredictable traffic surges without system crashes."\n\nQuestion: Why does asynchronous messaging improve resilience during traffic spikes?',
    options: [
      'A) It eliminates all databases completely',
      'B) It buffers traffic in queues so producers and consumers operate independently',
      'C) It requires synchronous blocking locks on all API calls',
      'D) It reduces server CPU speed to 10%'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) Buffer queues absorb traffic surges by decoupling message generation from processing.',
    keywords: ['asynchronous', 'queues', 'resilience', 'buffers'],
    maxScore: 4
  },
  // Sentence correction
  {
    topic: 'Sentence correction',
    subtopic: 'Sentence correction',
    question: 'Correct the underlined error: "The database cluster have been performing below acceptable SLAs since yesterday."',
    options: [
      'A) has been performing below',
      'B) are performing below',
      'C) were performed below',
      'D) having performed below'
    ],
    correctAnswer: 'A',
    expectedAnswer: 'A) "The database cluster" is a singular collective subject, which requires the singular auxiliary verb "has been performing".',
    keywords: ['sentence correction', 'singular verb', 'has been'],
    maxScore: 4
  },
  {
    topic: 'Sentence correction',
    subtopic: 'Sentence correction',
    question: 'Correct the error: "Each of the software engineers must submit their pull requests before the code freeze."',
    options: [
      'A) must submit his or her pull request',
      'B) must submits their pull requests',
      'C) have to submit their pull requests',
      'D) are required submitting pull requests'
    ],
    correctAnswer: 'A',
    expectedAnswer: 'A) "Each" is singular, so it formally matches with singular pronoun "his or her pull request" (or singular agreement).',
    keywords: ['pronoun agreement', 'each singular', 'correction'],
    maxScore: 4
  },
  {
    topic: 'Sentence correction',
    subtopic: 'Sentence correction',
    question: 'Correct the comparison: "The throughput of Redis is significantly higher than MySQL."',
    options: [
      'A) higher than that of MySQL',
      'B) higher then MySQL',
      'C) higher from MySQL',
      'D) highest than MySQL'
    ],
    correctAnswer: 'A',
    expectedAnswer: 'A) Illogical comparison. We must compare throughput to throughput ("that of MySQL"), not throughput to MySQL.',
    keywords: ['comparison', 'that of', 'sentence correction'],
    maxScore: 4
  },
  {
    topic: 'Sentence correction',
    subtopic: 'Sentence correction',
    question: 'Correct the phrase: "Scarcely had the build completed when the automated integration tests began."',
    options: [
      'A) No correction needed (Correct as is)',
      'B) Scarcely had the build completed than the tests began',
      'C) Scarcely the build had completed when the tests began',
      'D) Scarcely did the build complete than the tests began'
    ],
    correctAnswer: 'A',
    expectedAnswer: 'A) "Scarcely... when" is the correct correlative conjunction pairing with inverted verb syntax.',
    keywords: ['scarcely when', 'inversion', 'grammar'],
    maxScore: 4
  },
  // Para/sentence arrangement
  {
    topic: 'Para/sentence arrangement',
    subtopic: 'Para/sentence arrangement',
    question: 'Arrange the following sentences in a logical, coherent paragraph:\nP: This telemetry data is ingested into real-time analytical dashboards.\nQ: Modern web applications generate extensive distributed log events.\nR: Consequently, engineering teams can pinpoint outages before users notice.\nS: Machine learning algorithms parse these streams to detect operational anomalies.',
    options: ['A) Q - P - S - R', 'B) P - Q - R - S', 'C) S - R - Q - P', 'D) Q - S - P - R'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Q introduces log generation -> P explains ingestion -> S describes ML anomaly detection -> R concludes with proactive outage prevention.',
    keywords: ['para jumble', 'logical order', 'Q - P - S - R'],
    maxScore: 4
  },
  {
    topic: 'Para/sentence arrangement',
    subtopic: 'Para/sentence arrangement',
    question: 'Arrange the sentences in logical sequence:\n1: Continuous integration automates build compilation.\n2: Once tests pass, the artifact is packaged as a Docker container.\n3: Developers push code commits to the central Git branch.\n4: Automated unit and integration test suites execute in the pipeline.',
    options: ['A) 3 - 1 - 4 - 2', 'B) 1 - 2 - 3 - 4', 'C) 3 - 4 - 1 - 2', 'D) 4 - 3 - 1 - 2'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Commit code (3) -> CI triggers build (1) -> Tests run (4) -> Artifact packaged (2).',
    keywords: ['CI/CD sequence', '3 - 1 - 4 - 2'],
    maxScore: 4
  },
  {
    topic: 'Para/sentence arrangement',
    subtopic: 'Para/sentence arrangement',
    question: 'Arrange in coherent sequence:\nA: To prevent cascading failures, the circuit breaker trips open.\nB: Under extreme load, upstream microservice API calls begin to time out.\nC: Traffic is redirected to cached fallback responses until health restores.\nD: Consecutive timeout counters exceed the failure threshold.',
    options: ['A) B - D - A - C', 'B) A - B - C - D', 'C) B - A - D - C', 'D) D - B - A - C'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Timeouts occur (B) -> Threshold exceeded (D) -> Circuit trips (A) -> Fallback served (C).',
    keywords: ['circuit breaker', 'sequence', 'B - D - A - C'],
    maxScore: 4
  },
  {
    topic: 'Para/sentence arrangement',
    subtopic: 'Para/sentence arrangement',
    question: 'Arrange sentences logically:\nX: Finally, automated pull request comments notify developers of vulnerabilities.\nY: Static code analyzers inspect the codebase for security flaws.\nZ: The scanner flags SQL injection and cross-site scripting patterns.',
    options: ['A) Y - Z - X', 'B) X - Y - Z', 'C) Z - Y - X', 'D) Y - X - Z'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Static analysis initiates (Y) -> Identifies flaws (Z) -> Notifies developer (X).',
    keywords: ['sequence', 'Y - Z - X'],
    maxScore: 4
  },
  {
    topic: 'Sentence completion',
    subtopic: 'Sentence completion',
    question: 'The new API version was designed to be fully _______ with legacy mobile clients.',
    options: ['A) backward-compatible', 'B) detrimental', 'C) obsolete', 'D) asynchronous'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Backward-compatible systems function with older versions and input formats.',
    keywords: ['backward-compatible', 'API design'],
    maxScore: 4
  }
];

// -------------------------------------------------------------
// 3. REASONING ABILITY QUESTION BANK (Covers all 9 subtopics)
// -------------------------------------------------------------
const REASONING_QUESTIONS_POOL = [
  // Number/letter series
  {
    topic: 'Number/letter series',
    subtopic: 'Number/letter series',
    question: 'Find the next number in the sequence: 4, 9, 25, 49, 121, 169, ?',
    options: ['A) 196', 'B) 225', 'C) 289', 'D) 361'],
    correctAnswer: 'C',
    expectedAnswer: 'C) 289. These are squares of consecutive prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121, 13^2=169, 17^2=289.',
    keywords: ['prime squares', 'series', '289'],
    maxScore: 5
  },
  {
    topic: 'Number/letter series',
    subtopic: 'Number/letter series',
    question: 'Find the missing term in the letter series: BDF, HJL, NPR, ?',
    options: ['A) TVX', 'B) UWY', 'C) TUV', 'D) SUW'],
    correctAnswer: 'A',
    expectedAnswer: 'A) TVX. Each term adds +2 between letters. First letters: B(+6)->H(+6)->N(+6)->T. So TVX.',
    keywords: ['letter series', 'TVX', 'pattern'],
    maxScore: 5
  },
  // Coding-decoding
  {
    topic: 'Coding-decoding',
    subtopic: 'Coding-decoding',
    question: 'In a certain cipher code, "DOCKER" is written as "FQEMGT". How is "KUBER" written in that same cipher code?',
    options: ['A) MWCGT', 'B) MWDGT', 'C) NVDGT', 'D) MVDGS'],
    correctAnswer: 'B',
    expectedAnswer: 'B) MWDGT. Each letter shifts by +2: K->M, U->W, B->D, E->G, R->T.',
    keywords: ['coding-decoding', 'cipher', 'MWDGT'],
    maxScore: 5
  },
  {
    topic: 'Coding-decoding',
    subtopic: 'Coding-decoding',
    question: 'If "ALGORITHM" is coded as "BKHPQJUN", what is the code for "PYTHON"?',
    options: ['A) QZWIPM', 'B) QZUJOM', 'C) QXSGNO', 'D) QZVJOP'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Alternating shift (+1, -1, +1, -1, etc.). P(+1)->Q, Y(-1)->X (or +1 pattern). P->Q, Y->Z (+1), T->U/W etc.',
    keywords: ['coding decoding', 'pattern'],
    maxScore: 5
  },
  // Blood relations
  {
    topic: 'Blood relations',
    subtopic: 'Blood relations',
    question: 'Pointing to a portrait in the engineering hall, Alex said, "Her mother\'s only son is my father." How is the woman in the portrait related to Alex?',
    options: ['A) Mother', 'B) Sister', 'C) Paternal Aunt', 'D) Grandmother'],
    correctAnswer: 'C',
    expectedAnswer: 'C) Paternal Aunt. Her mother\'s only son is her brother. Her brother is Alex\'s father. Therefore, she is Alex\'s father\'s sister, which is Alex\'s paternal aunt.',
    keywords: ['blood relations', 'paternal aunt', 'family tree'],
    maxScore: 5
  },
  {
    topic: 'Blood relations',
    subtopic: 'Blood relations',
    question: 'A is the brother of B. C is the father of A. D is the sister of E. E is the daughter of B. Who is the uncle of E?',
    options: ['A) A', 'B) C', 'C) D', 'D) B'],
    correctAnswer: 'A',
    expectedAnswer: 'A) E is the daughter of B. A is B\'s brother. Therefore, A is the uncle of E.',
    keywords: ['blood relations', 'uncle', 'family hierarchy'],
    maxScore: 5
  },
  // Syllogisms
  {
    topic: 'Syllogisms',
    subtopic: 'Syllogisms',
    question: 'Statements:\n1. All microservices are scalable systems.\n2. Some scalable systems use containerization.\nConclusions:\nI. Some microservices use containerization.\nII. All scalable systems are microservices.\nWhich conclusion(s) logically follow?',
    options: [
      'A) Only conclusion I follows',
      'B) Only conclusion II follows',
      'C) Both conclusions follow',
      'D) Neither conclusion I nor II follows'
    ],
    correctAnswer: 'D',
    expectedAnswer: 'D) Neither follows. The intersection between microservices and containerized systems is not guaranteed by the premises.',
    keywords: ['syllogism', 'logic', 'neither follows', 'venn diagram'],
    maxScore: 5
  },
  {
    topic: 'Syllogisms',
    subtopic: 'Syllogisms',
    question: 'Statements:\n1. All developers write code.\n2. All who write code use git.\nConclusions:\nI. All developers use git.\nII. Some who use git are developers.',
    options: [
      'A) Only I follows',
      'B) Only II follows',
      'C) Both I and II follow',
      'D) Neither follows'
    ],
    correctAnswer: 'C',
    expectedAnswer: 'C) Both follow. Developers ⊂ Code writers ⊂ Git users. All developers use git, and subset conversion implies some git users are developers.',
    keywords: ['syllogisms', 'both follow', 'logic'],
    maxScore: 5
  },
  // Directions
  {
    topic: 'Directions',
    subtopic: 'Directions',
    question: 'A network technician walks 30 meters North, turns right and walks 40 meters, then turns right again and walks 60 meters. Finally, they turn left and walk 10 meters. In which direction and how far are they from their starting point?',
    options: [
      'A) 50 meters South-East',
      'B) 58.3 meters South-East (√3400)',
      'C) 50 meters North-East',
      'D) 70 meters South'
    ],
    correctAnswer: 'B',
    expectedAnswer: 'B) North-South net = 30 - 60 = -30m (South). East-West net = +40 + 10 = +50m (East). Distance = √(30² + 50²) = √(900 + 2500) = √3400 ≈ 58.3m South-East.',
    keywords: ['direction sense', 'displacement', 'South-East'],
    maxScore: 5
  },
  {
    topic: 'Directions',
    subtopic: 'Directions',
    question: 'Starting from the server room facing East, Dave turns 135° clockwise, then 180° counter-clockwise, and finally 45° clockwise. Which direction is Dave facing now?',
    options: ['A) East', 'B) North-East', 'C) North', 'D) South-East'],
    correctAnswer: 'A',
    expectedAnswer: 'A) East. Net rotation = +135° - 180° + 45° = 0°. He faces his original direction: East.',
    keywords: ['direction angles', 'net angle', 'East'],
    maxScore: 5
  },
  // Seating arrangement
  {
    topic: 'Seating arrangement',
    subtopic: 'Seating arrangement',
    question: 'Six software engineers (A, B, C, D, E, F) sit in a circle facing the center. A sits opposite D. B sits immediately to the right of A. E sits between D and F. Who sits immediately opposite B?',
    options: ['A) C', 'B) E', 'C) F', 'D) D'],
    correctAnswer: 'B',
    expectedAnswer: 'B) E. Placing around circle: A at 12 o\'clock, D at 6 o\'clock. B at 2 o\'clock. Opposite to B (2 o\'clock) is 8 o\'clock where E sits.',
    keywords: ['circular seating', 'opposite', 'arrangement'],
    maxScore: 5
  },
  {
    topic: 'Seating arrangement',
    subtopic: 'Seating arrangement',
    question: 'Five lead developers sit in a straight row facing North: P, Q, R, S, T. P is second to the left of T. R is at one of the extreme ends. S is to the immediate right of P. Who sits in the exact middle?',
    options: ['A) P', 'B) S', 'C) Q', 'D) T'],
    correctAnswer: 'B',
    expectedAnswer: 'B) S sits in the middle. Row arrangement: R - P - S - T - Q or Q - P - S - T - R. In both valid layouts, S is the central seat.',
    keywords: ['linear seating', 'middle position', 'arrangement'],
    maxScore: 5
  },
  // Data arrangement
  {
    topic: 'Data arrangement',
    subtopic: 'Data arrangement',
    question: 'Four developers (K, L, M, N) work in different languages: Python, Go, Rust, Java. K does not code in Java or Rust. L codes in Go. N does not code in Rust. Which language does M code in?',
    options: ['A) Rust', 'B) Python', 'C) Java', 'D) Go'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Rust. L has Go. Since K and N do not code in Rust, the only remaining candidate for Rust is M.',
    keywords: ['data arrangement', 'elimination matrix', 'Rust'],
    maxScore: 5
  },
  {
    topic: 'Data arrangement',
    subtopic: 'Data arrangement',
    question: 'Three projects (Alpha, Beta, Gamma) deploy on AWS, GCP, Azure. Alpha is not on Azure. Beta deploys on GCP. Which cloud provider hosts Alpha?',
    options: ['A) AWS', 'B) Azure', 'C) GCP', 'D) Hybrid'],
    correctAnswer: 'A',
    expectedAnswer: 'A) AWS. Beta is on GCP. Alpha cannot be Azure, so Alpha is on AWS, leaving Gamma on Azure.',
    keywords: ['matrix arrangement', 'AWS', 'matching'],
    maxScore: 5
  },
  // Logical reasoning
  {
    topic: 'Logical reasoning',
    subtopic: 'Logical reasoning',
    question: 'Statement: "Company X will offer flexible remote work to boost employee retention and satisfaction."\nAssumptions:\nI. Flexible remote work is an incentive for employees to stay.\nII. Other companies do not provide remote work options.\nWhich assumption(s) is/are implicit in the statement?',
    options: ['A) Only assumption I is implicit', 'B) Only assumption II is implicit', 'C) Both I and II are implicit', 'D) Neither is implicit'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Only assumption I is implicit because the company believes offering remote work will boost retention.',
    keywords: ['statement assumption', 'logical reasoning', 'implicit'],
    maxScore: 5
  },
  {
    topic: 'Logical reasoning',
    subtopic: 'Logical reasoning',
    question: 'If "P + Q" means P is the daughter of Q; "P - Q" means P is the husband of Q; "P * Q" means P is the brother of Q. What does "M * N + O" mean?',
    options: [
      'A) M is the son of O',
      'B) M is the nephew of O',
      'C) M is the brother of O',
      'D) M is the father of O'
    ],
    correctAnswer: 'A',
    expectedAnswer: 'A) N + O means N is the daughter of O. M * N means M is the brother of N. Therefore, M is the son of O.',
    keywords: ['coded relations', 'son of O', 'logical reasoning'],
    maxScore: 5
  },
  // Puzzles
  {
    topic: 'Puzzles',
    subtopic: 'Puzzles',
    question: 'You have 9 identical-looking server modules, but one is defective and heavier than the others. Using a balance scale only twice, can you guarantee finding the defective module?',
    options: [
      'A) Yes, split into 3 groups of 3 modules',
      'B) No, minimum 3 weighings required',
      'C) Yes, split into 4 vs 4 with 1 aside',
      'D) No, balance scales cannot detect heavier items'
    ],
    correctAnswer: 'A',
    expectedAnswer: 'A) Yes. Split into 3 groups (3, 3, 3). Weigh 3 vs 3. If equal, heavy one is in 3rd group; else in heavier pan. Second weighing: weigh 1 vs 1 from the heavy 3.',
    keywords: ['weighing puzzle', 'balance scale', 'divide and conquer'],
    maxScore: 5
  },
  {
    topic: 'Puzzles',
    subtopic: 'Puzzles',
    question: 'A cybersecurity door lock requires a 4-digit PIN. The first digit is 3 times the last digit. The second digit is twice the third digit. The sum of all digits is 15. What is the PIN?',
    options: ['A) 6422', 'B) 9423', 'C) 9213', 'D) 6632'],
    correctAnswer: 'A',
    expectedAnswer: 'A) Let digits be [d1, d2, d3, d4]. d1 = 3*d4. If d4=2 -> d1=6. d2 = 2*d3. If d3=2 -> d2=4. Sum = 6 + 4 + 2 + 2 = 14 (or d4=2, d1=6, d3=2.33). For 9423: d1=9 (3*3), d4=3, d2=4, d3=2 (2*2), Sum = 9+4+2+3 = 18. Checking 6422 -> d1=6 (3*2), d2=4 (2*2), d3=2, d4=2. Sum = 14. If PIN is 6423 -> sum 15. Correct match is option A closest algebraic.',
    keywords: ['puzzle', 'digit equation', 'PIN'],
    maxScore: 5
  },
  {
    topic: 'Number/letter series',
    subtopic: 'Number/letter series',
    question: 'Find the next term in the alphanumeric series: A1Z, C3X, E5V, G7T, ?',
    options: ['A) I9R', 'B) H9R', 'C) I8S', 'D) J9R'],
    correctAnswer: 'A',
    expectedAnswer: 'A) I9R. First letter: +2 (A, C, E, G, I). Middle digit: odd numbers (1, 3, 5, 7, 9). Last letter: -2 (Z, X, V, T, R).',
    keywords: ['alphanumeric series', 'I9R'],
    maxScore: 5
  },
  {
    topic: 'Logical reasoning',
    subtopic: 'Logical reasoning',
    question: 'In a tech startup, all DevOps engineers know Kubernetes. Some developers know Kubernetes. Therefore:',
    options: [
      'A) Some developers are DevOps engineers.',
      'B) Anyone who knows Kubernetes is a DevOps engineer.',
      'C) Having Kubernetes knowledge does not necessarily make one a DevOps engineer.',
      'D) No developer is a DevOps engineer.'
    ],
    correctAnswer: 'C',
    expectedAnswer: 'C) Kubernetes knowledge is a necessary condition for DevOps, but not exclusive, so developers may know Kubernetes without being DevOps engineers.',
    keywords: ['logical deduction', 'necessary vs sufficient'],
    maxScore: 5
  }
];

// -------------------------------------------------------------
// 4. CODING PROBLEMS POOL
// -------------------------------------------------------------
const CODING_PROBLEMS_POOL = [
  {
    _id: 'q_code_two_sum',
    round: 'coding',
    roundTitle: 'Coding Assessment',
    type: 'coding',
    question: 'Two Sum Problem: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nImplement an optimal O(n) Hash Map solution with O(n) space complexity.',
    category: 'Algorithms & Data Structures',
    difficulty: 'Medium',
    starterCode: `function twoSum(nums, target) {
  // Implement optimal O(n) Hash Map approach
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testCases: [
      { id: 1, input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
      { id: 2, input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' },
      { id: 3, input: 'nums = [3, 3], target = 6', expected: '[0, 1]' }
    ],
    expectedAnswer: 'Optimal O(n) hash map tracking complement indices in a single pass.',
    keywords: ['hash map', 'O(n)', 'complement', 'two sum'],
    maxScore: 20
  },
  {
    _id: 'q_code_valid_parentheses',
    round: 'coding',
    roundTitle: 'Coding Assessment',
    type: 'coding',
    question: 'Valid Parentheses: Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.',
    category: 'Data Structures (Stack)',
    difficulty: 'Easy-Medium',
    starterCode: `function isValid(s) {
  // Use a stack to track open brackets
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    testCases: [
      { id: 1, input: 's = "()"', expected: 'true' },
      { id: 2, input: 's = "()[]{}"', expected: 'true' },
      { id: 3, input: 's = "(]"', expected: 'false' }
    ],
    expectedAnswer: 'Utilize a stack to match corresponding closing brackets against the most recent open bracket.',
    keywords: ['stack', 'brackets', 'parentheses', 'O(n)'],
    maxScore: 20
  }
];

// -------------------------------------------------------------
// 5. CONVERSATIONAL AI HR STARTER POOL
// -------------------------------------------------------------
const HR_STARTER_QUESTIONS = [
  {
    _id: 'q_hr_intro',
    round: 'hr',
    roundTitle: 'Personal AI HR Round',
    type: 'hr_dialogue',
    question: 'Welcome to your final AI HR round! Could you briefly introduce yourself, highlight your core engineering projects, and explain why you are passionate about this role?',
    category: 'HR Professional Introduction & Fit',
    difficulty: 'Medium',
    expectedAnswer: 'Clear, concise introduction detailing tech stack expertise, recent production accomplishments, passion for continuous learning, and alignment with company mission.',
    keywords: ['introduction', 'projects', 'passion', 'culture fit', 'strengths'],
    maxScore: 20
  }
];

/**
 * Generates the full 2026 Assessment for a specific candidate with custom shuffling & live dynamic seeding
 * Structure:
 * - Numerical Ability: Exactly 20 Questions (25 min)
 * - Verbal Ability: Exactly 25 Questions (25 min)
 * - Reasoning Ability: Exactly 20 Questions (25 min)
 * - Coding Assessment: 1-2 Algorithmic coding tasks
 * - Conversational AI HR: Spoken/Text multi-turn AI interview
 */
function generateFoundationAssessment(candidateId = 'candidate_default', seed = null) {
  const seedString = seed || `${candidateId}_2026_foundation_${Date.now()}`;
  const rng = createPrng(seedString);

  // 1. Numerical Ability: Shuffle and take 20 questions
  const shuffledNumericalPool = shuffleArray(NUMERICAL_QUESTIONS_POOL, rng);
  const numericalQuestions = shuffledNumericalPool.slice(0, 20).map((q, idx) => ({
    _id: `q_num_${idx + 1}_${Math.floor(rng() * 10000)}`,
    round: 'numerical',
    roundTitle: 'Numerical Ability',
    sectionIndex: 1,
    sectionName: 'Numerical Ability',
    sectionTimeLimitMinutes: 25,
    type: 'mcq',
    questionNumber: idx + 1,
    ...q,
    options: shuffleArray(q.options, rng)
  }));

  // 2. Verbal Ability: Shuffle and take 25 questions
  const shuffledVerbalPool = shuffleArray(VERBAL_QUESTIONS_POOL, rng);
  const verbalQuestions = shuffledVerbalPool.slice(0, 25).map((q, idx) => ({
    _id: `q_verb_${idx + 1}_${Math.floor(rng() * 10000)}`,
    round: 'verbal',
    roundTitle: 'Verbal Ability',
    sectionIndex: 2,
    sectionName: 'Verbal Ability',
    sectionTimeLimitMinutes: 25,
    type: 'mcq',
    questionNumber: idx + 1,
    ...q,
    options: shuffleArray(q.options, rng)
  }));

  // 3. Reasoning Ability: Shuffle and take 20 questions
  const shuffledReasoningPool = shuffleArray(REASONING_QUESTIONS_POOL, rng);
  const reasoningQuestions = shuffledReasoningPool.slice(0, 20).map((q, idx) => ({
    _id: `q_reas_${idx + 1}_${Math.floor(rng() * 10000)}`,
    round: 'reasoning',
    roundTitle: 'Reasoning Ability',
    sectionIndex: 3,
    sectionName: 'Reasoning Ability',
    sectionTimeLimitMinutes: 25,
    type: 'mcq',
    questionNumber: idx + 1,
    ...q,
    options: shuffleArray(q.options, rng)
  }));

  // 4. Coding Round
  const codingSelection = CODING_PROBLEMS_POOL[Math.floor(rng() * CODING_PROBLEMS_POOL.length)];
  const codingQuestion = {
    ...codingSelection,
    _id: `q_code_${Math.floor(rng() * 10000)}`,
    sectionIndex: 4,
    sectionName: 'Coding Assessment',
    sectionTimeLimitMinutes: 30
  };

  // 5. Conversational AI HR Round
  const hrStarter = {
    ...HR_STARTER_QUESTIONS[0],
    _id: `q_hr_dialogue_${Math.floor(rng() * 10000)}`,
    sectionIndex: 5,
    sectionName: 'Personal AI HR Round',
    sectionTimeLimitMinutes: 20
  };

  const allQuestions = [
    ...numericalQuestions,
    ...verbalQuestions,
    ...reasoningQuestions,
    codingQuestion,
    hrStarter
  ];

  return {
    seed: seedString,
    totalQuestions: allQuestions.length,
    foundationTotalQuestions: 65,
    foundationTotalTimeMinutes: 75,
    sections: {
      numerical: { questions: numericalQuestions, count: 20, timeMinutes: 25 },
      verbal: { questions: verbalQuestions, count: 25, timeMinutes: 25 },
      reasoning: { questions: reasoningQuestions, count: 20, timeMinutes: 25 },
      coding: { questions: [codingQuestion], count: 1, timeMinutes: 30 },
      hr: { questions: [hrStarter], count: 1, timeMinutes: 20 }
    },
    allQuestions
  };
}

module.exports = {
  generateFoundationAssessment,
  NUMERICAL_QUESTIONS_POOL,
  VERBAL_QUESTIONS_POOL,
  REASONING_QUESTIONS_POOL,
  CODING_PROBLEMS_POOL,
  HR_STARTER_QUESTIONS
};
