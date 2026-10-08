const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Interview = require('../models/Interview');

/**
 * Initializes essential system records (Admin account & 6-Round Assessment template)
 * covering: MCQ, Technical, Aptitude, Coding Round, Communication Round, and HR Final AI Round.
 */
async function initDatabase() {
  // Ensure default administrator account exists
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123', salt);
    await User.create({
      _id: 'admin_master_sys',
      name: 'System Administrator',
      email: 'admin@interview.ai',
      passwordHash,
      role: 'admin'
    });
    console.log('[Database] Created default administrator: admin@interview.ai');
  }

  // Ensure 6-Round Comprehensive Assessment Template exists
  const defaultQuestions = [
    // 1. MCQ Round
    {
      _id: 'q_mcq_1',
      round: 'mcq',
      roundTitle: 'MCQ Round',
      type: 'mcq',
      question: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?',
      category: 'Computer Science Fundamentals',
      difficulty: 'Medium',
      options: [
        'A) O(1) Constant Time',
        'B) O(log n) Logarithmic Time',
        'C) O(n) Linear Time',
        'D) O(n log n) Linearithmic Time'
      ],
      correctAnswer: 'B',
      expectedAnswer: 'B) O(log n) Logarithmic Time because a balanced tree halves the search space at each node.',
      keywords: ['logarithmic', 'O(log n)', 'binary search tree', 'balanced', 'height'],
      maxScore: 10
    },
    {
      _id: 'q_mcq_2',
      round: 'mcq',
      roundTitle: 'MCQ Round',
      type: 'mcq',
      question: 'In relational database ACID properties, which property ensures that concurrent transactions execute independently without interfering with one another?',
      category: 'Database Systems',
      difficulty: 'Medium',
      options: [
        'A) Atomicity',
        'B) Consistency',
        'C) Isolation',
        'D) Durability'
      ],
      correctAnswer: 'C',
      expectedAnswer: 'C) Isolation ensures that intermediate transaction states are invisible to other concurrently executing transactions.',
      keywords: ['isolation', 'ACID', 'concurrency', 'transactions', 'locks'],
      maxScore: 10
    },

    // 2. Technical Round
    {
      _id: 'q_tech_1',
      round: 'technical',
      roundTitle: 'Technical Round',
      type: 'text',
      question: 'Explain the event loop in Node.js and how asynchronous non-blocking I/O is achieved through libuv and microtask queues.',
      category: 'Backend Architecture',
      difficulty: 'Medium',
      expectedAnswer: 'The Node.js event loop coordinates asynchronous I/O via libuv and a single execution thread. It manages distinct phases: timers, pending callbacks, poll, check (setImmediate), and close callbacks. Microtasks such as process.nextTick and Promise callbacks execute between phases to maintain high throughput without blocking.',
      keywords: ['event loop', 'libuv', 'single thread', 'non-blocking', 'timers', 'poll', 'check', 'microtasks', 'promises'],
      maxScore: 15
    },
    {
      _id: 'q_tech_2',
      round: 'technical',
      roundTitle: 'Technical Round',
      type: 'text',
      question: 'What is database normalization, why is it needed in production systems, and what distinguishes 1NF, 2NF, and 3NF?',
      category: 'Database Engineering',
      difficulty: 'Medium',
      expectedAnswer: 'Database normalization structures relational tables to eliminate redundancy and update anomalies. 1NF enforces atomic attributes and primary keys. 2NF removes partial key dependencies. 3NF removes transitive dependencies where non-key attributes depend on other non-key attributes.',
      keywords: ['redundancy', 'anomalies', '1NF', '2NF', '3NF', 'atomic values', 'partial dependency', 'transitive dependency'],
      maxScore: 15
    },

    // 3. Aptitude Round
    {
      _id: 'q_apt_1',
      round: 'aptitude',
      roundTitle: 'Aptitude Round',
      type: 'mcq',
      question: 'Machine A produces 120 microchips in 4 hours. Machine B produces 180 microchips in 3 hours. How many microchips will both machines produce working simultaneously for 5 hours?',
      category: 'Quantitative Aptitude',
      difficulty: 'Medium',
      options: [
        'A) 450 microchips',
        'B) 420 microchips',
        'C) 380 microchips',
        'D) 500 microchips'
      ],
      correctAnswer: 'A',
      expectedAnswer: 'A) 450 microchips. Machine A rate = 30/hr. Machine B rate = 60/hr. Combined rate = 90/hr * 5 hours = 450 microchips.',
      keywords: ['rate', 'work', 'combined rate', '450'],
      maxScore: 10
    },
    {
      _id: 'q_apt_2',
      round: 'aptitude',
      roundTitle: 'Aptitude Round',
      type: 'mcq',
      question: 'A cloud cluster traffic load doubles every 30 minutes during a peak traffic event. If the cluster reaches maximum capacity in 4 hours, at what point in time was the cluster at exactly 25% capacity?',
      category: 'Logical Reasoning',
      difficulty: 'Medium',
      options: [
        'A) 1 hour',
        'B) 2 hours',
        'C) 3 hours',
        'D) 3.5 hours'
      ],
      correctAnswer: 'C',
      expectedAnswer: 'C) 3 hours. At 4 hours = 100%. At 3.5 hours = 50%. At 3 hours = 25%.',
      keywords: ['exponential growth', 'capacity', 'halving', '3 hours'],
      maxScore: 10
    },

    // 4. Coding Round
    {
      _id: 'q_code_1',
      round: 'coding',
      roundTitle: 'Coding Round',
      type: 'coding',
      question: 'Two Sum Problem: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Implement an optimal O(n) Hash Map solution and avoid brute-force O(n²).',
      category: 'Algorithms & Coding',
      difficulty: 'Medium',
      starterCode: `function twoSum(nums, target) {
  // Optimal O(n) Hash Map implementation
  const numMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (numMap.has(complement)) {
      return [numMap.get(complement), i];
    }
    numMap.set(nums[i], i);
  }
  return [];
}`,
      testCases: [
        { id: 1, input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
        { id: 2, input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' },
        { id: 3, input: 'nums = [3, 3], target = 6', expected: '[0, 1]' }
      ],
      expectedAnswer: 'Use a single pass Hash Map to map visited elements to their indices. For each number, compute target - num. Look up complement in O(1) time, yielding overall O(n) time and O(n) space complexity.',
      keywords: ['hash map', 'O(n)', 'complement', 'lookup', 'indices', 'space complexity', 'two sum'],
      maxScore: 20
    },

    // 5. Communication Round
    {
      _id: 'q_comm_1',
      round: 'communication',
      roundTitle: 'Communication Round',
      type: 'speech',
      question: 'Incident Management Verbal Briefing: A production microservice outage occurred due to an unhandled upstream API rate limit. Deliver a clear, concise verbal briefing to leadership explaining the root cause, immediate mitigation, recovery timeline, and safeguards.',
      category: 'Verbal Communication',
      difficulty: 'Medium',
      expectedAnswer: 'Effective verbal briefing opens with clear incident impact, explains root cause objectively without blame, outlines immediate mitigation (circuit breaker, fallback caching), defines SLA recovery, and offers proactive follow-up.',
      keywords: ['incident', 'root cause', 'mitigation', 'circuit breaker', 'SLA', 'communication', 'leadership', 'transparency'],
      maxScore: 15
    },

    // 6. HR Final AI Round
    {
      _id: 'q_hr_1',
      round: 'hr',
      roundTitle: 'HR Final AI Round',
      type: 'text',
      question: 'Tell me about a high-stakes scenario where you faced a significant technical disagreement or conflicting delivery priorities within your engineering team. How did you navigate the situation, evaluate trade-offs, and maintain collaborative momentum?',
      category: 'HR Behavioral & Culture Fit',
      difficulty: 'Medium',
      expectedAnswer: 'Strong response demonstrates active listening, emotional intelligence, objective data benchmarking over ego, seeking constructive consensus, focusing on user impact and delivery commitments, and establishing long-term trust.',
      keywords: ['collaboration', 'active listening', 'data-driven', 'trade-offs', 'alignment', 'empathy', 'consensus', 'deliverables'],
      maxScore: 15
    }
  ];

  await Interview.deleteMany({});
  await Interview.create({
    _id: 'int_fullstack_2026',
    title: 'Full-Stack Software Engineer Multi-Round Evaluation',
    jobRole: 'Full-Stack Software Engineer',
    description: 'Comprehensive 6-Round Assessment: 1. MCQ Round, 2. Technical Round, 3. Aptitude Round, 4. Coding Round, 5. Communication Round, and 6. HR Final AI Round with Automated AI Proctoring.',
    duration: 45,
    difficulty: 'Intermediate',
    questions: defaultQuestions,
    createdBy: 'System Administrator'
  });

  console.log('[Database] Initialized 6-Round Assessment Template (MCQ, Technical, Aptitude, Coding, Communication, HR Final AI)');
}

if (require.main === module) {
  const { connectDB } = require('../config/db');
  (async () => {
    try {
      await connectDB();
      await initDatabase();
      console.log('[Database] Initialization completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('[Database Init Error]:', err);
      process.exit(1);
    }
  })();
}

module.exports = initDatabase;
