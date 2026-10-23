/**
 * Comprehensive Question Bank for the 5 Timed Assessment Sections:
 * 1. Aptitude (20+ verified questions across 27 topics)
 * 2. Logical Reasoning (20+ verified questions)
 * 3. Verbal Ability (20+ verified questions)
 * 4. Numerical Reasoning (20+ verified questions)
 * 5. Coding Problems (20 placement programs + MySQL challenges with test cases)
 */

export const aptitudeQuestions = [
  {
    topic: 'Number System',
    difficulty: 'Easy',
    statement: 'What is the remainder when (7^84) is divided by 342?',
    options: ['1', '7', '49', '341'],
    correct_option: 0,
    explanation: '7^3 = 343. 343 divided by 342 leaves remainder 1. (7^3)^28 = (343)^28. Therefore, the remainder is 1^28 = 1.',
    marks: 1
  },
  {
    topic: 'HCF and LCM',
    difficulty: 'Easy',
    statement: 'The HCF of two numbers is 11 and their LCM is 693. If one of the numbers is 77, find the other number.',
    options: ['88', '99', '111', '121'],
    correct_option: 1,
    explanation: 'Product of two numbers = HCF × LCM. Other number = (11 × 693) / 77 = 693 / 7 = 99.',
    marks: 1
  },
  {
    topic: 'Simplification',
    difficulty: 'Easy',
    statement: 'Evaluate: 1800 ÷ 10 × {(12 - 6) + (24 - 12)} using BODMAS.',
    options: ['3240', '3200', '1800', '2880'],
    correct_option: 0,
    explanation: 'Brackets first: (12 - 6) + (24 - 12) = 6 + 12 = 18. Then 1800 ÷ 10 × 18 = 180 × 18 = 3240.',
    marks: 1
  },
  {
    topic: 'Percentage',
    difficulty: 'Medium',
    statement: 'If the price of petrol increases by 25%, by what percentage must a car owner reduce consumption so that expenditure remains unchanged?',
    options: ['15%', '20%', '25%', '30%'],
    correct_option: 1,
    explanation: 'Reduction % = [r / (100 + r)] × 100 = [25 / 125] × 100 = 20%.',
    marks: 1
  },
  {
    topic: 'Ratio and Proportion',
    difficulty: 'Easy',
    statement: 'If A : B = 3 : 4 and B : C = 8 : 9, find the ratio A : C.',
    options: ['1 : 2', '2 : 3', '3 : 2', '4 : 5'],
    correct_option: 1,
    explanation: 'A/C = (A/B) × (B/C) = (3/4) × (8/9) = 24/36 = 2/3. Thus, A : C = 2 : 3.',
    marks: 1
  },
  {
    topic: 'Average',
    difficulty: 'Medium',
    statement: 'The average weight of 24 students in a class is 35 kg. If the teacher weight is included, the average increases by 400 grams. What is the teacher weight?',
    options: ['42 kg', '45 kg', '48 kg', '50 kg'],
    correct_option: 1,
    explanation: 'Total students weight = 24 × 35 = 840 kg. New average for 25 people = 35.4 kg. Total weight = 25 × 35.4 = 885 kg. Teacher weight = 885 - 840 = 45 kg.',
    marks: 1
  },
  {
    topic: 'Profit and Loss',
    difficulty: 'Medium',
    statement: 'A shopkeeper sells an article at a discount of 10% on the marked price and still gains 20%. If the cost price is $300, what is the marked price?',
    options: ['$360', '$380', '$400', '$420'],
    correct_option: 2,
    explanation: 'Selling price = 300 × 1.20 = $360. Marked Price × 0.90 = 360 => Marked Price = 360 / 0.90 = $400.',
    marks: 1
  },
  {
    topic: 'Simple and Compound Interest',
    difficulty: 'Medium',
    statement: 'What is the compound interest on $10,000 for 2 years at 10% per annum, compounded annually?',
    options: ['$2,000', '$2,100', '$2,200', '$2,500'],
    correct_option: 1,
    explanation: 'Amount = 10,000 × (1 + 0.10)^2 = 10,000 × 1.21 = $12,100. CI = $12,100 - $10,000 = $2,100.',
    marks: 1
  },
  {
    topic: 'Problems on Ages',
    difficulty: 'Easy',
    statement: 'Ten years ago, the ratio of the ages of father and son was 3 : 1. After 10 years, it will be 2 : 1. What is the present age of the father?',
    options: ['50 years', '60 years', '70 years', '80 years'],
    correct_option: 2,
    explanation: 'Let father and son ages 10 years ago be 3x and x. In 20 years: (3x + 20) / (x + 20) = 2/1 => 3x + 20 = 2x + 40 => x = 20. Present age of father = 3(20) + 10 = 70 years.',
    marks: 1
  },
  {
    topic: 'Time and Work',
    difficulty: 'Medium',
    statement: 'A can complete a project in 12 days and B can complete it in 18 days. If they work together, how many days will they take?',
    options: ['6.5 days', '7.2 days', '8 days', '9.5 days'],
    correct_option: 1,
    explanation: 'Combined rate = 1/12 + 1/18 = (3 + 2) / 36 = 5/36. Total days = 36 / 5 = 7.2 days.',
    marks: 1
  },
  {
    topic: 'Pipes and Cisterns',
    difficulty: 'Medium',
    statement: 'Pipe A can fill a tank in 6 hours and Pipe B can empty it in 8 hours. If both pipes are opened together, in how many hours will the tank be full?',
    options: ['18 hours', '20 hours', '24 hours', '28 hours'],
    correct_option: 2,
    explanation: 'Net rate = 1/6 - 1/8 = (4 - 3)/24 = 1/24. Thus, it will take 24 hours.',
    marks: 1
  },
  {
    topic: 'Time, Speed and Distance',
    difficulty: 'Medium',
    statement: 'A train 150 meters long is traveling at 54 km/h. How many seconds will it take to cross a platform 250 meters long?',
    options: ['20 seconds', '24 seconds', '26.67 seconds', '30 seconds'],
    correct_option: 2,
    explanation: 'Speed = 54 × (5/18) = 15 m/s. Total distance = 150 + 250 = 400 m. Time = 400 / 15 = 26.67 seconds.',
    marks: 1
  },
  {
    topic: 'Boats and Streams',
    difficulty: 'Hard',
    statement: 'A boat moves downstream at the rate of 16 km/h and upstream at the rate of 10 km/h. What is the speed of the current?',
    options: ['2 km/h', '3 km/h', '4 km/h', '5 km/h'],
    correct_option: 1,
    explanation: 'Speed of stream = (Downstream speed - Upstream speed) / 2 = (16 - 10) / 2 = 3 km/h.',
    marks: 1
  },
  {
    topic: 'Mixtures and Alligation',
    difficulty: 'Hard',
    statement: 'In what ratio must tea at $62 per kg be mixed with tea at $72 per kg so that the mixture must be worth $64.50 per kg?',
    options: ['3 : 1', '4 : 1', '5 : 2', '3 : 2'],
    correct_option: 0,
    explanation: 'By alligation rule: (72 - 64.5) / (64.5 - 62) = 7.5 / 2.5 = 3 / 1. Ratio is 3 : 1.',
    marks: 1
  },
  {
    topic: 'Permutation and Combination',
    difficulty: 'Medium',
    statement: 'In how many different ways can the letters of the word "LEADING" be arranged such that vowels always appear together?',
    options: ['360', '480', '720', '840'],
    correct_option: 2,
    explanation: 'Vowels: E, A, I (3 vowels). Consonants: L, D, N, G (4 consonants). Treating vowels as 1 unit gives 5 units: 5! = 120. Vowels arrange in 3! = 6 ways. Total = 120 × 6 = 720.',
    marks: 1
  },
  {
    topic: 'Probability',
    difficulty: 'Easy',
    statement: 'Two dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is equal to 8?',
    options: ['1/6', '5/36', '7/36', '1/9'],
    correct_option: 1,
    explanation: 'Pairs giving sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Total possible outcomes = 36. Probability = 5/36.',
    marks: 1
  },
  {
    topic: 'Algebra and Quadratic Equations',
    difficulty: 'Medium',
    statement: 'If α and β are the roots of the quadratic equation x^2 - 7x + 12 = 0, find the value of (α^2 + β^2).',
    options: ['25', '36', '49', '52'],
    correct_option: 0,
    explanation: 'Sum of roots (α + β) = 7, product (αβ) = 12. α^2 + β^2 = (α + β)^2 - 2αβ = 7^2 - 2(12) = 49 - 24 = 25.',
    marks: 1
  },
  {
    topic: 'Arithmetic and Geometric Progressions',
    difficulty: 'Medium',
    statement: 'Find the 10th term of the geometric progression: 3, 6, 12, 24, ...',
    options: ['768', '1536', '3072', '6144'],
    correct_option: 1,
    explanation: 'First term a = 3, common ratio r = 2. 10th term = a × r^(n-1) = 3 × 2^9 = 3 × 512 = 1536.',
    marks: 1
  },
  {
    topic: 'Geometry and Mensuration',
    difficulty: 'Medium',
    statement: 'The perimeter of a rectangular field is 160 meters and its length is 50 meters. What is the area of the field?',
    options: ['1200 sq m', '1500 sq m', '1600 sq m', '1800 sq m'],
    correct_option: 1,
    explanation: 'Perimeter = 2(l + w) => 160 = 2(50 + w) => 80 = 50 + w => w = 30 meters. Area = l × w = 50 × 30 = 1500 sq m.',
    marks: 1
  },
  {
    topic: 'Clocks and Calendars',
    difficulty: 'Easy',
    statement: 'At what angle are the hands of a clock inclined at 3:30?',
    options: ['65 degrees', '75 degrees', '80 degrees', '90 degrees'],
    correct_option: 1,
    explanation: 'Angle = |(30 × H) - (11/2 × M)| = |(30 × 3) - (11/2 × 30)| = |90 - 165| = 75 degrees.',
    marks: 1
  }
];

