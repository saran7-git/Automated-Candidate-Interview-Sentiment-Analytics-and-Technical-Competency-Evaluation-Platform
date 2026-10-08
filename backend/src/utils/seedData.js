const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const InterviewSession = require('../models/InterviewSession');
const Response = require('../models/Response');
const Evaluation = require('../models/Evaluation');
const FinalReport = require('../models/FinalReport');
const { runAiEvaluation, aggregateSessionEvaluation } = require('../ai/aiPipeline');

async function seed() {
  console.log('[Seed] Initializing database connection...');
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany({});
  await Candidate.deleteMany({});
  await Interview.deleteMany({});
  await InterviewSession.deleteMany({});
  await Response.deleteMany({});
  await Evaluation.deleteMany({});
  await FinalReport.deleteMany({});

  console.log('[Seed] Creating demo users...');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const candPass = await bcrypt.hash('Candidate@123', salt);

  const admin = await User.create({
    name: 'Dr. Sarah Jenkins (Head of Talent)',
    email: 'admin@interview.ai',
    passwordHash: adminPass,
    role: 'admin'
  });

  // 10+ Comprehensive Questions across all 8 required categories
  const questionsBank = [
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
    },
    {
      _id: 'q_aiml_1',
      question: 'What is the attention mechanism in Transformer models and why is it superior to recurrent architectures for sequential data?',
      category: 'AI/ML',
      difficulty: 'Hard',
      expectedAnswer: 'The attention mechanism calculates dynamic attention weights using Query, Key, and Value matrices (Scaled Dot-Product Attention) to model relationships between all tokens regardless of distance. Unlike RNNs or LSTMs, Transformers allow full parallelization during training and avoid vanishing gradient degradation over long sequences.',
      keywords: ['attention mechanism', 'query key value', 'dot product', 'parallelization', 'vanishing gradient', 'long sequences', 'transformers'],
      maxScore: 10
    },
    {
      _id: 'q_gen_1',
      question: 'What is the difference between monolithic architecture and microservices, and how do you manage distributed transactions?',
      category: 'General Technical',
      difficulty: 'Hard',
      expectedAnswer: 'A monolith bundles all modules in a single deployment unit, which is simple initially but difficult to scale independently. Microservices decouple domains into autonomous services communicating via REST or message brokers. Distributed transactions cannot use 2PC effectively across services and instead use the Saga Pattern (choreography or orchestration) with compensating transactions to ensure eventual consistency.',
      keywords: ['monolith', 'microservices', 'distributed transactions', 'saga pattern', 'compensating transactions', 'eventual consistency', 'message brokers'],
      maxScore: 10
    }
  ];

  console.log('[Seed] Creating Interview Templates...');
  const interview1 = await Interview.create({
    _id: 'int_fullstack_2026',
    title: 'Full-Stack Software Engineer Evaluation',
    jobRole: 'Senior Full-Stack Engineer',
    description: 'Comprehensive technical and behavioral evaluation covering Node.js concurrency, relational schema normalization, networking, operating systems, hash tables, and collaborative engineering practices.',
    duration: 35,
    difficulty: 'Intermediate',
    questions: questionsBank.slice(0, 6),
    createdBy: admin.name
  });

  const interview2 = await Interview.create({
    _id: 'int_aiml_cloud_2026',
    title: 'AI & Cloud Distributed Systems Engineer Assessment',
    jobRole: 'AI & Cloud Infrastructure Engineer',
    description: 'High-level architectural assessment evaluating Transformer attention mechanisms, microservices distributed transactions, DBMS scalability, and operating systems memory models.',
    duration: 40,
    difficulty: 'Advanced',
    questions: [questionsBank[6], questionsBank[7], questionsBank[1], questionsBank[2], questionsBank[3]],
    createdBy: admin.name
  });

  console.log('[Seed] Creating 5 realistic candidates...');
  const candidatesData = [
    {
      name: 'Alex Rivera',
      email: 'alex@interview.ai',
      phone: '+1 (555) 234-5678',
      skills: ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'System Design'],
      resume: 'Senior engineer with 5 years experience scaling web services.'
    },
    {
      name: 'Priya Sharma',
      email: 'candidate@interview.ai',
      phone: '+1 (555) 876-5432',
      skills: ['Distributed Systems', 'Python', 'Go', 'Docker', 'Kubernetes'],
      resume: 'Cloud backend specialist with expertise in low-latency APIs.'
    },
    {
      name: 'Marcus Chen',
      email: 'marcus@interview.ai',
      phone: '+1 (555) 345-6789',
      skills: ['Machine Learning', 'PyTorch', 'FastAPI', 'Data Pipelines'],
      resume: 'Applied AI engineer focusing on LLM deployments and embeddings.'
    },
    {
      name: 'Jordan Taylor',
      email: 'jordan@interview.ai',
      phone: '+1 (555) 456-7890',
      skills: ['Frontend Architecture', 'TypeScript', 'CSS/Tailwind', 'Next.js'],
      resume: 'Junior-to-mid fullstack developer enthusiastic about UI/UX performance.'
    },
    {
      name: 'Samira Khan',
      email: 'samira@interview.ai',
      phone: '+1 (555) 567-8901',
      skills: ['DevOps', 'CI/CD', 'AWS', 'Terraform', 'Observability'],
      resume: 'Infrastructure architect passionate about zero-downtime rollouts.'
    }
  ];

  const candidateDocs = [];
  for (const c of candidatesData) {
    const user = await User.create({
      name: c.name,
      email: c.email,
      passwordHash: candPass,
      role: 'candidate'
    });
    const cand = await Candidate.create({
      userId: user._id || user.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      skills: c.skills,
      resume: c.resume
    });
    candidateDocs.push(cand);
  }

  // Pre-seed responses for Alex Rivera (Interview 1 - Completed, High Score, Positive Sentiment)
  console.log('[Seed] Generating interview responses and AI evaluations for Alex Rivera...');
  const sessionAlex = await InterviewSession.create({
    _id: 'sess_alex_01',
    candidateId: candidateDocs[0]._id || candidateDocs[0].id,
    interviewId: interview1._id || interview1.id,
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  });

  const alexAnswers = [
    {
      qId: 'q_prog_1',
      ans: 'I have successfully built and optimized high-performance Node.js microservices. The event loop coordinates non-blocking asynchronous operations via libuv on a single thread. It seamlessly progresses through timers, poll, and check (setImmediate) phases. Microtasks such as Promise resolutions execute immediately, allowing us to achieve excellent throughput and scalable performance.'
    },
    {
      qId: 'q_db_1',
      ans: 'I am passionate about solid schema design! Database normalization is an essential, highly effective best practice to eliminate data redundancy and prevent update anomalies. In 1NF we guarantee atomic values and unique keys. In 2NF we eliminate partial dependency, and in 3NF we remove transitive dependencies. This keeps our database remarkably clean and robust.'
    },
    {
      qId: 'q_net_1',
      ans: 'I love networking architecture. When an HTTPS request begins, the browser performs DNS resolution to obtain the server IP address, followed by a TCP three-way handshake (SYN, SYN-ACK, ACK). Next, the TLS handshake securely verifies certificates and negotiates symmetric keys, enabling encrypted and reliable communication over port 443.'
    },
    {
      qId: 'q_os_1',
      ans: 'A process is an isolated execution environment with dedicated virtual memory and descriptors. A thread is a lightweight unit of execution within a process that shares the memory heap. Context switching requires saving CPU registers and program counter into the PCB or TCB, which causes cache overhead.'
    },
    {
      qId: 'q_ds_1',
      ans: 'Hash Tables are one of my favorite data structures for fast O(1) lookups! They map keys to buckets using a hash function. Collisions are handled gracefully using separate chaining with linked lists or open addressing with linear probing.'
    },
    {
      qId: 'q_hr_1',
      ans: 'I believe strongly in collaborative problem-solving. In our team, when we disagreed on whether to use GraphQL versus REST, I organized a constructive spike session where we benchmarked both against our payload sizes and network latency. By relying on empirical metrics, empathetic listening, and enthusiastic team discussion, we built consensus effortlessly.'
    }
  ];

  const alexEvaluations = [];
  for (const item of alexAnswers) {
    const qDef = questionsBank.find(q => q._id === item.qId);
    const resp = await Response.create({
      sessionId: sessionAlex._id || sessionAlex.id,
      questionId: item.qId,
      candidateId: candidateDocs[0]._id || candidateDocs[0].id,
      candidateAnswer: item.ans,
      questionCategory: qDef.category,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords
    });

    const aiEval = await runAiEvaluation({
      candidateAnswer: item.ans,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords,
      category: qDef.category,
      maxScore: qDef.maxScore
    });

    const ev = await Evaluation.create({
      responseId: resp._id || resp.id,
      sessionId: sessionAlex._id || sessionAlex.id,
      candidateId: candidateDocs[0]._id || candidateDocs[0].id,
      questionId: item.qId,
      questionCategory: qDef.category,
      ...aiEval
    });
    alexEvaluations.push(ev);
  }

  const alexReportAgg = aggregateSessionEvaluation(alexEvaluations);
  await FinalReport.create({
    sessionId: sessionAlex._id || sessionAlex.id,
    candidateId: candidateDocs[0]._id || candidateDocs[0].id,
    interviewId: interview1._id || interview1.id,
    ...alexReportAgg
  });

  // Pre-seed responses for Priya Sharma (Interview 1 - Completed, High Technical, Neutral Sentiment)
  console.log('[Seed] Generating interview responses and AI evaluations for Priya Sharma...');
  const sessionPriya = await InterviewSession.create({
    _id: 'sess_priya_02',
    candidateId: candidateDocs[1]._id || candidateDocs[1].id,
    interviewId: interview1._id || interview1.id,
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  });

  const priyaAnswers = [
    {
      qId: 'q_prog_1',
      ans: 'The event loop relies on libuv to process I/O asynchronously on a single thread. It iterates through timers, poll phase, and check phase. Promises are queued as microtasks.'
    },
    {
      qId: 'q_db_1',
      ans: 'Database normalization reduces duplicate records and update anomalies. 1NF guarantees atomic values. 2NF removes partial dependency. 3NF eliminates transitive dependencies between non-primary key columns.'
    },
    {
      qId: 'q_net_1',
      ans: 'The client resolves DNS, completes TCP SYN/ACK handshake, performs TLS certificate exchange and session key agreement, then sends HTTP requests over port 443 with encryption.'
    },
    {
      qId: 'q_os_1',
      ans: 'Processes have private address space, while threads share heap and memory inside the same process. Context switching saves register states to PCB or TCB with cache invalidation overhead.'
    },
    {
      qId: 'q_ds_1',
      ans: 'Hash tables map keys using hash functions. Collisions are handled by separate chaining with linked lists or open addressing with linear probing.'
    },
    {
      qId: 'q_hr_1',
      ans: 'I handle disagreements by examining the technical requirements and architecture specifications. We review system trade-offs objectively to pick the most reliable solution.'
    }
  ];

  const priyaEvaluations = [];
  for (const item of priyaAnswers) {
    const qDef = questionsBank.find(q => q._id === item.qId);
    const resp = await Response.create({
      sessionId: sessionPriya._id || sessionPriya.id,
      questionId: item.qId,
      candidateId: candidateDocs[1]._id || candidateDocs[1].id,
      candidateAnswer: item.ans,
      questionCategory: qDef.category,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords
    });

    const aiEval = await runAiEvaluation({
      candidateAnswer: item.ans,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords,
      category: qDef.category,
      maxScore: qDef.maxScore
    });

    const ev = await Evaluation.create({
      responseId: resp._id || resp.id,
      sessionId: sessionPriya._id || sessionPriya.id,
      candidateId: candidateDocs[1]._id || candidateDocs[1].id,
      questionId: item.qId,
      questionCategory: qDef.category,
      ...aiEval
    });
    priyaEvaluations.push(ev);
  }

  const priyaReportAgg = aggregateSessionEvaluation(priyaEvaluations);
  await FinalReport.create({
    sessionId: sessionPriya._id || sessionPriya.id,
    candidateId: candidateDocs[1]._id || candidateDocs[1].id,
    interviewId: interview1._id || interview1.id,
    ...priyaReportAgg
  });

  // Pre-seed responses for Marcus Chen (Interview 2 - Completed, Moderate Technical, Positive)
  console.log('[Seed] Generating interview responses and AI evaluations for Marcus Chen...');
  const sessionMarcus = await InterviewSession.create({
    _id: 'sess_marcus_03',
    candidateId: candidateDocs[2]._id || candidateDocs[2].id,
    interviewId: interview2._id || interview2.id,
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 7).toISOString()
  });

  const marcusAnswers = [
    {
      qId: 'q_aiml_1',
      ans: 'I am extremely enthusiastic about Transformers! The attention mechanism dynamically calculates attention weights via Query, Key, and Value matrices using scaled dot product. It enables complete parallelization during training, avoiding the sequential bottleneck of RNNs and preventing vanishing gradient degradation.'
    },
    {
      qId: 'q_gen_1',
      ans: 'Monoliths are single units whereas microservices are distributed. We use Saga pattern and compensating transactions for distributed transactions to achieve eventual consistency across services.'
    },
    {
      qId: 'q_db_1',
      ans: 'Normalization organizes tables to prevent redundancy and anomalies. 1NF has atomic columns, 2NF removes partial keys, and 3NF handles transitive dependency.'
    },
    {
      qId: 'q_net_1',
      ans: 'HTTPS involves DNS lookup, standard TCP handshake, and TLS negotiation with certificate validation before sending encrypted payloads.'
    },
    {
      qId: 'q_os_1',
      ans: 'Processes have separate memory, whereas threads share the process heap. Context switching switches execution context with CPU state saving in PCB.'
    }
  ];

  const marcusEvaluations = [];
  for (const item of marcusAnswers) {
    const qDef = questionsBank.find(q => q._id === item.qId);
    const resp = await Response.create({
      sessionId: sessionMarcus._id || sessionMarcus.id,
      questionId: item.qId,
      candidateId: candidateDocs[2]._id || candidateDocs[2].id,
      candidateAnswer: item.ans,
      questionCategory: qDef.category,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords
    });

    const aiEval = await runAiEvaluation({
      candidateAnswer: item.ans,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords,
      category: qDef.category,
      maxScore: qDef.maxScore
    });

    const ev = await Evaluation.create({
      responseId: resp._id || resp.id,
      sessionId: sessionMarcus._id || sessionMarcus.id,
      candidateId: candidateDocs[2]._id || candidateDocs[2].id,
      questionId: item.qId,
      questionCategory: qDef.category,
      ...aiEval
    });
    marcusEvaluations.push(ev);
  }

  const marcusReportAgg = aggregateSessionEvaluation(marcusEvaluations);
  await FinalReport.create({
    sessionId: sessionMarcus._id || sessionMarcus.id,
    candidateId: candidateDocs[2]._id || candidateDocs[2].id,
    interviewId: interview2._id || interview2.id,
    ...marcusReportAgg
  });

  // Candidate 4 (Jordan Taylor) - Completed Session with some negative/struggling sentiment
  console.log('[Seed] Generating interview responses and AI evaluations for Jordan Taylor (average/struggling candidate)...');
  const sessionJordan = await InterviewSession.create({
    _id: 'sess_jordan_04',
    candidateId: candidateDocs[3]._id || candidateDocs[3].id,
    interviewId: interview1._id || interview1.id,
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 11).toISOString()
  });

  const jordanAnswers = [
    {
      qId: 'q_prog_1',
      ans: 'The event loop runs on a single thread and processes asynchronous callbacks using phases like timers and poll.'
    },
    {
      qId: 'q_db_1',
      ans: 'Normalization is about organizing database tables to reduce duplicate data and avoid anomalies.'
    },
    {
      qId: 'q_net_1',
      ans: 'I always struggled with SSL handshakes. Networking protocols are very confusing and difficult to understand when requests fail without clear logs.'
    },
    {
      qId: 'q_os_1',
      ans: 'Threads run inside processes. I got stuck trying to understand thread context switching overhead because the documentation was terrible.'
    },
    {
      qId: 'q_ds_1',
      ans: 'Hash tables use keys and buckets. Collisions can be solved by chaining.'
    },
    {
      qId: 'q_hr_1',
      ans: 'We had a really stressful disagreement in our team. People were frustrated and unwilling to listen, which made the deadline very painful to meet.'
    }
  ];

  const jordanEvaluations = [];
  for (const item of jordanAnswers) {
    const qDef = questionsBank.find(q => q._id === item.qId);
    const resp = await Response.create({
      sessionId: sessionJordan._id || sessionJordan.id,
      questionId: item.qId,
      candidateId: candidateDocs[3]._id || candidateDocs[3].id,
      candidateAnswer: item.ans,
      questionCategory: qDef.category,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords
    });

    const aiEval = await runAiEvaluation({
      candidateAnswer: item.ans,
      questionText: qDef.question,
      expectedAnswer: qDef.expectedAnswer,
      keywords: qDef.keywords,
      category: qDef.category,
      maxScore: qDef.maxScore
    });

    const ev = await Evaluation.create({
      responseId: resp._id || resp.id,
      sessionId: sessionJordan._id || sessionJordan.id,
      candidateId: candidateDocs[3]._id || candidateDocs[3].id,
      questionId: item.qId,
      questionCategory: qDef.category,
      ...aiEval
    });
    jordanEvaluations.push(ev);
  }

  const jordanReportAgg = aggregateSessionEvaluation(jordanEvaluations);
  await FinalReport.create({
    sessionId: sessionJordan._id || sessionJordan.id,
    candidateId: candidateDocs[3]._id || candidateDocs[3].id,
    interviewId: interview1._id || interview1.id,
    ...jordanReportAgg
  });



  // Candidate 5 (Samira Khan) - Pending Session
  console.log('[Seed] Setting up Pending session for Samira Khan...');
  await InterviewSession.create({
    _id: 'sess_samira_05',
    candidateId: candidateDocs[4]._id || candidateDocs[4].id,
    interviewId: interview2._id || interview2.id,
    status: 'pending'
  });

  console.log('--------------------------------------------------');
  console.log('[Seed] Database successfully seeded with demo data!');
  console.log('Admin Account:     admin@interview.ai     / Admin@123');
  console.log('Candidate Account: candidate@interview.ai / Candidate@123');
  console.log('Alex Account:      alex@interview.ai      / Candidate@123');
  console.log('5 Candidates, 2 Interviews, 10+ Questions, Multiple Evaluations.');
  console.log('--------------------------------------------------');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

module.exports = seed;
