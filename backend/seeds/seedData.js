import bcrypt from 'bcryptjs';
import { initDB, query } from '../config/db.js';
import {
  aptitudeQuestions,
  logicalReasoningQuestions,
  verbalAbilityQuestions,
  numericalReasoningQuestions,
  codingProblems
} from './assessmentQuestionBank.js';

const questionsData = [
  // 1. REACT
  {
    question: 'What is the Virtual DOM in React and how does reconciliation work?',
    category: 'React',
    skill: 'Virtual DOM & Reconciliation',
    difficulty: 'Medium',
    expected_answer: 'The Virtual DOM is an in-memory representation of the real DOM tree. During reconciliation, React compares new and old virtual DOM trees using a diffing algorithm and batches updates efficiently to the real DOM.',
    expected_concepts: ['virtual dom', 'diffing algorithm', 'reconciliation', 'batching', 'real dom', 'state change'],
    keywords: ['vdom', 'diffing', 'reconciliation', 'render', 'batching', 'tree'],
    max_score: 10,
  },
  {
    question: 'Explain the difference between useEffect dependency arrays and how cleanups prevent memory leaks.',
    category: 'React',
    skill: 'React Hooks',
    difficulty: 'Easy',
    expected_answer: 'useEffect takes a callback and a dependency array. Passing no array runs on every render, empty array runs on mount, and listing dependencies runs when values change. Cleanup functions run on unmount or before the effect re-runs to cancel subscriptions or timers.',
    expected_concepts: ['dependency array', 'cleanup function', 'unmount', 'side effects', 'subscription', 're-render'],
    keywords: ['useeffect', 'cleanup', 'dependency', 'mount', 'unmount', 'hook'],
    max_score: 10,
  },
  {
    question: 'How do useMemo and useCallback optimize React rendering performance and preserve referential equality?',
    category: 'React',
    skill: 'Performance Optimization',
    difficulty: 'Hard',
    expected_answer: 'useMemo memoizes the result of an expensive calculation between re-renders. useCallback memoizes the callback function instance itself to maintain referential identity when passed to memoized child components.',
    expected_concepts: ['memoization', 'expensive calculation', 'referential equality', 'callback caching', 'react.memo'],
    keywords: ['usememo', 'usecallback', 'memoize', 'referential', 're-render', 'performance'],
    max_score: 10,
  },
  {
    question: 'What is the React Context API and what are its trade-offs compared to Redux or Zustand?',
    category: 'React',
    skill: 'State Management',
    difficulty: 'Medium',
    expected_answer: 'Context API solves prop drilling by passing state down the component tree without explicit props. It is ideal for low-frequency global state like themes or user sessions. High-frequency state causes unnecessary re-renders of consumers unless properly split.',
    expected_concepts: ['prop drilling', 'provider', 'usecontext', 'global state', 're-rendering', 'redux'],
    keywords: ['context', 'provider', 'consumer', 'prop drilling', 'state', 're-render'],
    max_score: 10,
  },

  // 2. JAVASCRIPT
  {
    question: 'What are Closures in JavaScript and how do they enable data encapsulation?',
    category: 'JavaScript',
    skill: 'Closures & Scope',
    difficulty: 'Medium',
    expected_answer: 'A closure is a function that retains access to its lexical environment even after the outer function has executed and returned. It enables private variables and factory functions through scope retention.',
    expected_concepts: ['lexical scope', 'outer function', 'inner function', 'preserved variables', 'encapsulation', 'private state'],
    keywords: ['closure', 'scope', 'lexical', 'private', 'function', 'return'],
    max_score: 10,
  },
  {
    question: 'Explain the difference between let, const, and var regarding scope and the Temporal Dead Zone (TDZ).',
    category: 'JavaScript',
    skill: 'Variables & Hoisting',
    difficulty: 'Easy',
    expected_answer: 'var is function-scoped and hoisted initialized to undefined. let and const are block-scoped and hoisted into a Temporal Dead Zone where accessing them prior to declaration throws a ReferenceError. const prevents variable reassignment.',
    expected_concepts: ['block scope', 'function scope', 'hoisting', 'temporal dead zone', 'tdz', 'reassignment'],
    keywords: ['var', 'let', 'const', 'hoisting', 'scope', 'tdz'],
    max_score: 10,
  },
  {
    question: 'How does the JavaScript Event Loop handle the Call Stack, Microtask Queue, and Macrotask Queue?',
    category: 'JavaScript',
    skill: 'Event Loop & Concurrency',
    difficulty: 'Hard',
    expected_answer: 'JavaScript executes synchronous code on the call stack. Asynchronous callbacks are scheduled in queues. The event loop prioritizes and exhausts all Microtasks (Promises, queueMicrotask) before picking the next Macrotask (setTimeout, setInterval).',
    expected_concepts: ['call stack', 'microtask queue', 'macrotask queue', 'promises', 'settimeout', 'event loop tick', 'non-blocking'],
    keywords: ['call stack', 'microtask', 'macrotask', 'event loop', 'promise', 'async'],
    max_score: 10,
  },
  {
    question: 'What is Prototypal Inheritance in JavaScript and how does the prototype chain lookup work?',
    category: 'JavaScript',
    skill: 'Prototypes & OOP',
    difficulty: 'Medium',
    expected_answer: 'Objects in JavaScript have an internal reference [[Prototype]] or __proto__. When accessing a property not present on the object, the engine searches upwards along the prototype chain until found or null is reached.',
    expected_concepts: ['prototype object', '__proto__', 'prototype chain', 'inheritance', 'object.create', 'null'],
    keywords: ['prototype', 'chain', '__proto__', 'inheritance', 'lookup'],
    max_score: 10,
  },

  // 3. NODE.JS
  {
    question: 'Explain Node.js architecture and how non-blocking I/O is handled using libuv and the thread pool.',
    category: 'Node.js',
    skill: 'Node.js Internals',
    difficulty: 'Hard',
    expected_answer: 'Node.js combines Google V8 engine with the libuv C library. While the main JavaScript thread runs on a single event loop, libuv offloads blocking file system, DNS, and crypto operations to an internal multi-threaded worker pool.',
    expected_concepts: ['single threaded', 'libuv', 'thread pool', 'non-blocking io', 'v8 engine', 'event loop'],
    keywords: ['libuv', 'thread pool', 'v8', 'event loop', 'non-blocking', 'async'],
    max_score: 10,
  },
  {
    question: 'What are Streams and Buffers in Node.js and why are they used for handling large data chunks?',
    category: 'Node.js',
    skill: 'Streams & Buffers',
    difficulty: 'Medium',
    expected_answer: 'Streams process continuous data chunk-by-chunk without loading full datasets into RAM, preventing memory spikes. Buffers represent fixed-length raw binary memory allocated outside the V8 heap.',
    expected_concepts: ['chunked data', 'readable', 'writable', 'backpressure', 'binary memory', 'memory efficiency'],
    keywords: ['stream', 'buffer', 'chunk', 'pipe', 'backpressure', 'binary'],
    max_score: 10,
  },
  {
    question: 'How does Express middleware execute and what is the role of the next() function in error handling?',
    category: 'Node.js',
    skill: 'Express Middleware',
    difficulty: 'Easy',
    expected_answer: 'Middleware functions intercept HTTP requests and responses. Calling next() passes control to the next middleware in the pipeline. Passing an argument like next(err) jumps directly to the four-parameter centralized error middleware.',
    expected_concepts: ['request object', 'response object', 'next function', 'middleware pipeline', 'error handler', 'interceptor'],
    keywords: ['middleware', 'req', 'res', 'next', 'pipeline', 'error'],
    max_score: 10,
  },

  // 4. SQL
  {
    question: 'Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN in SQL.',
    category: 'SQL',
    skill: 'SQL Joins',
    difficulty: 'Easy',
    expected_answer: 'INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from the left table and matched right rows. RIGHT JOIN returns all from the right table. FULL OUTER JOIN returns all rows from both tables, filling nulls where keys do not match.',
    expected_concepts: ['inner join', 'left join', 'right join', 'full outer join', 'null values', 'foreign key match'],
    keywords: ['join', 'inner', 'left', 'right', 'outer', 'foreign key'],
    max_score: 10,
  },
  {
    question: 'What is Database Indexing and how does a B-Tree index accelerate query lookups?',
    category: 'SQL',
    skill: 'Indexing & Performance',
    difficulty: 'Medium',
    expected_answer: 'An index is a balanced B-Tree search data structure maintained on table columns. Instead of performing an O(N) full table scan, queries locate matching record pointers in logarithmic O(log N) disk operations.',
    expected_concepts: ['b-tree', 'binary search', 'full table scan', 'lookup speed', 'logarithmic search', 'disk io'],
    keywords: ['index', 'b-tree', 'table scan', 'lookup', 'performance', 'query'],
    max_score: 10,
  },
  {
    question: 'Explain ACID properties in database transactions and how commit/rollback ensure data consistency.',
    category: 'SQL',
    skill: 'Transactions & ACID',
    difficulty: 'Medium',
    expected_answer: 'ACID guarantees Atomicity (all-or-nothing operations), Consistency (enforces table schema and constraints), Isolation (concurrent transactions execute independently), and Durability (committed data survives crashes).',
    expected_concepts: ['atomicity', 'consistency', 'isolation', 'durability', 'commit', 'rollback', 'transaction'],
    keywords: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'commit', 'rollback'],
    max_score: 10,
  },

  // 5. DBMS
  {
    question: 'What is Database Normalization and how do 1NF, 2NF, and 3NF eliminate update anomalies?',
    category: 'DBMS',
    skill: 'Database Normalization',
    difficulty: 'Hard',
    expected_answer: 'Normalization decomposes tables to eliminate data redundancy. 1NF enforces atomic attribute values, 2NF eliminates partial dependencies on composite keys, and 3NF removes transitive dependencies where non-key columns depend on other non-key columns.',
    expected_concepts: ['first normal form', 'second normal form', 'third normal form', 'atomic values', 'partial dependency', 'transitive dependency', 'redundancy'],
    keywords: ['normalization', '1nf', '2nf', '3nf', 'redundancy', 'dependency', 'primary key'],
    max_score: 10,
  },
  {
    question: 'What is the difference between Clustered and Non-Clustered Indexes in relational DBMS?',
    category: 'DBMS',
    skill: 'Index Architecture',
    difficulty: 'Medium',
    expected_answer: 'A clustered index physically sorts and stores data rows on disk, meaning a table can only have one clustered index (typically Primary Key). Non-clustered indexes store sorted key values with pointers to physical data row addresses.',
    expected_concepts: ['clustered index', 'non clustered index', 'physical data order', 'pointer reference', 'primary key'],
    keywords: ['clustered', 'non-clustered', 'index', 'physical', 'pointer', 'row'],
    max_score: 10,
  },
  {
    question: 'Explain Concurrency Control in DBMS and the Two-Phase Locking (2PL) protocol.',
    category: 'DBMS',
    skill: 'Concurrency & Locking',
    difficulty: 'Hard',
    expected_answer: 'Concurrency control ensures serializability among parallel transactions. Two-Phase Locking consists of a Growing Phase (locks acquired, none released) and a Shrinking Phase (locks released, none acquired) to prevent dirty reads and cascading aborts.',
    expected_concepts: ['concurrency control', 'serializability', 'two phase locking', 'growing phase', 'shrinking phase', 'shared lock', 'exclusive lock'],
    keywords: ['2pl', 'locking', 'concurrency', 'serializable', 'lock', 'transaction'],
    max_score: 10,
  },

  // 6. DATA STRUCTURES
  {
    question: 'Explain the working of a Hash Table, hash functions, and collision resolution techniques.',
    category: 'Data Structures',
    skill: 'Hash Tables',
    difficulty: 'Medium',
    expected_answer: 'A hash table maps keys to array bucket indices using a hash function with O(1) average time complexity. Collisions occur when multiple keys hash to the same index, resolved via Chaining (linked lists) or Open Addressing (linear/quadratic probing).',
    expected_concepts: ['hash function', 'constant time', 'collision resolution', 'chaining', 'open addressing', 'linear probing', 'bucket'],
    keywords: ['hash table', 'hash function', 'collision', 'chaining', 'probing', 'o(1)'],
    max_score: 10,
  },
  {
    question: 'What is a Balanced Binary Search Tree (AVL / Red-Black Tree) and why is tree rotation needed?',
    category: 'Data Structures',
    skill: 'Trees & Rotations',
    difficulty: 'Hard',
    expected_answer: 'In an unbalanced BST, lookups can degrade to O(N). Self-balancing trees (AVL, Red-Black) maintain tree height bounded at O(log N) through left and right tree rotations triggered whenever balance factors or color invariant properties are violated.',
    expected_concepts: ['binary search tree', 'self balancing', 'tree rotation', 'height balance', 'logarithmic time', 'red black tree'],
    keywords: ['bst', 'avl', 'red-black', 'rotation', 'balance', 'height', 'o(log n)'],
    max_score: 10,
  },
  {
    question: 'Compare Arrays and Singly Linked Lists regarding memory layout and access vs insertion complexity.',
    category: 'Data Structures',
    skill: 'Linear Structures',
    difficulty: 'Easy',
    expected_answer: 'Arrays store elements in contiguous memory enabling instant O(1) random index access but costly O(N) mid-array insertion. Linked lists store nodes with pointer references non-contiguously, enabling O(1) insertions at known nodes but O(N) sequential search.',
    expected_concepts: ['contiguous memory', 'random access', 'pointer reference', 'time complexity', 'insertion', 'index lookup'],
    keywords: ['array', 'linked list', 'contiguous', 'pointer', 'insertion', 'access'],
    max_score: 10,
  },

  // 7. OOP
  {
    question: 'Explain the four core principles of Object-Oriented Programming (OOP) with real-world examples.',
    category: 'OOP',
    skill: 'OOP Principles',
    difficulty: 'Easy',
    expected_answer: 'The four principles are Encapsulation (bundling state and methods with private access control), Abstraction (hiding implementation complexity), Inheritance (reusing code through parent classes), and Polymorphism (methods behaving differently based on object type).',
    expected_concepts: ['encapsulation', 'abstraction', 'inheritance', 'polymorphism', 'private fields', 'method overriding'],
    keywords: ['encapsulation', 'abstraction', 'inheritance', 'polymorphism', 'class', 'object'],
    max_score: 10,
  },
  {
    question: 'What are the SOLID design principles in software engineering?',
    category: 'OOP',
    skill: 'SOLID Principles',
    difficulty: 'Hard',
    expected_answer: 'SOLID stands for Single Responsibility, Open/Closed (open for extension, closed for modification), Liskov Substitution, Interface Segregation (small focused interfaces), and Dependency Inversion (rely on abstractions, not concretions).',
    expected_concepts: ['single responsibility', 'open closed', 'liskov substitution', 'interface segregation', 'dependency inversion', 'abstraction'],
    keywords: ['solid', 'responsibility', 'liskov', 'interface', 'dependency', 'design patterns'],
    max_score: 10,
  },

  // 8. OPERATING SYSTEMS
  {
    question: 'What is the difference between a Process and a Thread, and how does Context Switching work?',
    category: 'Operating Systems',
    skill: 'Processes & Threads',
    difficulty: 'Medium',
    expected_answer: 'A process is an executing program with its own dedicated virtual address space and resources. Threads are lightweight execution paths sharing the parent process address space. Context switching saves CPU register state and program counter to switch execution.',
    expected_concepts: ['address space', 'lightweight thread', 'shared memory', 'context switch', 'pcb', 'register state'],
    keywords: ['process', 'thread', 'context switch', 'memory', 'pcb', 'registers'],
    max_score: 10,
  },
  {
    question: 'What is a Deadlock and what are the four Coffman conditions necessary for a deadlock to occur?',
    category: 'Operating Systems',
    skill: 'Deadlocks & Synchronization',
    difficulty: 'Hard',
    expected_answer: 'A deadlock is a state where processes are blocked waiting for resources held by each other. The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
    expected_concepts: ['mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'resource contention', 'blocked process'],
    keywords: ['deadlock', 'coffman', 'mutual exclusion', 'circular wait', 'resources', 'preemption'],
    max_score: 10,
  },

  // 9. PYTHON
  {
    question: 'What is the Python Global Interpreter Lock (GIL) and how does it impact multi-threaded CPU tasks?',
    category: 'Python',
    skill: 'Python GIL & Concurrency',
    difficulty: 'Hard',
    expected_answer: 'The GIL is a mutex in CPython allowing only one native thread to execute Python bytecode at any instant. While I/O-bound tasks benefit from threading, CPU-bound computations require the multiprocessing module for true parallel core utilization.',
    expected_concepts: ['gil', 'cpython', 'single native thread', 'cpu bound', 'multiprocessing', 'concurrency'],
    keywords: ['gil', 'thread', 'multiprocessing', 'cpython', 'interpreter', 'cpu'],
    max_score: 10,
  },
  {
    question: 'Explain Python Generators, the yield keyword, and memory efficiency in iterators.',
    category: 'Python',
    skill: 'Generators & Iteration',
    difficulty: 'Easy',
    expected_answer: 'Generators return an iterator that yields one value at a time on-demand (lazy evaluation), maintaining local state without generating entire lists in memory, ensuring O(1) memory consumption.',
    expected_concepts: ['lazy evaluation', 'yield keyword', 'iterator protocol', 'memory efficient', 'on demand'],
    keywords: ['generator', 'yield', 'lazy', 'iterator', 'memory'],
    max_score: 10,
  },

  // 10. JAVA
  {
    question: 'How does Garbage Collection in Java work and what are the memory regions in the JVM Heap?',
    category: 'Java',
    skill: 'JVM & Garbage Collection',
    difficulty: 'Hard',
    expected_answer: 'The JVM heap is split into Young Generation (Eden, Survivor spaces) for short-lived allocations and Old (Tenured) Generation for enduring objects. Minor GC cleans Eden, while Major GC runs Mark-Sweep compaction on the Old generation.',
    expected_concepts: ['young generation', 'eden space', 'survivor space', 'old generation', 'mark and sweep', 'jvm heap'],
    keywords: ['garbage collection', 'jvm', 'heap', 'eden', 'tenured', 'mark sweep'],
    max_score: 10,
  },
  {
    question: 'What is the difference between an Interface and an Abstract Class in Java 8+?',
    category: 'Java',
    skill: 'Java Architecture',
    difficulty: 'Easy',
    expected_answer: 'Abstract classes can maintain state with instance variables and constructor initializers. Classes can only extend one abstract class, but can implement multiple interfaces which define capability contracts and optional default methods.',
    expected_concepts: ['multiple inheritance', 'instance variables', 'abstract methods', 'default methods', 'implements', 'extends'],
    keywords: ['interface', 'abstract class', 'extends', 'implements', 'default'],
    max_score: 10,
  },

  // 11. ALGORITHMS
  {
    question: 'How does QuickSort choose pivot elements and why is its average time complexity O(N log N)?',
    category: 'Algorithms',
    skill: 'Divide & Conquer',
    difficulty: 'Medium',
    expected_answer: 'QuickSort partitions an array around a chosen pivot element, placing smaller elements on the left and larger on the right. In the average case, partitions are balanced, resulting in a recurrence tree of depth log N with O(N) work per level, yielding O(N log N) average complexity.',
    expected_concepts: ['partitioning', 'pivot element', 'divide and conquer', 'logarithmic depth', 'average time complexity', 'recursion'],
    keywords: ['quicksort', 'pivot', 'partition', 'divide and conquer', 'o(n log n)', 'recursion'],
    max_score: 10,
  },
  {
    question: 'Explain Dijkstra algorithm for single-source shortest paths on weighted graphs.',
    category: 'Algorithms',
    skill: 'Graph Algorithms',
    difficulty: 'Hard',
    expected_answer: 'Dijkstra algorithm uses a greedy approach and a min-priority queue (min-heap) to iteratively select the unvisited vertex with the minimum tentative distance, relaxing adjacent edges until all shortest paths are resolved. It works on non-negative edge weights.',
    expected_concepts: ['priority queue', 'min heap', 'greedy algorithm', 'edge relaxation', 'shortest path', 'non negative weights'],
    keywords: ['dijkstra', 'shortest path', 'graph', 'min heap', 'relaxation', 'greedy'],
    max_score: 10,
  },
  {
    question: 'What is Dynamic Programming (DP) and how do Memoization (Top-Down) and Tabulation (Bottom-Up) differ?',
    category: 'Algorithms',
    skill: 'Dynamic Programming',
    difficulty: 'Medium',
    expected_answer: 'Dynamic Programming solves optimization problems by breaking them into overlapping subproblems with optimal substructure. Memoization stores recursive subproblem results in a cache on-demand, whereas Tabulation iteratively builds a lookup table starting from base cases.',
    expected_concepts: ['overlapping subproblems', 'optimal substructure', 'memoization', 'tabulation', 'bottom up', 'top down cache'],
    keywords: ['dynamic programming', 'dp', 'memoization', 'tabulation', 'subproblem', 'cache'],
    max_score: 10,
  },

  // 12. COMPUTER NETWORKS
  {
    question: 'Explain the TCP 3-Way Handshake and 4-Way Termination process.',
    category: 'Computer Networks',
    skill: 'Transport Layer Protocols',
    difficulty: 'Medium',
    expected_answer: 'Connection establishment uses SYN (Client), SYN-ACK (Server), and ACK (Client) packets to synchronize sequence numbers. Termination uses FIN (initiator), ACK (receiver), FIN (receiver), and ACK (initiator) to gracefully close bidirectional data streams.',
    expected_concepts: ['syn', 'syn ack', 'ack', 'fin', 'sequence numbers', 'connection oriented', 'graceful termination'],
    keywords: ['tcp', 'handshake', 'syn', 'ack', 'fin', 'transport layer', 'packet'],
    max_score: 10,
  },
  {
    question: 'What is the difference between TCP and UDP, and when is UDP preferred?',
    category: 'Computer Networks',
    skill: 'Network Protocols',
    difficulty: 'Easy',
    expected_answer: 'TCP is connection-oriented, reliable, orders packets, and provides congestion/flow control. UDP is connectionless, lightweight, and transmits packets without guarantees or handshakes, making it ideal for low-latency streaming, VoIP, and gaming.',
    expected_concepts: ['connection oriented', 'connectionless', 'reliability', 'packet ordering', 'flow control', 'low latency', 'udp streaming'],
    keywords: ['tcp', 'udp', 'connectionless', 'reliable', 'packet', 'latency'],
    max_score: 10,
  },
  {
    question: 'How does DNS Resolution work when a user types a URL into a web browser?',
    category: 'Computer Networks',
    skill: 'Application Layer & DNS',
    difficulty: 'Medium',
    expected_answer: 'The browser checks local cache, then queries the Recursive Resolver, which contacts Root Name Servers, TLD Servers (.com), and Authoritative Name Servers in sequence to resolve domain names to IP addresses, which are then cached.',
    expected_concepts: ['recursive resolver', 'root name server', 'tld server', 'authoritative server', 'ip address lookup', 'dns cache'],
    keywords: ['dns', 'resolver', 'root server', 'tld', 'ip address', 'domain', 'cache'],
    max_score: 10,
  },

  // 13. C / C++
  {
    question: 'Explain Pointers, References, and Dynamic Memory Allocation (new/delete vs malloc/free) in C/C++.',
    category: 'C/C++',
    skill: 'Pointers & Memory',
    difficulty: 'Medium',
    expected_answer: 'Pointers store memory addresses and can be reassigned or set to null. References are aliases that cannot be reseated. malloc/free allocate raw bytes without calling constructors, whereas new/delete allocate memory and invoke object constructors/destructors.',
    expected_concepts: ['memory address', 'dereference', 'constructor invocation', 'heap allocation', 'memory leak', 'malloc vs new'],
    keywords: ['pointer', 'reference', 'malloc', 'free', 'new', 'delete', 'heap', 'destructor'],
    max_score: 10,
  },
  {
    question: 'What are Smart Pointers in C++11 (unique_ptr, shared_ptr, weak_ptr) and how do they implement RAII?',
    category: 'C/C++',
    skill: 'Modern C++ & RAII',
    difficulty: 'Hard',
    expected_answer: 'Smart pointers encapsulate raw pointer ownership following Resource Acquisition Is Initialization (RAII). unique_ptr manages exclusive ownership, shared_ptr manages reference-counted shared ownership, and weak_ptr provides non-owning references preventing cyclic reference leaks.',
    expected_concepts: ['raii', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'reference counting', 'cyclic dependency', 'automatic deallocation'],
    keywords: ['smart pointer', 'raii', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'memory management'],
    max_score: 10,
  },
];