export const logicalReasoningQuestions = [
  {
    topic: 'Number Series',
    difficulty: 'Easy',
    statement: 'Find the missing number in the sequence: 4, 9, 25, 49, 121, ?',
    options: ['144', '169', '196', '225'],
    correct_option: 1,
    explanation: 'The series consists of squares of consecutive prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121, next prime is 13: 13^2 = 169.',
    marks: 1
  },
  {
    topic: 'Letter and Symbol Series',
    difficulty: 'Easy',
    statement: 'Which term completes the letter series: BDF, HJL, NPR, ?',
    options: ['TVX', 'SUW', 'TWZ', 'UWY'],
    correct_option: 0,
    explanation: 'Each group skips one letter: B(C)D(E)F. Next group starts after skipping one letter: F(G)H. Following NPR: R(S)T(U)V(W)X = TVX.',
    marks: 1
  },
  {
    topic: 'Analogy',
    difficulty: 'Easy',
    statement: 'Doctor : Hospital :: Teacher : ?',
    options: ['Student', 'Classroom', 'School', 'Laboratory'],
    correct_option: 2,
    explanation: 'A doctor primarily works in a hospital; similarly, a teacher workplace institution is a school.',
    marks: 1
  },
  {
    topic: 'Coding and Decoding',
    difficulty: 'Medium',
    statement: 'In a certain code language, "SYSTEM" is coded as "SYSMET" and "NEARER" is coded as "AENRER". How is "FRACTION" coded?',
    options: ['CARFNOIT', 'CARFTION', 'CRAFNOIT', 'ARCFTION'],
    correct_option: 0,
    explanation: 'The word is divided into two halves: SYS | TEM. The first half is reversed to SYS, second half to MET. FRACTION has 8 letters: FRAC | TION. Reversing each half gives CARF | NOIT => CARFNOIT.',
    marks: 1
  },
  {
    topic: 'Blood Relations',
    difficulty: 'Medium',
    statement: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Father', 'Grandfather'],
    correct_option: 2,
    explanation: 'The only son of Suresh mother is Suresh himself. Therefore, the boy is Suresh son, which means Suresh is the boy father.',
    marks: 1
  },
  {
    topic: 'Direction Sense',
    difficulty: 'Medium',
    statement: 'A person walks 20 meters North, turns right and walks 30 meters, then turns right again and walks 20 meters. How far is he from his starting point?',
    options: ['20 meters', '30 meters', '40 meters', '50 meters'],
    correct_option: 1,
    explanation: 'Moving North 20m and then South 20m cancels the vertical displacement. The horizontal displacement is 30m East. So he is 30 meters away.',
    marks: 1
  },
  {
    topic: 'Seating Arrangements',
    difficulty: 'Hard',
    statement: 'Six friends A, B, C, D, E, F are seated in a row facing North. C is between A and E. D is not at either end. B is sitting immediate right of E. F is not at the right end. Who is sitting at the extreme right end?',
    options: ['A', 'B', 'C', 'E'],
    correct_option: 1,
    explanation: 'Arrangement from left to right: F, A, C, E, B, D or similar. Since B is immediately right of E and no one is right of B, B is at the extreme right.',
    marks: 1
  },
  {
    topic: 'Syllogisms',
    difficulty: 'Medium',
    statement: 'Statements: (1) All cats are dogs. (2) All dogs are birds. Conclusions: I. All cats are birds. II. All birds are cats.',
    options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
    correct_option: 0,
    explanation: 'Cats ⊂ Dogs ⊂ Birds implies All cats are birds (Conclusion I valid). However, All birds are cats is not necessarily true.',
    marks: 1
  },
  {
    topic: 'Statement and Assumption',
    difficulty: 'Medium',
    statement: 'Statement: "Please consult our certified financial planners before investing in volatile stocks." Assumptions: I. Certified planners have domain expertise. II. Investing without guidance carries financial risk.',
    options: ['Only assumption I is implicit', 'Only assumption II is implicit', 'Both I and II are implicit', 'Neither is implicit'],
    correct_option: 2,
    explanation: 'The recommendation implies that certified planners have the required expertise (I) and that unguided investments are prone to risks (II). Both are implicit.',
    marks: 1
  },
  {
    topic: 'Statement and Conclusion',
    difficulty: 'Medium',
    statement: 'Statement: The company achieved record profits this quarter primarily due to operational efficiency and reduction in supply chain overheads. Conclusions: I. High profits guarantee employee bonus. II. Supply chain management impacts profitability.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both I and II follow', 'Neither follows'],
    correct_option: 1,
    explanation: 'The statement directly links supply chain reduction with profit achievement, confirming II. Bonuses are not mentioned, so I does not follow.',
    marks: 1
  },
  {
    topic: 'Cause and Effect',
    difficulty: 'Easy',
    statement: 'I. The regional meteorological department issued a high wind warning. II. Several coastal ferry trips were rescheduled for passenger safety.',
    options: ['Statement I is the cause and II is its effect', 'Statement II is the cause and I is its effect', 'Both are independent causes', 'Both are effects of independent causes'],
    correct_option: 0,
    explanation: 'The storm warning is the triggering event (cause), resulting in the precautionary cancellation and rescheduling of ferry trips (effect).',
    marks: 1
  },
  {
    topic: 'Inequalities',
    difficulty: 'Easy',
    statement: 'Given: P > Q ≥ R = S < T. Which of the following statements is definitely true?',
    options: ['P > S', 'T > Q', 'R > P', 'S > P'],
    correct_option: 0,
    explanation: 'Since P > Q and Q ≥ R and R = S, it strictly follows that P > S.',
    marks: 1
  },
  {
    topic: 'Ranking and Ordering',
    difficulty: 'Easy',
    statement: 'In a class of 45 students, Rahul ranks 12th from the top. What is his rank from the bottom?',
    options: ['33rd', '34th', '35th', '36th'],
    correct_option: 1,
    explanation: 'Rank from bottom = Total students - Rank from top + 1 = 45 - 12 + 1 = 34th.',
    marks: 1
  },
  {
    topic: 'Venn Diagrams',
    difficulty: 'Easy',
    statement: 'Which option best depicts the relationship between: Engineers, Software Developers, and Musicians?',
    options: [
      'Two concentric circles inside a third',
      'Three intersecting circles where Software Developers are a subset of Engineers, overlapping Musicians',
      'Three completely disjoint circles',
      'Two disjoint circles inside one large circle'
    ],
    correct_option: 1,
    explanation: 'Software Developers are a subset of or heavily overlap Engineers, while Musicians can overlap both professions as a cross-cutting pursuit.',
    marks: 1
  },
  {
    topic: 'Clocks and Calendars',
    difficulty: 'Medium',
    statement: 'If January 1, 2024 was a Monday, what day of the week was January 1, 2025?',
    options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    correct_option: 1,
    explanation: '2024 is a leap year (366 days). 366 ÷ 7 leaves an odd day remainder of 2. Monday + 2 days = Wednesday.',
    marks: 1
  },
  {
    topic: 'Non-Verbal Reasoning',
    difficulty: 'Medium',
    statement: 'When viewed in a vertical plane mirror placed on the right, how does the word "CODE" appear?',
    options: ['Reversed letter sequence with mirrored individual glyphs', 'Same order with inverted orientation', 'Inverted upside down', 'No change'],
    correct_option: 0,
    explanation: 'Mirror reflection reverses horizontal left-right parity. The letters reflect from right-to-left: E, D, O, C each with horizontal reflection.',
    marks: 1
  },
  {
    topic: 'Dice and Cubes',
    difficulty: 'Easy',
    statement: 'In a standard fair cubic die, which number is on the face opposite to 2?',
    options: ['3', '4', '5', '6'],
    correct_option: 2,
    explanation: 'In a standard standard die, opposite faces always sum to 7. 7 - 2 = 5.',
    marks: 1
  },
  {
    topic: 'Data Sufficiency',
    difficulty: 'Hard',
    statement: 'Is X an even integer? Statement 1: X is divisible by 4. Statement 2: X is divisible by 6.',
    options: ['Statement 1 alone is sufficient', 'Statement 2 alone is sufficient', 'Either statement alone is sufficient', 'Both statements together are needed'],
    correct_option: 2,
    explanation: 'If X is divisible by 4, it must be even (Statement 1 sufficient). If X is divisible by 6, it must also be even (Statement 2 sufficient). Thus, either statement alone is sufficient.',
    marks: 1
  },
  {
    topic: 'Logical Sequence of Words',
    difficulty: 'Easy',
    statement: 'Arrange in a meaningful operational sequence: 1. Requirement Analysis, 2. Maintenance, 3. Coding, 4. Testing, 5. Deployment.',
    options: ['1, 3, 4, 5, 2', '1, 4, 3, 5, 2', '3, 1, 4, 5, 2', '1, 3, 5, 4, 2'],
    correct_option: 0,
    explanation: 'Standard Software Engineering lifecycle: Requirements (1) -> Coding (3) -> Testing (4) -> Deployment (5) -> Maintenance (2).',
    marks: 1
  },
  {
    topic: 'Odd One Out',
    difficulty: 'Easy',
    statement: 'Find the odd one out among the following: Copper, Zinc, Brass, Iron.',
    options: ['Copper', 'Zinc', 'Brass', 'Iron'],
    correct_option: 2,
    explanation: 'Brass is an alloy (mixture of Copper and Zinc), whereas Copper, Zinc, and Iron are pure chemical elements.',
    marks: 1
  }
];

