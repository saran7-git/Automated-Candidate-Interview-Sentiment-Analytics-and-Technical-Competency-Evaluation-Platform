const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const InterviewSession = require('../models/InterviewSession');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');
const FinalReport = require('../models/FinalReport');

/**
 * Completely purges all demo and temporary candidate records,
 * reset and re-initializes the database with only the System Administrator
 * and standard interview templates, ready for maintaining new user accounts.
 */
async function resetDatabase() {
  console.log('[Reset] Connecting to database...');
  await connectDB();

  console.log('[Reset] Removing all candidate accounts and interview session data...');
  await Candidate.deleteMany({});
  await InterviewSession.deleteMany({});
  await Response.deleteMany({});
  await Evaluation.deleteMany({});
  await FinalReport.deleteMany({});

  // Remove non-admin users
  await User.deleteMany({ role: 'candidate' });

  console.log('[Reset] Ensuring clean System Administrator account...');
  await User.deleteMany({ role: 'admin' });
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@123', salt);

  await User.create({
    _id: 'admin_master_sys',
    name: 'System Administrator',
    email: 'admin@interview.ai',
    passwordHash,
    role: 'admin'
  });
  console.log('[Reset] Administrator account active: admin@interview.ai / Admin@123');

  // Verify interview templates exist
  const existingInterviews = await Interview.find();
  if (existingInterviews.length === 0) {
    const defaultQuestions = [
      {
        _id: 'q_prog_1',
        question: 'Explain the event loop in Node.js and how asynchronous non-blocking I/O is achieved.',
        category: 'Programming',
        difficulty: 'Medium',
        expectedAnswer: 'The Node.js event loop coordinates asynchronous I/O via libuv and a single execution thread. It manages distinct phases: timers, pending callbacks, idle/prepare, poll, check (setImmediate), and close callbacks. Microtasks such as process.nextTick and Promise callbacks execute between phases to maintain high throughput without blocking.',
        keywords: ['event loop', 'libuv', 'single thread', 'non-blocking', 'timers', 'poll', 'check', 'microtasks', 'promises'],
        maxScore: 10
      },
      {
        _id: 'q_db_1',
        question: 'What is database normalization, why is it needed, and what distinguish 1NF, 2NF, and 3NF?',
        category: 'Database',
        difficulty: 'Medium',
        expectedAnswer: 'Database normalization is the process of structuring relational tables to reduce data redundancy and eliminate anomalies (insert, update, delete). 1NF requires atomic values and unique records. 2NF removes partial dependency on composite keys. 3NF removes transitive dependencies where non-key attributes depend on other non-key attributes.',
        keywords: ['redundancy', 'anomalies', '1NF', '2NF', '3NF', 'atomic values', 'partial dependency', 'transitive dependency'],
        maxScore: 10
      },
      {
        _id: 'q_net_1',
        question: 'Describe what occurs when a client initiates an HTTPS request to an API endpoint.',
        category: 'Networking',
        difficulty: 'Medium',
        expectedAnswer: 'The browser performs DNS resolution to retrieve the server IP, establishes a TCP three-way handshake (SYN, SYN-ACK, ACK), negotiates TLS handshake to verify certificates and exchange symmetric session keys, and then transmits encrypted HTTP requests over port 443 with TLS encryption.',
        keywords: ['DNS resolution', 'TCP handshake', 'SYN', 'ACK', 'TLS handshake', 'certificate', 'symmetric key', 'port 443', 'encrypted'],
        maxScore: 10
      },
      {
        _id: 'q_os_1',
        question: 'Differentiate between processes and threads, and explain how the operating system handles context switching.',
        category: 'Operating Systems',
        difficulty: 'Medium',
        expectedAnswer: 'A process is an isolated instance of an executing program with its own dedicated memory space, address map, and resources. A thread is the smallest unit of CPU execution within a process that shares the heap, memory, and open descriptors. Context switching involves saving CPU registers, program counter, and state to the Process Control Block (PCB) or Thread Control Block (TCB), which incurs CPU overhead and cache invalidation.',
        keywords: ['process', 'thread', 'memory space', 'shared heap', 'context switching', 'PCB', 'registers', 'cache overhead'],
        maxScore: 10
      },
      {
        _id: 'q_ds_1',
        question: 'Explain how a Hash Table resolves collisions and compare Open Addressing with Chaining.',
        category: 'Data Structures',
        difficulty: 'Medium',
        expectedAnswer: 'A hash table maps keys to buckets using a hash function. Collisions occur when multiple keys hash to the same bucket. Chaining resolves collisions by storing elements in a linked list or tree at each bucket. Open addressing searches for alternative vacant slots using probing techniques like linear probing, quadratic probing, or double hashing.',
        keywords: ['hash table', 'hash function', 'collisions', 'chaining', 'linked list', 'open addressing', 'linear probing', 'O(1)'],
        maxScore: 10
      },
      {
        _id: 'q_hr_1',
        question: 'Tell me about a time you resolved a major disagreement regarding architecture or delivery priorities in your team.',
        category: 'HR/Behavioral',
        difficulty: 'Easy',
        expectedAnswer: 'Effective answer explains the situation objectively, highlights proactive communication, uses empirical data or benchmarking to evaluate technical trade-offs, actively listens to colleagues, fosters psychological safety, and aligns the team around client value and project milestones.',
        keywords: ['collaboration', 'active listening', 'data-driven', 'trade-offs', 'alignment', 'empathy', 'consensus', 'deliverables'],
        maxScore: 10
      }
    ];

    await Interview.create({
      _id: 'int_fullstack_2026',
      title: 'Full-Stack Software Engineer Evaluation',
      jobRole: 'Full-Stack Software Engineer',
      description: 'Comprehensive technical and behavioral evaluation covering Node.js concurrency, relational schema normalization, networking, operating systems, data structures, and collaboration.',
      duration: 30,
      difficulty: 'Intermediate',
      questions: defaultQuestions,
      createdBy: 'System Administrator'
    });
    console.log('[Reset] Base interview template initialized: Full-Stack Software Engineer Evaluation');
  }

  console.log('[Reset] Database successfully sanitized and ready for maintaining new user accounts.');
}

if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('[Reset] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Reset Error]:', err);
      process.exit(1);
    });
}

module.exports = resetDatabase;