export const seedData = async () => {
  try {
    await initDB();
    console.log('[Seed]: Connected to database.');

    // 1. Create Default Admin & Candidate Accounts
    const salt = await bcrypt.genSalt(10);
    const adminPwd = await bcrypt.hash('admin123', salt);
    const recruiterPwd = await bcrypt.hash('recruiter123', salt);
    const candidatePwd = await bcrypt.hash('candidate123', salt);

    // Clear existing tables
    try {
      await query('DELETE FROM proctoring_events');
      await query('DELETE FROM coding_submissions');
      await query('DELETE FROM assessment_answers');
      await query('DELETE FROM assessment_sessions');
      await query('DELETE FROM coding_problems');
      await query('DELETE FROM objective_questions');
      await query('DELETE FROM results');
      await query('DELETE FROM evaluations');
      await query('DELETE FROM answers');
      await query('DELETE FROM interview_questions');
      await query('DELETE FROM interviews');
      await query('DELETE FROM questions');
      await query('DELETE FROM users');
    } catch (e) {
      console.warn('[Seed Table Reset Notice]:', e.message);
    }

    const adminResult = await query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Sarah Jenkins', 'admin@example.com', adminPwd, 'admin']
    );
    const adminId = adminResult.insertId || 1;

    const recruiterResult = await query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Marcus Vance', 'recruiter@example.com', recruiterPwd, 'recruiter']
    );
    const recruiterId = recruiterResult.insertId || 2;

    const candidateResult = await query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Sri Balaji', 'candidate@example.com', candidatePwd, 'candidate']
    );
    const candidateId = candidateResult.insertId || 3;

    console.log(`[Seed]: Created Admin User: admin@example.com / admin123 (ID: ${adminId})`);
    console.log(`[Seed]: Created Recruiter User: recruiter@example.com / recruiter123 (ID: ${recruiterId})`);
    console.log(`[Seed]: Created Candidate User: candidate@example.com / candidate123 (ID: ${candidateId})`);

    // 2. Insert Technical Questions
    for (const q of questionsData) {
      await query(
        `INSERT INTO questions (question, category, skill, difficulty, expected_answer, expected_concepts, keywords, max_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.question,
          q.category,
          q.skill,
          q.difficulty,
          q.expected_answer,
          JSON.stringify(q.expected_concepts),
          JSON.stringify(q.keywords),
          q.max_score,
        ]
      );
    }
    console.log(`[Seed]: Inserted ${questionsData.length} comprehensive technical questions across 10 categories.`);

    // 3. Insert Objective Questions across the 4 sections (80 Questions Total)
    const objectiveSections = [
      { cat: 'aptitude', list: aptitudeQuestions },
      { cat: 'logical_reasoning', list: logicalReasoningQuestions },
      { cat: 'verbal_ability', list: verbalAbilityQuestions },
      { cat: 'numerical_reasoning', list: numericalReasoningQuestions },
    ];

    let totalObjCount = 0;
    for (const sec of objectiveSections) {
      for (const item of sec.list) {
        await query(
          `INSERT INTO objective_questions (category, topic, difficulty, statement, options, correct_option, explanation, marks, negative_marks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sec.cat,
            item.topic,
            item.difficulty,
            item.statement,
            JSON.stringify(item.options),
            item.correct_option,
            item.explanation,
            item.marks || 1,
            0.00
          ]
        );
        totalObjCount++;
      }
    }
    console.log(`[Seed]: Inserted ${totalObjCount} objective questions across Aptitude, Logical Reasoning, Verbal Ability & Numerical Reasoning.`);

    // 4. Insert Coding Problems
    for (const prob of codingProblems) {
      await query(
        `INSERT INTO coding_problems (id, title, difficulty, category, statement, constraints, sample_input, sample_output, sample_test_cases, hidden_test_cases, starter_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prob.id,
          prob.title,
          prob.difficulty,
          prob.category,
          prob.statement,
          prob.constraints,
          prob.sample_input,
          prob.sample_output,
          JSON.stringify(prob.sample_test_cases),
          JSON.stringify(prob.hidden_test_cases),
          JSON.stringify(prob.starter_code)
        ]
      );
    }
    console.log(`[Seed]: Inserted ${codingProblems.length} coding assessment problems.`);

    // 5. Seed Candidate Completed Assessment Sessions (for Sri Balaji)
    const sampleAssessments = [
      { section: 'aptitude', title: 'Aptitude Assessment', score: 18, max: 20, pct: 90, duration: 24 },
      { section: 'logical_reasoning', title: 'Logical Reasoning Assessment', score: 17, max: 20, pct: 85, duration: 26 },
      { section: 'verbal_ability', title: 'Verbal Ability Assessment', score: 19, max: 20, pct: 95, duration: 21 },
      { section: 'numerical_reasoning', title: 'Numerical Reasoning Assessment', score: 16, max: 20, pct: 80, duration: 28 },
      { section: 'coding', title: 'Online Coding Assessment (60 Mins)', score: 20, max: 20, pct: 100, duration: 42 }
    ];

    for (const sa of sampleAssessments) {
      await query(
        `INSERT INTO assessment_sessions (candidate_id, section_type, title, duration_minutes, total_questions, status, started_at, expires_at, completed_at, score, max_score, percentage)
         VALUES (?, ?, ?, ?, ?, 'completed', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY + INTERVAL 30 MINUTE, NOW() - INTERVAL 1 DAY + INTERVAL 25 MINUTE, ?, ?, ?)`,
        [candidateId, sa.section, sa.title, sa.section === 'coding' ? 60 : 30, sa.section === 'coding' ? 2 : 20, sa.score, sa.max, sa.pct]
      );
    }

    // 6. Seed Sample Proctoring Events (Realistic monitoring logs)
    const sampleEvents = [
      { type: 'calibration', sev: 'low', text: 'Microphone and camera hardware baseline calibrated successfully.' },
      { type: 'gaze_away', sev: 'low', text: 'Brief natural head movement away from primary screen (duration: 1.2s).' },
      { type: 'audio_spike', sev: 'low', text: 'Minor transient acoustic level elevation (keyboard typing noise detected).' }
    ];

    for (const ev of sampleEvents) {
      await query(
        `INSERT INTO proctoring_events (session_id, session_type, candidate_id, event_type, severity, details, timestamp)
         VALUES (?, 'interview', ?, ?, ?, ?, NOW() - INTERVAL 1 DAY + INTERVAL 5 MINUTE)`,
        [1, candidateId, ev.type, ev.sev, ev.text]
      );
    }

    // 7. Create Sample Completed & Evaluated Interview for Candidate Sri Balaji
    const reactQuestions = await query("SELECT * FROM questions WHERE category = 'React' LIMIT 5");

    if (reactQuestions && reactQuestions.length > 0) {
      const interviewInsert = await query(
        `INSERT INTO interviews (candidate_id, title, category, difficulty, total_questions, status, started_at, completed_at, duration_seconds)
         VALUES (?, ?, ?, ?, ?, 'evaluated', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 18 MINUTE, 1080)`,
        [candidateId, 'React.js Core Assessment', 'React', 'Medium', reactQuestions.length]
      );
      const sampleInterviewId = interviewInsert.insertId || 1;

      for (let i = 0; i < reactQuestions.length; i++) {
        await query(
          `INSERT INTO interview_questions (interview_id, question_id, order_index) VALUES (?, ?, ?)`,
          [sampleInterviewId, reactQuestions[i].id, i + 1]
        );
      }

      // Sample answers & evaluations
      const sampleAnswers = [
        {
          q: reactQuestions[0],
          text: 'The Virtual DOM is an in-memory representation of the real DOM tree. When state changes occur, React uses its diffing algorithm during reconciliation to batch updates and apply minimal changes to the real DOM efficiently.',
          tech: 90,
          rel: 92,
          sent: 85,
          sentLabel: 'Positive',
          matched: ['virtual dom', 'diffing algorithm', 'reconciliation', 'batching'],
          missing: ['real dom'],
          feedback: 'Exceptional explanation of Virtual DOM and reconciliation pipeline.',
        },
        {
          q: reactQuestions[1],
          text: 'React Hooks must be called at the top level of functional components. useEffect handles side effects and its dependency array dictates when the effect re-runs. An empty dependency array runs once on mount.',
          tech: 88,
          rel: 90,
          sent: 80,
          sentLabel: 'Positive',
          matched: ['dependency array', 'unmount', 'side effects'],
          missing: ['cleanup function'],
          feedback: 'Very clear explanation of hook rules and dependency management.',
        },
        {
          q: reactQuestions[2],
          text: 'useMemo is used for caching expensive computations, while useCallback preserves the referential identity of callback functions across re-renders to prevent unnecessary child re-renders.',
          tech: 85,
          rel: 88,
          sent: 78,
          sentLabel: 'Positive',
          matched: ['memoization', 'expensive calculation', 'referential equality'],
          missing: ['react.memo'],
          feedback: 'Accurate distinction between value memoization and function reference caching.',
        },
        {
          q: reactQuestions[3],
          text: 'The Context API solves prop drilling by providing a global Provider and useContext consumer for values like authentication and application themes.',
          tech: 82,
          rel: 85,
          sent: 70,
          sentLabel: 'Neutral',
          matched: ['prop drilling', 'provider', 'usecontext', 'global state'],
          missing: ['re-rendering'],
          feedback: 'Solid explanation of Context API mechanics.',
        },
      ];

      for (const sa of sampleAnswers) {
        if (!sa.q) continue;
        const ansInsert = await query(
          `INSERT INTO answers (interview_id, question_id, candidate_id, text_answer, time_spent_seconds) VALUES (?, ?, ?, ?, ?)`,
          [sampleInterviewId, sa.q.id, candidateId, sa.text, 120]
        );
        const ansId = ansInsert.insertId || 1;

        await query(
          `INSERT INTO evaluations (answer_id, interview_id, question_id, technical_score, relevance_score, sentiment_score, sentiment_label, matched_concepts, missing_concepts, matched_keywords, feedback)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ansId,
            sampleInterviewId,
            sa.q.id,
            sa.tech,
            sa.rel,
            sa.sent,
            sa.sentLabel,
            JSON.stringify(sa.matched),
            JSON.stringify(sa.missing),
            JSON.stringify(['vdom', 'render']),
            sa.feedback,
          ]
        );
      }

      await query(
        `INSERT INTO results
         (interview_id, candidate_id, overall_score, technical_score, relevance_score, sentiment_score, concept_coverage_score, sentiment_positive_pct, sentiment_neutral_pct, sentiment_negative_pct, strengths, areas_to_improve, recommendation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sampleInterviewId,
          candidateId,
          84,
          86,
          89,
          78,
          81,
          75,
          25,
          0,
          JSON.stringify([
            'Strong understanding of React fundamentals and Virtual DOM reconciliation',
            'Answers are consistently relevant and directly address the prompt',
            'Confident articulation and structured technical vocabulary',
          ]),
          JSON.stringify([
            'Provide more in-depth examples of useEffect cleanup patterns',
            'Include practical re-rendering optimization trade-offs in Context API',
          ]),
          'Strong Performance',
        ]
      );

      console.log(`[Seed]: Created Sample Evaluated Interview (ID: ${sampleInterviewId}) with 84% score.`);
    }

    console.log('========================================================================');
    console.log('  INTERVIEWIQ DATABASE SEEDING COMPLETED!');
    console.log('  Admin Demo:     admin@example.com     / admin123 (Administrator)');
    console.log('  Recruiter Demo: recruiter@example.com / recruiter123 (Recruiter)');
    console.log('  Candidate Demo: candidate@example.com / candidate123 (Candidate)');
    console.log('  80 Objective Assessment Questions Seeded (Aptitude, Logical, Verbal, Numerical)');
    console.log('  Coding Problems Seeded (C, C++, Python, Java, MySQL)');
    console.log('========================================================================');
  } catch (error) {
    console.error('[Seed Fatal Error]:', error.message, error);
  }
};

if (process.argv[1]?.includes('seedData.js')) {
  seedData().then(() => process.exit(0));
}