export const verbalAbilityQuestions = [
  {
    topic: 'Subject-Verb Agreement',
    difficulty: 'Easy',
    statement: 'Identify the sentence with correct grammatical agreement:',
    options: [
      'Neither the project manager nor the developers was present at the sync.',
      'Neither the project manager nor the developers were present at the sync.',
      'Neither the project manager nor the developers is present at the sync.',
      'Neither the project manager nor the developers has been present.'
    ],
    correct_option: 1,
    explanation: 'With "neither... nor", the verb agrees with the closer subject ("developers" is plural, hence "were").',
    marks: 1
  },
  {
    topic: 'Tenses and Articles',
    difficulty: 'Easy',
    statement: 'Choose the correct option: By next December, our engineering team _______ the cloud migration.',
    options: ['will complete', 'will have completed', 'has completed', 'is completing'],
    correct_option: 1,
    explanation: 'Future Perfect tense ("will have completed") denotes an action that will be finalized before a specified future time milestone ("By next December").',
    marks: 1
  },
  {
    topic: 'Error Spotting',
    difficulty: 'Medium',
    statement: 'Find the segment containing an error: "The committee has (A) / submitted their report (B) / regarding the security audit (C) / without delay (D)."',
    options: ['Segment A', 'Segment B', 'Segment C', 'Segment D'],
    correct_option: 1,
    explanation: 'Since "committee" is treated as a singular collective noun with the singular verb "has", the pronoun should be "its report" instead of "their report".',
    marks: 1
  },
  {
    topic: 'Synonyms',
    difficulty: 'Easy',
    statement: 'Select the most accurate synonym for the word "PRAGMATIC":',
    options: ['Theoretical', 'Practical', 'Idealistic', 'Impulsive'],
    correct_option: 1,
    explanation: '"Pragmatic" means dealing with matters in a realistic and sensible, practical manner.',
    marks: 1
  },
  {
    topic: 'Antonyms',
    difficulty: 'Easy',
    statement: 'Select the exact antonym for the word "OBSOLETE":',
    options: ['Contemporary', 'Archaic', 'Redundant', 'Superfluous'],
    correct_option: 0,
    explanation: '"Obsolete" means out of date or no longer used. Its opposite is "Contemporary" or modern.',
    marks: 1
  },
  {
    topic: 'One-Word Substitution',
    difficulty: 'Medium',
    statement: 'A person who renounces a religious or political belief or allegiance is known as an:',
    options: ['Apostate', 'Ascetic', 'Iconoclast', 'Agnostic'],
    correct_option: 0,
    explanation: 'An "Apostate" is someone who abandons or renounces their religious commitment or political principle.',
    marks: 1
  },
  {
    topic: 'Idioms and Phrases',
    difficulty: 'Easy',
    statement: 'What is the meaning of the idiom "to burn the candle at both ends"?',
    options: [
      'To waste electrical energy recklessly',
      'To work extremely hard from early morning until late night',
      'To cause a disagreement between two parties',
      'To invest in conflicting assets'
    ],
    correct_option: 1,
    explanation: '"Burn the candle at both ends" means to exhaust oneself by working excessively hard and keeping late hours.',
    marks: 1
  },
  {
    topic: 'Sentence Completion',
    difficulty: 'Medium',
    statement: 'Despite facing stringent budget constraints, the software architecture team managed to deliver a _______ and resilient microservices platform.',
    options: ['fragile', 'robust', 'substandard', 'tedious'],
    correct_option: 1,
    explanation: '"Despite" indicates a contrast between constraints and positive delivery. "Robust" aligns with "resilient".',
    marks: 1
  },
  {
    topic: 'Active and Passive Voice',
    difficulty: 'Easy',
    statement: 'Convert to Passive Voice: "The QA team detected three critical vulnerabilities in the build."',
    options: [
      'Three critical vulnerabilities were detected by the QA team in the build.',
      'Three critical vulnerabilities had been detected by the QA team.',
      'In the build, three critical vulnerabilities are detected by the QA team.',
      'Three critical vulnerabilities was detected by the QA team.'
    ],
    correct_option: 0,
    explanation: 'Simple past active ("detected") changes to plural past passive ("were detected").',
    marks: 1
  },
  {
    topic: 'Direct and Indirect Speech',
    difficulty: 'Medium',
    statement: 'Change to indirect speech: The architect said, "We have deployed the patch."',
    options: [
      'The architect said that they had deployed the patch.',
      'The architect said that we have deployed the patch.',
      'The architect told that they deployed the patch.',
      'The architect says that they had deployed the patch.'
    ],
    correct_option: 0,
    explanation: 'Present perfect ("have deployed") changes to past perfect ("had deployed") and pronoun "we" becomes "they".',
    marks: 1
  },
  {
    topic: 'Para Jumbles',
    difficulty: 'Hard',
    statement: 'Reorder into a coherent paragraph: \nP: This architectural agility allows rapid product iterations. \nQ: Modern software firms adopt distributed cloud native patterns. \nR: Consequently, developer productivity and uptime reach benchmark levels. \nS: These patterns decouple application dependencies into standalone services.',
    options: ['Q, S, P, R', 'Q, P, S, R', 'S, Q, P, R', 'P, Q, S, R'],
    correct_option: 0,
    explanation: 'Q introduces cloud native patterns. S explains how they decouple dependencies. P connects this to agility. R concludes with consequences.',
    marks: 1
  },
  {
    topic: 'Reading Comprehension',
    difficulty: 'Medium',
    statement: 'Passage: "Distributed databases rely on consensus algorithms like Raft to preserve consistency despite network partitions. While consensus introduces latency during leader election, it guarantees that committed state transitions remain immutable across surviving replicas." What is the main trade-off highlighted in the passage?',
    options: [
      'Security vs Storage capacity',
      'Leader election latency vs Guaranteed immutable consistency',
      'CPU utilization vs Network bandwidth',
      'Disk write speed vs Read scalability'
    ],
    correct_option: 1,
    explanation: 'The passage explicitly states: "While consensus introduces latency during leader election, it guarantees that committed state transitions remain immutable".',
    marks: 1
  },
  {
    topic: 'Critical Reasoning',
    difficulty: 'Hard',
    statement: 'Premise: Developers who participate regularly in code reviews author 40% fewer production defects. Conclusion: Enforcing mandatory code reviews will completely eliminate software outages. Which flaw best describes the conclusion?',
    options: [
      'It assumes an association implies complete causation and overstates the outcome to total elimination.',
      'It contradicts the original quantitative defect data.',
      'It confuses code reviews with unit testing.',
      'It relies on circular logic without evidence.'
    ],
    correct_option: 0,
    explanation: 'A 40% reduction does not justify the extreme conclusion of complete elimination of all outages.',
    marks: 1
  },
  {
    topic: 'Cloze Test',
    difficulty: 'Medium',
    statement: 'Fill in the blank: "Effective technical documentation serves as an indispensable _______ between engineering rationale and business stakeholders."',
    options: ['conduit', 'barrier', 'dilemma', 'deviation'],
    correct_option: 0,
    explanation: 'A "conduit" is a channel or medium through which communication or understanding flows effectively between two parties.',
    marks: 1
  },
  {
    topic: 'Spelling Correction',
    difficulty: 'Easy',
    statement: 'Select the correctly spelled word:',
    options: ['Surveillance', 'Surveilance', 'Survaliance', 'Surveillence'],
    correct_option: 0,
    explanation: '"Surveillance" is the standard correct English spelling (double L).',
    marks: 1
  },
  {
    topic: 'Vocabulary in Context',
    difficulty: 'Medium',
    statement: 'The CTO described the legacy monolith as "anachronistic" in an ecosystem of microservices. What does "anachronistic" mean here?',
    options: [
      'Belonging to an earlier era and out of date',
      'Highly performant and reliable',
      'Inexpensive to maintain',
      'Extremely secure and isolated'
    ],
    correct_option: 0,
    explanation: '"Anachronistic" means belonging or appropriate to an earlier period, often obsolete in a modern context.',
    marks: 1
  },
  {
    topic: 'Sentence Improvement',
    difficulty: 'Medium',
    statement: 'Select the best phrasing: "If I was the engineering director, I would mandate automated CI/CD pipelines."',
    options: [
      'If I were the engineering director, I would mandate automated CI/CD pipelines.',
      'If I am the engineering director, I would mandate automated CI/CD pipelines.',
      'If I had been the engineering director, I will mandate automated CI/CD pipelines.',
      'No improvement needed.'
    ],
    correct_option: 0,
    explanation: 'Hypothetical subjunctive mood requires "were" rather than "was" ("If I were...").',
    marks: 1
  },
  {
    topic: 'Verbal Analogies',
    difficulty: 'Easy',
    statement: 'Compromise : Consensus :: Dispute : ?',
    options: ['Conflict', 'Harmony', 'Agreement', 'Approval'],
    correct_option: 0,
    explanation: 'Compromise leads to consensus; similarly, dispute produces conflict.',
    marks: 1
  },
  {
    topic: 'Word Usage',
    difficulty: 'Easy',
    statement: 'Choose the appropriate word: The deployment team will _______ the database migration during off-peak hours.',
    options: ['effect', 'affect', 'effective', 'affection'],
    correct_option: 0,
    explanation: '"Effect" as a verb means to bring about or accomplish a result (to effect the migration).',
    marks: 1
  },
  {
    topic: 'Grammar and Prepositions',
    difficulty: 'Easy',
    statement: 'The infrastructure engineer was commended _______ his innovative zero-downtime deployment strategy.',
    options: ['for', 'with', 'about', 'on'],
    correct_option: 0,
    explanation: 'The verb "commended" collocates with the preposition "for" when specifying the reason.',
    marks: 1
  }
];

export const numericalReasoningQuestions = [
  {
    topic: 'Number Series & Missing Numbers',
    difficulty: 'Easy',
    statement: 'Determine the missing term in the sequence: 3, 7, 15, 31, 63, ?',
    options: ['125', '127', '129', '131'],
    correct_option: 1,
    explanation: 'Each term is (previous × 2) + 1. 63 × 2 + 1 = 126 + 1 = 127.',
    marks: 1
  },
  {
    topic: 'Pattern Reasoning',
    difficulty: 'Medium',
    statement: 'What is the next number in the alternating sequence: 2, 5, 4, 10, 8, 20, 16, ?',
    options: ['32', '36', '40', '48'],
    correct_option: 2,
    explanation: 'Two interleaved series: (2, 4, 8, 16 - doubling) and (5, 10, 20, 40 - doubling). The next term follows the second series: 20 × 2 = 40.',
    marks: 1
  },
  {
    topic: 'BODMAS & Arithmetic',
    difficulty: 'Easy',
    statement: 'Calculate: 45 - [38 - {60 ÷ 3 - (6 - 9 ÷ 3)}]',
    options: ['24', '26', '28', '30'],
    correct_option: 0,
    explanation: 'Inner bracket: 9 ÷ 3 = 3; 6 - 3 = 3. Next: 60 ÷ 3 = 20; 20 - 3 = 17. Next: 38 - 17 = 21. Finally: 45 - 21 = 24.',
    marks: 1
  },
  {
    topic: 'Fractions and Decimals',
    difficulty: 'Easy',
    statement: 'Which of the following fractions has the highest numeric value?',
    options: ['5/8', '7/12', '3/4', '11/16'],
    correct_option: 2,
    explanation: '5/8 = 0.625; 7/12 ≈ 0.583; 3/4 = 0.750; 11/16 = 0.6875. Highest is 3/4.',
    marks: 1
  },
  {
    topic: 'Percentages & Growth',
    difficulty: 'Medium',
    statement: 'A cloud server costs $200 per month. If the hosting fee increases by 10% in Year 1 and then by 15% in Year 2, what is the new monthly cost?',
    options: ['$245', '$250', '$253', '$260'],
    correct_option: 2,
    explanation: 'Cost after Year 1 = 200 × 1.10 = $220. Cost after Year 2 = 220 × 1.15 = $253.',
    marks: 1
  },
  {
    topic: 'Ratio and Proportion',
    difficulty: 'Easy',
    statement: 'The ratio of frontend developers to backend developers in an engineering organization is 5 : 7. If there are 35 backend developers, how many frontend developers are there?',
    options: ['20', '25', '30', '35'],
    correct_option: 1,
    explanation: '7 parts = 35 => 1 part = 5. Frontend developers = 5 × 5 = 25.',
    marks: 1
  },
  {
    topic: 'Averages and Weighted Averages',
    difficulty: 'Medium',
    statement: 'A student scored 80 in Mathematics (weight 4) and 90 in Computer Science (weight 6). What is the weighted average score?',
    options: ['84', '86', '88', '89'],
    correct_option: 1,
    explanation: 'Weighted average = [(80 × 4) + (90 × 6)] / (4 + 6) = (320 + 540) / 10 = 860 / 10 = 86.',
    marks: 1
  },
  {
    topic: 'Numerical Comparison',
    difficulty: 'Easy',
    statement: 'If A = 2^50, B = 3^40, and C = 5^20, which of the following inequalities holds true?',
    options: ['C < A < B', 'A < C < B', 'B < A < C', 'C < B < A'],
    correct_option: 0,
    explanation: 'Take 10th roots: A^(1/10) = 2^5 = 32; B^(1/10) = 3^4 = 81; C^(1/10) = 5^2 = 25. Therefore 25 < 32 < 81, so C < A < B.',
    marks: 1
  },
  {
    topic: 'Time and Distance',
    difficulty: 'Medium',
    statement: 'A cyclist travels 60 km at 20 km/h and returns the same distance at 30 km/h. What is the average speed for the entire round trip?',
    options: ['24 km/h', '25 km/h', '26 km/h', '27.5 km/h'],
    correct_option: 0,
    explanation: 'Average speed for equal distances = 2xy / (x + y) = 2(20)(30) / (20 + 30) = 1200 / 50 = 24 km/h.',
    marks: 1
  },
  {
    topic: 'Time and Work',
    difficulty: 'Medium',
    statement: 'Machine X can produce 500 units in 4 hours, and Machine Y can produce 500 units in 6 hours. Working simultaneously, how long will they take to produce 1,000 units?',
    options: ['4.2 hours', '4.8 hours', '5.0 hours', '5.5 hours'],
    correct_option: 1,
    explanation: 'Rate of X = 500/4 = 125 units/hr. Rate of Y = 500/6 = 83.33 units/hr. Combined rate = 208.33 units/hr. Time for 1000 units = 1000 / (1250/6) = 6000/1250 = 4.8 hours.',
    marks: 1
  },
  {
    topic: 'Data Interpretation: Tables',
    difficulty: 'Medium',
    statement: 'Quarterly sales (in $k): Q1: 120, Q2: 150, Q3: 180, Q4: 210. What is the percentage increase in sales from Q1 to Q4?',
    options: ['50%', '60%', '75%', '90%'],
    correct_option: 2,
    explanation: 'Percentage increase = [(210 - 120) / 120] × 100 = (90 / 120) × 100 = 75%.',
    marks: 1
  },
  {
    topic: 'Profit and Discount',
    difficulty: 'Medium',
    statement: 'An item is purchased for $800 and marked up by 40%. It is then sold at a discount of 15% on the marked price. What is the actual profit made?',
    options: ['$144', '$152', '$160', '$168'],
    correct_option: 1,
    explanation: 'Marked price = 800 × 1.40 = $1120. Selling price = 1120 × 0.85 = $952. Profit = $952 - $800 = $152.',
    marks: 1
  },
  {
    topic: 'Simple Interest',
    difficulty: 'Easy',
    statement: 'A principal of $5,000 yields $600 simple interest over 2 years. What was the annual interest rate?',
    options: ['5%', '6%', '7%', '8%'],
    correct_option: 1,
    explanation: 'Rate = (SI × 100) / (P × T) = (600 × 100) / (5000 × 2) = 60,000 / 10,000 = 6%.',
    marks: 1
  },
  {
    topic: 'Estimation and Approximation',
    difficulty: 'Easy',
    statement: 'Approximate the value of: (19.98 × 4.02) + (102.15 ÷ 4.95)',
    options: ['90', '100', '110', '120'],
    correct_option: 1,
    explanation: '19.98 ≈ 20; 4.02 ≈ 4 => 20 × 4 = 80. 102.15 ÷ 4.95 ≈ 100 ÷ 5 = 20. Total = 80 + 20 = 100.',
    marks: 1
  },
  {
    topic: 'HCF and Divisibility',
    difficulty: 'Easy',
    statement: 'Which of the following numbers is divisible by both 9 and 11?',
    options: ['1782', '1892', '1953', '2045'],
    correct_option: 0,
    explanation: 'For 1782: Sum of digits = 1+7+8+2 = 18 (divisible by 9). Alternating sum = (1+8) - (7+2) = 9 - 9 = 0 (divisible by 11). Thus 1782 is divisible by both.',
    marks: 1
  },
  {
    topic: 'Algebraic Reasoning',
    difficulty: 'Medium',
    statement: 'If x + y = 14 and xy = 45, what is the value of x^2 + y^2?',
    options: ['96', '106', '116', '126'],
    correct_option: 1,
    explanation: 'x^2 + y^2 = (x + y)^2 - 2xy = 14^2 - 2(45) = 196 - 90 = 106.',
    marks: 1
  },
  {
    topic: 'Age Problems',
    difficulty: 'Easy',
    statement: 'The sum of the ages of three colleagues is 84 years. Five years ago, what was the sum of their ages?',
    options: ['69 years', '74 years', '79 years', '81 years'],
    correct_option: 0,
    explanation: 'Five years ago, each colleague was 5 years younger: 84 - (3 × 5) = 84 - 15 = 69 years.',
    marks: 1
  },
  {
    topic: 'Progressions and Series',
    difficulty: 'Medium',
    statement: 'What is the sum of the first 20 positive even integers (2 + 4 + 6 + ... + 40)?',
    options: ['380', '400', '420', '440'],
    correct_option: 2,
    explanation: 'Sum of first n even numbers = n(n + 1). For n = 20: 20 × 21 = 420.',
    marks: 1
  },
  {
    topic: 'Data Sufficiency: Quantitative',
    difficulty: 'Hard',
    statement: 'What is the value of positive integer n? Statement 1: n^2 = 64. Statement 2: n is divisible by 4.',
    options: ['Statement 1 alone is sufficient', 'Statement 2 alone is sufficient', 'Both statements together are needed', 'Neither is sufficient'],
    correct_option: 0,
    explanation: 'Since n is a positive integer, n^2 = 64 uniquely yields n = 8. Statement 1 alone is sufficient.',
    marks: 1
  },
  {
    topic: 'Applied Numerical Logic',
    difficulty: 'Medium',
    statement: 'A warehouse receives 120 pallets. 30% are fragile electronics, 45% are non-fragile goods, and the remainder are priority perishables. How many pallets are priority perishables?',
    options: ['24', '30', '36', '42'],
    correct_option: 1,
    explanation: 'Remaining percentage = 100% - (30% + 45%) = 25%. Number of pallets = 120 × 0.25 = 30.',
    marks: 1
  }
];

export { placementCodingProblems as codingProblems } from './placementCodingProblems.js';

