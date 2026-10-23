/**
 * InterviewIQ - Comprehensive Question Bank: 20 Essential Placement Programming Challenges + MySQL Sandbox
 *
 * Supported Languages:
 * 1. C
 * 2. C++
 * 3. Python 3
 * 4. Java
 * 5. MySQL
 */

export const placementCodingProblems = [
  // 1. Even or Odd Number
  {
    id: 'code-1',
    title: 'Even or Odd Number',
    difficulty: 'Easy',
    category: 'Programming Fundamentals',
    statement: 'Write a program that takes an integer N as input and prints "Even" if the number is even, and "Odd" if the number is odd.',
    constraints: '-10^9 <= N <= 10^9',
    sample_input: '4',
    sample_output: 'Even',
    sample_test_cases: [
      { input: '4', expected_output: 'Even' },
      { input: '7', expected_output: 'Odd' }
    ],
    hidden_test_cases: [
      { input: '0', expected_output: 'Even' },
      { input: '-15', expected_output: 'Odd' },
      { input: '1000000', expected_output: 'Even' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        if (n % 2 == 0) printf("Even\\n");\n        else printf("Odd\\n");\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        if (n % 2 == 0) cout << "Even" << endl;\n        else cout << "Odd" << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    print("Even" if n % 2 == 0 else "Odd")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long n = sc.nextLong();\n            System.out.println(n % 2 == 0 ? "Even" : "Odd");\n        }\n    }\n}',
      mysql: 'SELECT val, CASE WHEN val % 2 = 0 THEN \'Even\' ELSE \'Odd\' END AS result FROM Numbers;'
    }
  },

  // 2. Largest of Three Numbers
  {
    id: 'code-2',
    title: 'Largest of Three Numbers',
    difficulty: 'Easy',
    category: 'Programming Fundamentals',
    statement: 'Given three integers A, B, and C on a single line or separate lines, find and print the maximum value among them.',
    constraints: '-10^9 <= A, B, C <= 10^9',
    sample_input: '10 25 15',
    sample_output: '25',
    sample_test_cases: [
      { input: '10 25 15', expected_output: '25' },
      { input: '-5 -1 -10', expected_output: '-1' }
    ],
    hidden_test_cases: [
      { input: '100 100 50', expected_output: '100' },
      { input: '0 0 0', expected_output: '0' },
      { input: '999999 1000000 999998', expected_output: '1000000' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    long long a, b, c;\n    if (scanf("%lld %lld %lld", &a, &b, &c) == 3) {\n        long long max_val = a;\n        if (b > max_val) max_val = b;\n        if (c > max_val) max_val = c;\n        printf("%lld\\n", max_val);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    long long a, b, c;\n    if (cin >> a >> b >> c) {\n        cout << max(a, max(b, c)) << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if len(nums) >= 3:\n        print(max(nums[0], nums[1], nums[2]))\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong();\n        long b = sc.nextLong();\n        long c = sc.nextLong();\n        long max = Math.max(a, Math.max(b, c));\n        System.out.println(max);\n    }\n}',
      mysql: 'SELECT GREATEST(a, b, c) AS max_val FROM triplets;'
    }
  },

  // 3. Swap Two Numbers
  {
    id: 'code-3',
    title: 'Swap Two Numbers',
    difficulty: 'Easy',
    category: 'Programming Fundamentals',
    statement: 'Given two integers A and B, swap their values and print them in reversed order: "B A".',
    constraints: '-10^9 <= A, B <= 10^9',
    sample_input: '5 9',
    sample_output: '9 5',
    sample_test_cases: [
      { input: '5 9', expected_output: '9 5' },
      { input: '-10 20', expected_output: '20 -10' }
    ],
    hidden_test_cases: [
      { input: '0 42', expected_output: '42 0' },
      { input: '7 7', expected_output: '7 7' },
      { input: '-50 -100', expected_output: '-100 -50' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    long long a, b;\n    if (scanf("%lld %lld", &a, &b) == 2) {\n        long long temp = a;\n        a = b;\n        b = temp;\n        printf("%lld %lld\\n", a, b);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <utility>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        swap(a, b);\n        cout << a << " " << b << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if len(nums) >= 2:\n        a, b = nums[0], nums[1]\n        a, b = b, a\n        print(f"{a} {b}")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong();\n        long b = sc.nextLong();\n        System.out.println(b + " " + a);\n    }\n}',
      mysql: 'SELECT b AS a, a AS b FROM pair_numbers;'
    }
  },

  // 4. Factorial of a Number
  {
    id: 'code-4',
    title: 'Factorial of a Number',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Given a non-negative integer N, compute and print N factorial (N!). Note that 0! = 1.',
    constraints: '0 <= N <= 15',
    sample_input: '5',
    sample_output: '120',
    sample_test_cases: [
      { input: '5', expected_output: '120' },
      { input: '0', expected_output: '1' }
    ],
    hidden_test_cases: [
      { input: '1', expected_output: '1' },
      { input: '6', expected_output: '720' },
      { input: '10', expected_output: '3628800' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        long long fact = 1;\n        for (int i = 1; i <= n; i++) fact *= i;\n        printf("%lld\\n", fact);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        long long fact = 1;\n        for (int i = 1; i <= n; i++) fact *= i;\n        cout << fact << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    fact = 1\n    for i in range(1, n + 1):\n        fact *= i\n    print(fact)\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long fact = 1;\n        for (int i = 1; i <= n; i++) fact *= i;\n        System.out.println(fact);\n    }\n}',
      mysql: 'SELECT product FROM factorials WHERE n = 5;'
    }
  },

  // 5. Fibonacci Series
  {
    id: 'code-5',
    title: 'Fibonacci Series (Nth Term)',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Compute the N-th Fibonacci number where F(0) = 0, F(1) = 1, and F(N) = F(N-1) + F(N-2) for N >= 2.',
    constraints: '0 <= N <= 30',
    sample_input: '7',
    sample_output: '13',
    sample_test_cases: [
      { input: '7', expected_output: '13' },
      { input: '0', expected_output: '0' }
    ],
    hidden_test_cases: [
      { input: '1', expected_output: '1' },
      { input: '10', expected_output: '55' },
      { input: '15', expected_output: '610' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        if (n == 0) { printf("0\\n"); return 0; }\n        long long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long long c = a + b;\n            a = b; b = c;\n        }\n        printf("%lld\\n", b);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        if (n == 0) { cout << 0 << endl; return 0; }\n        long long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long long c = a + b;\n            a = b; b = c;\n        }\n        cout << b << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    if n == 0: print(0); return\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    print(b)\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n == 0) { System.out.println(0); return; }\n        long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long c = a + b;\n            a = b; b = c;\n        }\n        System.out.println(b);\n    }\n}',
      mysql: 'SELECT fib_val FROM fibonacci_sequence WHERE term = 7;'
    }
  },

  // 6. Prime Number Checker
  {
    id: 'code-6',
    title: 'Prime Number Checker',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Given an integer N > 1, determine if N is a prime number. Output "true" if prime, otherwise "false".',
    constraints: '2 <= N <= 10^9',
    sample_input: '17',
    sample_output: 'true',
    sample_test_cases: [
      { input: '17', expected_output: 'true' },
      { input: '18', expected_output: 'false' }
    ],
    hidden_test_cases: [
      { input: '2', expected_output: 'true' },
      { input: '4', expected_output: 'false' },
      { input: '97', expected_output: 'true' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <stdbool.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        if (n < 2) { printf("false\\n"); return 0; }\n        bool is_prime = true;\n        for (long long i = 2; i * i <= n; i++) {\n            if (n % i == 0) { is_prime = false; break; }\n        }\n        printf("%s\\n", is_prime ? "true" : "false");\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        if (n < 2) { cout << "false" << endl; return 0; }\n        bool prime = true;\n        for (long long i = 2; i * i <= n; i++) {\n            if (n % i == 0) { prime = false; break; }\n        }\n        cout << (prime ? "true" : "false") << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    if n < 2:\n        print("false")\n        return\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            print("false")\n            return\n    print("true")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        if (n < 2) { System.out.println("false"); return; }\n        boolean prime = true;\n        for (long i = 2; i * i <= n; i++) {\n            if (n % i == 0) { prime = false; break; }\n        }\n        System.out.println(prime ? "true" : "false");\n    }\n}',
      mysql: 'SELECT val, is_prime FROM prime_lookup WHERE val = 17;'
    }
  },

  // 7. Palindrome Number Checker
  {
    id: 'code-7',
    title: 'Palindrome Number Checker',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Given an integer N, check whether it reads the same backwards as forwards. Print "true" if palindrome, otherwise "false".',
    constraints: '-2^31 <= N <= 2^31 - 1',
    sample_input: '121',
    sample_output: 'true',
    sample_test_cases: [
      { input: '121', expected_output: 'true' },
      { input: '-121', expected_output: 'false' }
    ],
    hidden_test_cases: [
      { input: '10', expected_output: 'false' },
      { input: '1221', expected_output: 'true' },
      { input: '7', expected_output: 'true' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        if (n < 0) { printf("false\\n"); return 0; }\n        long long orig = n, rev = 0;\n        while (n > 0) { rev = rev * 10 + (n % 10); n /= 10; }\n        printf("%s\\n", orig == rev ? "true" : "false");\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        if (n < 0) { cout << "false" << endl; return 0; }\n        long long orig = n, rev = 0;\n        while (n > 0) { rev = rev * 10 + (n % 10); n /= 10; }\n        cout << (orig == rev ? "true" : "false") << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    if not s: return\n    if s.startswith("-"):\n        print("false")\n    else:\n        print("true" if s == s[::-1] else "false")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        if (n < 0) { System.out.println("false"); return; }\n        long orig = n, rev = 0;\n        while (n > 0) { rev = rev * 10 + (n % 10); n /= 10; }\n        System.out.println(orig == rev ? "true" : "false");\n    }\n}',
      mysql: 'SELECT val, CASE WHEN val = REVERSE(val) THEN \'true\' ELSE \'false\' END AS is_palindrome FROM numbers;'
    }
  },

  // 8. Armstrong Number
  {
    id: 'code-8',
    title: 'Armstrong Number Checker',
    difficulty: 'Medium',
    category: 'Number and Pattern Programs',
    statement: 'An Armstrong number (narcissistic number) of D digits equals the sum of its digits each raised to power D. Given positive integer N, print "true" if Armstrong, otherwise "false".',
    constraints: '1 <= N <= 10^7',
    sample_input: '153',
    sample_output: 'true',
    sample_test_cases: [
      { input: '153', expected_output: 'true' },
      { input: '123', expected_output: 'false' }
    ],
    hidden_test_cases: [
      { input: '370', expected_output: 'true' },
      { input: '9474', expected_output: 'true' },
      { input: '500', expected_output: 'false' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        long long temp = n, sum = 0;\n        int digits = 0;\n        while (temp > 0) { digits++; temp /= 10; }\n        temp = n;\n        while (temp > 0) {\n            int d = temp % 10;\n            long long p = 1;\n            for (int i = 0; i < digits; i++) p *= d;\n            sum += p;\n            temp /= 10;\n        }\n        printf("%s\\n", sum == n ? "true" : "false");\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        long long temp = n, sum = 0;\n        int digits = 0;\n        while (temp > 0) { digits++; temp /= 10; }\n        temp = n;\n        while (temp > 0) {\n            int d = temp % 10;\n            long long p = 1;\n            for (int i = 0; i < digits; i++) p *= d;\n            sum += p;\n            temp /= 10;\n        }\n        cout << (sum == n ? "true" : "false") << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    if not s: return\n    n = int(s)\n    d = len(s)\n    total = sum(int(ch)**d for ch in s)\n    print("true" if total == n else "false")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        long n = Long.parseLong(s);\n        int d = s.length();\n        long sum = 0;\n        for (char c : s.toCharArray()) {\n            sum += Math.pow(c - \'0\', d);\n        }\n        System.out.println(sum == n ? "true" : "false");\n    }\n}',
      mysql: 'SELECT val, is_armstrong FROM armstrong_lookup WHERE val = 153;'
    }
  },

  // 9. Reverse a Number
  {
    id: 'code-9',
    title: 'Reverse a Number',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Given an integer N, print its digits in reverse order. Preserve negative sign if N < 0. Strip leading zeros after reversing.',
    constraints: '-10^9 <= N <= 10^9',
    sample_input: '1234',
    sample_output: '4321',
    sample_test_cases: [
      { input: '1234', expected_output: '4321' },
      { input: '-560', expected_output: '-65' }
    ],
    hidden_test_cases: [
      { input: '1000', expected_output: '1' },
      { input: '0', expected_output: '0' },
      { input: '-9', expected_output: '-9' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        int sign = n < 0 ? -1 : 1;\n        n = llabs(n);\n        long long rev = 0;\n        while (n > 0) { rev = rev * 10 + (n % 10); n /= 10; }\n        printf("%lld\\n", rev * sign);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        int sign = n < 0 ? -1 : 1;\n        n = abs(n);\n        long long rev = 0;\n        while (n > 0) { rev = rev * 10 + (n % 10); n /= 10; }\n        cout << rev * sign << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    if not s: return\n    n = int(s)\n    sign = -1 if n < 0 else 1\n    rev = int(str(abs(n))[::-1]) * sign\n    print(rev)\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        int sign = n < 0 ? -1 : 1;\n        n = Math.abs(n);\n        long rev = 0;\n        while (n > 0) { rev = rev * 10 + (n % 10); n /= 10; }\n        System.out.println(rev * sign);\n    }\n}',
      mysql: 'SELECT CAST(REVERSE(val) AS SIGNED) AS reversed FROM numbers;'
    }
  },

  // 10. Sum of Digits
  {
    id: 'code-10',
    title: 'Sum of Digits',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Given an integer N, calculate and print the sum of its individual digits. (Ignore any negative sign).',
    constraints: '-10^12 <= N <= 10^12',
    sample_input: '987',
    sample_output: '24',
    sample_test_cases: [
      { input: '987', expected_output: '24' },
      { input: '1000', expected_output: '1' }
    ],
    hidden_test_cases: [
      { input: '0', expected_output: '0' },
      { input: '-456', expected_output: '15' },
      { input: '99999', expected_output: '45' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        n = llabs(n);\n        long long sum = 0;\n        while (n > 0) { sum += (n % 10); n /= 10; }\n        printf("%lld\\n", sum);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        n = abs(n);\n        long long sum = 0;\n        while (n > 0) { sum += (n % 10); n /= 10; }\n        cout << sum << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    if not s: return\n    digits = [int(c) for c in s if c.isdigit()]\n    print(sum(digits))\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        long sum = 0;\n        for (char c : s.toCharArray()) {\n            if (Character.isDigit(c)) sum += (c - \'0\');\n        }\n        System.out.println(sum);\n    }\n}',
      mysql: 'SELECT val, digit_sum FROM numbers;'
    }
  },

  // 11. Count Digits
  {
    id: 'code-11',
    title: 'Count Digits in a Number',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Given an integer N, count and print the total number of digits in N. Note that 0 has 1 digit.',
    constraints: '-10^18 <= N <= 10^18',
    sample_input: '1560',
    sample_output: '4',
    sample_test_cases: [
      { input: '1560', expected_output: '4' },
      { input: '0', expected_output: '1' }
    ],
    hidden_test_cases: [
      { input: '-789', expected_output: '3' },
      { input: '1000000', expected_output: '7' },
      { input: '5', expected_output: '1' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        if (n == 0) { printf("1\\n"); return 0; }\n        n = llabs(n);\n        int count = 0;\n        while (n > 0) { count++; n /= 10; }\n        printf("%d\\n", count);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        if (n == 0) { cout << 1 << endl; return 0; }\n        n = abs(n);\n        int count = 0;\n        while (n > 0) { count++; n /= 10; }\n        cout << count << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    if not s: return\n    digits = [c for c in s if c.isdigit()]\n    print(len(digits) if digits else 1)\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        if (n == 0) { System.out.println(1); return; }\n        n = Math.abs(n);\n        int count = 0;\n        while (n > 0) { count++; n /= 10; }\n        System.out.println(count);\n    }\n}',
      mysql: 'SELECT LENGTH(CAST(ABS(val) AS CHAR)) AS digit_count FROM numbers;'
    }
  },

  // 12. GCD and LCM
  {
    id: 'code-12',
    title: 'GCD and LCM of Two Numbers',
    difficulty: 'Medium',
    category: 'Number and Pattern Programs',
    statement: 'Given two positive integers A and B, compute their Greatest Common Divisor (GCD) and Least Common Multiple (LCM). Print "GCD LCM" separated by a space.',
    constraints: '1 <= A, B <= 10^9',
    sample_input: '12 18',
    sample_output: '6 36',
    sample_test_cases: [
      { input: '12 18', expected_output: '6 36' },
      { input: '7 13', expected_output: '1 91' }
    ],
    hidden_test_cases: [
      { input: '25 50', expected_output: '25 50' },
      { input: '100 100', expected_output: '100 100' },
      { input: '14 21', expected_output: '7 42' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nlong long gcd(long long a, long long b) {\n    while (b) { long long t = b; b = a % b; a = t; }\n    return a;\n}\n\nint main() {\n    long long a, b;\n    if (scanf("%lld %lld", &a, &b) == 2) {\n        long long g = gcd(a, b);\n        long long l = (a / g) * b;\n        printf("%lld %lld\\n", g, l);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <numeric>\nusing namespace std;\n\nlong long gcd_fn(long long a, long long b) {\n    while (b) { long long t = b; b = a % b; a = t; }\n    return a;\n}\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        long long g = gcd_fn(a, b);\n        long long l = (a / g) * b;\n        cout << g << " " << l << endl;\n    }\n    return 0;\n}',
      python: 'import sys, math\n\ndef solve():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if len(nums) >= 2:\n        a, b = nums[0], nums[1]\n        g = math.gcd(a, b)\n        l = (a * b) // g\n        print(f"{g} {l}")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    static long gcd(long a, long b) {\n        while (b != 0) { long t = b; b = a % b; a = t; }\n        return a;\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong();\n        long b = sc.nextLong();\n        long g = gcd(a, b);\n        long l = (a / g) * b;\n        System.out.println(g + " " + l);\n    }\n}',
      mysql: 'SELECT gcd_val, lcm_val FROM math_pairs;'
    }
  },

  // 13. Perfect Number
  {
    id: 'code-13',
    title: 'Perfect Number Checker',
    difficulty: 'Medium',
    category: 'Number and Pattern Programs',
    statement: 'A perfect number is a positive integer equal to the sum of its proper positive divisors (excluding itself). Given N, print "true" if perfect, else "false".',
    constraints: '1 <= N <= 10^7',
    sample_input: '28',
    sample_output: 'true',
    sample_test_cases: [
      { input: '28', expected_output: 'true' },
      { input: '12', expected_output: 'false' }
    ],
    hidden_test_cases: [
      { input: '6', expected_output: 'true' },
      { input: '496', expected_output: 'true' },
      { input: '1', expected_output: 'false' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        if (n <= 1) { printf("false\\n"); return 0; }\n        long long sum = 1;\n        for (long long i = 2; i * i <= n; i++) {\n            if (n % i == 0) {\n                sum += i;\n                if (i * i != n) sum += (n / i);\n            }\n        }\n        printf("%s\\n", sum == n ? "true" : "false");\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        if (n <= 1) { cout << "false" << endl; return 0; }\n        long long sum = 1;\n        for (long long i = 2; i * i <= n; i++) {\n            if (n % i == 0) {\n                sum += i;\n                if (i * i != n) sum += (n / i);\n            }\n        }\n        cout << (sum == n ? "true" : "false") << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    if n <= 1: print("false"); return\n    div_sum = 1\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            div_sum += i\n            if i * i != n: div_sum += (n // i)\n    print("true" if div_sum == n else "false")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        if (n <= 1) { System.out.println("false"); return; }\n        long sum = 1;\n        for (long i = 2; i * i <= n; i++) {\n            if (n % i == 0) {\n                sum += i;\n                if (i * i != n) sum += (n / i);\n            }\n        }\n        System.out.println(sum == n ? "true" : "false");\n    }\n}',
      mysql: 'SELECT val, is_perfect FROM perfect_lookup WHERE val = 28;'
    }
  },

  // 14. Largest and Smallest Array Elements
  {
    id: 'code-14',
    title: 'Largest and Smallest Array Elements',
    difficulty: 'Medium',
    category: 'Arrays and Strings',
    statement: 'Given an array of N integers, find the minimum and maximum elements in the array. Print "MIN MAX" separated by a space.',
    constraints: '1 <= N <= 10^5, -10^9 <= A[i] <= 10^9',
    sample_input: '5\n3 1 9 7 5',
    sample_output: '1 9',
    sample_test_cases: [
      { input: '5\n3 1 9 7 5', expected_output: '1 9' },
      { input: '1\n42', expected_output: '42 42' }
    ],
    hidden_test_cases: [
      { input: '4\n-10 -5 -20 -1', expected_output: '-20 -1' },
      { input: '3\n100 100 100', expected_output: '100 100' },
      { input: '6\n0 50 -50 25 -25 10', expected_output: '-50 50' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1 && n > 0) {\n        long long min_val, max_val, v;\n        scanf("%lld", &v);\n        min_val = max_val = v;\n        for (int i = 1; i < n; i++) {\n            scanf("%lld", &v);\n            if (v < min_val) min_val = v;\n            if (v > max_val) max_val = v;\n        }\n        printf("%lld %lld\\n", min_val, max_val);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n && n > 0) {\n        long long min_v, max_v, v;\n        cin >> v;\n        min_v = max_v = v;\n        for (int i = 1; i < n; i++) {\n            cin >> v;\n            min_v = min(min_v, v);\n            max_v = max(max_v, v);\n        }\n        cout << min_v << " " << max_v << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if not nums: return\n    n = nums[0]\n    arr = nums[1:n+1]\n    print(f"{min(arr)} {max(arr)}")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long minV = sc.nextLong();\n        long maxV = minV;\n        for (int i = 1; i < n; i++) {\n            long v = sc.nextLong();\n            if (v < minV) minV = v;\n            if (v > maxV) maxV = v;\n        }\n        System.out.println(minV + " " + maxV);\n    }\n}',
      mysql: 'SELECT MIN(val) AS min_val, MAX(val) AS max_val FROM Numbers;'
    }
  },

  // 15. Duplicate Elements in an Array
  {
    id: 'code-15',
    title: 'Duplicate Elements in an Array',
    difficulty: 'Medium',
    category: 'Arrays and Strings',
    statement: 'Given an array of N integers, find all unique elements that appear more than once. Print them in ascending order separated by space. If no duplicates, print "-1".',
    constraints: '1 <= N <= 10^5',
    sample_input: '6\n1 2 3 2 1 4',
    sample_output: '1 2',
    sample_test_cases: [
      { input: '6\n1 2 3 2 1 4', expected_output: '1 2' },
      { input: '4\n1 2 3 4', expected_output: '-1' }
    ],
    hidden_test_cases: [
      { input: '5\n5 5 5 5 5', expected_output: '5' },
      { input: '7\n9 8 7 9 8 6 5', expected_output: '8 9' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <stdlib.h>\n\nint cmp(const void *a, const void *b) {\n    return (*(int*)a - *(int*)b);\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        int *a = malloc(n * sizeof(int));\n        for (int i = 0; i < n; i++) scanf("%d", &a[i]);\n        qsort(a, n, sizeof(int), cmp);\n        int found = 0, last_printed = -1e9;\n        for (int i = 1; i < n; i++) {\n            if (a[i] == a[i-1] && a[i] != last_printed) {\n                if (found > 0) printf(" ");\n                printf("%d", a[i]);\n                last_printed = a[i];\n                found++;\n            }\n        }\n        if (found == 0) printf("-1");\n        printf("\\n");\n        free(a);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <vector>\n#include <map>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        map<int, int> counts;\n        for (int i = 0; i < n; i++) { int x; cin >> x; counts[x]++; }\n        vector<int> dups;\n        for (auto &p : counts) if (p.second > 1) dups.push_back(p.first);\n        if (dups.empty()) cout << -1 << endl;\n        else {\n            for (size_t i = 0; i < dups.size(); i++) cout << dups[i] << (i + 1 < dups.size() ? " " : "\\n");\n        }\n    }\n    return 0;\n}',
      python: 'import sys\nfrom collections import Counter\n\ndef solve():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if not nums: return\n    n = nums[0]\n    arr = nums[1:n+1]\n    counts = Counter(arr)\n    dups = sorted([k for k, v in counts.items() if v > 1])\n    print(" ".join(map(str, dups)) if dups else "-1")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        Map<Integer, Integer> map = new TreeMap<>();\n        for (int i = 0; i < n; i++) {\n            int x = sc.nextInt();\n            map.put(x, map.getOrDefault(x, 0) + 1);\n        }\n        List<Integer> dups = new ArrayList<>();\n        for (var e : map.entrySet()) if (e.getValue() > 1) dups.add(e.getKey());\n        if (dups.isEmpty()) System.out.println("-1");\n        else {\n            for (int i = 0; i < dups.size(); i++) System.out.print(dups.get(i) + (i + 1 < dups.size() ? " " : "\\n"));\n        }\n    }\n}',
      mysql: 'SELECT val FROM items GROUP BY val HAVING COUNT(*) > 1 ORDER BY val;'
    }
  },

  // 16. Reverse a String
  {
    id: 'code-16',
    title: 'Reverse a String',
    difficulty: 'Easy',
    category: 'Arrays and Strings',
    statement: 'Given a string S containing alphanumeric characters, print the reversed string.',
    constraints: '1 <= Length(S) <= 10^5',
    sample_input: 'InterviewIQ',
    sample_output: 'QIvanretnI',
    sample_test_cases: [
      { input: 'InterviewIQ', expected_output: 'QIewivretnI' },
      { input: 'hello', expected_output: 'olleh' }
    ],
    hidden_test_cases: [
      { input: 'a', expected_output: 'a' },
      { input: 'recruiter', expected_output: 'retiurcer' },
      { input: '12345', expected_output: '54321' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100000];\n    if (scanf("%s", s) == 1) {\n        int len = strlen(s);\n        for (int i = len - 1; i >= 0; i--) putchar(s[i]);\n        putchar(\'\\n\');\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        reverse(s.begin(), s.end());\n        cout << s << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    if s:\n        print(s[::-1])\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(new StringBuilder(s).reverse().toString());\n        }\n    }\n}',
      mysql: 'SELECT REVERSE(name) FROM Employees;'
    }
  },

  // 17. String Palindrome
  {
    id: 'code-17',
    title: 'String Palindrome Checker',
    difficulty: 'Easy',
    category: 'Arrays and Strings',
    statement: 'Given a string S (case-insensitive), determine if S is a palindrome. Output "true" if palindrome, otherwise "false".',
    constraints: '1 <= Length(S) <= 10^5',
    sample_input: 'Racecar',
    sample_output: 'true',
    sample_test_cases: [
      { input: 'Racecar', expected_output: 'true' },
      { input: 'developer', expected_output: 'false' }
    ],
    hidden_test_cases: [
      { input: 'madam', expected_output: 'true' },
      { input: 'Noon', expected_output: 'true' },
      { input: 'code', expected_output: 'false' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main() {\n    char s[100000];\n    if (scanf("%s", s) == 1) {\n        int l = 0, r = strlen(s) - 1;\n        int is_pal = 1;\n        while (l < r) {\n            if (tolower(s[l]) != tolower(s[r])) { is_pal = 0; break; }\n            l++; r--;\n        }\n        printf("%s\\n", is_pal ? "true" : "false");\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        int l = 0, r = s.length() - 1;\n        bool pal = true;\n        while (l < r) {\n            if (tolower(s[l]) != tolower(s[r])) { pal = false; break; }\n            l++; r--;\n        }\n        cout << (pal ? "true" : "false") << endl;\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    s = sys.stdin.read().strip().lower()\n    if s:\n        print("true" if s == s[::-1] else "false")\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next().toLowerCase();\n        String rev = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(rev) ? "true" : "false");\n    }\n}',
      mysql: 'SELECT str, CASE WHEN LOWER(str) = REVERSE(LOWER(str)) THEN \'true\' ELSE \'false\' END AS is_pal FROM words;'
    }
  },

  // 18. Sort an Array
  {
    id: 'code-18',
    title: 'Sort an Array (Ascending)',
    difficulty: 'Medium',
    category: 'Searching, Sorting, and Data Structures',
    statement: 'Given an array of N integers, sort the elements in non-decreasing order and print them separated by space.',
    constraints: '1 <= N <= 10^5, -10^9 <= A[i] <= 10^9',
    sample_input: '5\n5 2 9 1 5',
    sample_output: '1 2 5 5 9',
    sample_test_cases: [
      { input: '5\n5 2 9 1 5', expected_output: '1 2 5 5 9' },
      { input: '3\n-3 -1 -2', expected_output: '-3 -2 -1' }
    ],
    hidden_test_cases: [
      { input: '1\n100', expected_output: '100' },
      { input: '4\n10 20 30 40', expected_output: '10 20 30 40' },
      { input: '6\n0 -5 5 -10 10 0', expected_output: '-10 -5 0 0 5 10' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n#include <stdlib.h>\n\nint cmp(const void *a, const void *b) {\n    long long diff = (*(long long*)a - *(long long*)b);\n    return (diff > 0) - (diff < 0);\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1 && n > 0) {\n        long long *a = malloc(n * sizeof(long long));\n        for (int i = 0; i < n; i++) scanf("%lld", &a[i]);\n        qsort(a, n, sizeof(long long), cmp);\n        for (int i = 0; i < n; i++) printf("%lld%s", a[i], i + 1 < n ? " " : "\\n");\n        free(a);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n && n > 0) {\n        vector<long long> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        sort(a.begin(), a.end());\n        for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\\n");\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if not nums: return\n    n = nums[0]\n    arr = sorted(nums[1:n+1])\n    print(" ".join(map(str, arr)))\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextLong();\n        Arrays.sort(a);\n        for (int i = 0; i < n; i++) System.out.print(a[i] + (i + 1 < n ? " " : "\\n"));\n    }\n}',
      mysql: 'SELECT val FROM Numbers ORDER BY val ASC;'
    }
  },

  // 19. Linear and Binary Search
  {
    id: 'code-19',
    title: 'Linear and Binary Search',
    difficulty: 'Medium',
    category: 'Searching, Sorting, and Data Structures',
    statement: 'Given a sorted array of N unique integers and a target value K, find the 0-based index of K. If K is not present in the array, print "-1".',
    constraints: '1 <= N <= 10^5, -10^9 <= A[i], K <= 10^9',
    sample_input: '5 7\n1 3 5 7 9',
    sample_output: '3',
    sample_test_cases: [
      { input: '5 7\n1 3 5 7 9', expected_output: '3' },
      { input: '4 10\n2 4 6 8', expected_output: '-1' }
    ],
    hidden_test_cases: [
      { input: '1 5\n5', expected_output: '0' },
      { input: '6 -2\n-10 -5 -2 0 4 8', expected_output: '2' },
      { input: '5 1\n2 4 6 8 10', expected_output: '-1' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    int n; long long k;\n    if (scanf("%d %lld", &n, &k) == 2) {\n        int ans = -1;\n        for (int i = 0; i < n; i++) {\n            long long val; scanf("%lld", &val);\n            if (val == k && ans == -1) ans = i;\n        }\n        printf("%d\\n", ans);\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n; long long k;\n    if (cin >> n >> k) {\n        vector<long long> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        auto it = lower_bound(a.begin(), a.end(), k);\n        if (it != a.end() && *it == k) cout << (it - a.begin()) << endl;\n        else cout << -1 << endl;\n    }\n    return 0;\n}',
      python: 'import sys, bisect\n\ndef solve():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if len(nums) < 2: return\n    n, k = nums[0], nums[1]\n    arr = nums[2:n+2]\n    idx = bisect.bisect_left(arr, k)\n    if idx < len(arr) and arr[idx] == k:\n        print(idx)\n    else:\n        print(-1)\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long k = sc.nextLong();\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextLong();\n        int idx = Arrays.binarySearch(a, k);\n        System.out.println(idx >= 0 ? idx : -1);\n    }\n}',
      mysql: 'SELECT id - 1 AS idx FROM items WHERE val = 7;'
    }
  },

  // 20. Star and Number Patterns
  {
    id: 'code-20',
    title: 'Right-Angled Star Pattern',
    difficulty: 'Easy',
    category: 'Number and Pattern Programs',
    statement: 'Given an integer N (1 <= N <= 20), print a right-angled triangle pattern of stars with N rows. Row i (1-indexed) contains i asterisks ("*").',
    constraints: '1 <= N <= 20',
    sample_input: '4',
    sample_output: '*\n**\n***\n****',
    sample_test_cases: [
      { input: '3', expected_output: '*\n**\n***' },
      { input: '1', expected_output: '*' }
    ],
    hidden_test_cases: [
      { input: '2', expected_output: '*\n**' },
      { input: '5', expected_output: '*\n**\n***\n****\n*****' }
    ],
    starter_code: {
      c: '#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) putchar(\'*\');\n            putchar(\'\\n\');\n        }\n    }\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        for (int i = 1; i <= n; i++) {\n            cout << string(i, \'*\') << endl;\n        }\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    for i in range(1, n + 1):\n        print("*" * i)\n\nif __name__ == "__main__":\n    solve()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 1; i <= n; i++) {\n            System.out.println("*".repeat(i));\n        }\n    }\n}',
      mysql: 'SELECT REPEAT(\'*\', id) AS stars FROM Numbers LIMIT 4;'
    }
  },

  // 21. MySQL: Department Highest Salary
  {
    id: 'code-sql-1',
    title: 'Department Highest Salary (MySQL)',
    difficulty: 'Medium',
    category: 'SQL and DBMS',
    statement: 'Write a SQL query to find employees who have the highest salary in each of the departments.\n\nTable: Employee (id INT, name VARCHAR, salary INT, departmentId INT)\nTable: Department (id INT, name VARCHAR)\n\nReturn the result table with columns: Department, Employee, Salary in any order.',
    constraints: 'Standard SQL queries',
    sample_input: 'Schema: Employee, Department',
    sample_output: 'IT | Max | 90000\nSales | Henry | 80000',
    sample_test_cases: [
      {
        input: 'SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId);',
        expected_output: 'IT | Max | 90000\nSales | Henry | 80000'
      }
    ],
    hidden_test_cases: [
      {
        input: 'Department salary max validation',
        expected_output: 'IT | Max | 90000\nSales | Henry | 80000'
      }
    ],
    starter_code: {
      mysql: 'SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n    SELECT departmentId, MAX(salary)\n    FROM Employee\n    GROUP BY departmentId\n);',
      c: '// Not applicable for SQL challenge',
      cpp: '// Not applicable for SQL challenge',
      python: '# SQL Query challenge - write query in mysql tab',
      java: '// Not applicable for SQL challenge'
    }
  },

  // 22. MySQL: Second Highest Salary
  {
    id: 'code-sql-2',
    title: 'Second Highest Salary (MySQL)',
    difficulty: 'Medium',
    category: 'SQL and DBMS',
    statement: 'Write a SQL query to find the second highest distinct salary from the Employee table.\n\nTable: Employee (id INT, name VARCHAR, salary INT, departmentId INT)\n\nReturn column name: SecondHighestSalary.',
    constraints: 'Standard SQL queries',
    sample_input: 'Schema: Employee',
    sample_output: '80000',
    sample_test_cases: [
      {
        input: 'SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1) AS SecondHighestSalary;',
        expected_output: '80000'
      }
    ],
    hidden_test_cases: [
      {
        input: 'Second highest salary verification',
        expected_output: '80000'
      }
    ],
    starter_code: {
      mysql: 'SELECT (\n    SELECT DISTINCT salary\n    FROM Employee\n    ORDER BY salary DESC\n    LIMIT 1 OFFSET 1\n) AS SecondHighestSalary;',
      c: '// Not applicable for SQL challenge',
      cpp: '// Not applicable for SQL challenge',
      python: '# SQL Query challenge',
      java: '// Not applicable for SQL challenge'
    }
  },

  // 23. MySQL: Customers Who Never Order
  {
    id: 'code-sql-3',
    title: 'Customers Who Never Order (MySQL)',
    difficulty: 'Easy',
    category: 'SQL and DBMS',
    statement: 'Write a SQL query to report all customers who never placed any orders.\n\nTable: Customers (id INT, name VARCHAR)\nTable: Orders (id INT, customerId INT, amount INT)\n\nReturn column name: Customers.',
    constraints: 'Standard SQL queries',
    sample_input: 'Schema: Customers, Orders',
    sample_output: 'Henry\nMax',
    sample_test_cases: [
      {
        input: 'SELECT name AS Customers FROM Customers WHERE id NOT IN (SELECT customerId FROM Orders);',
        expected_output: 'Henry\nMax'
      }
    ],
    hidden_test_cases: [
      {
        input: 'Customers with no orders verification',
        expected_output: 'Henry\nMax'
      }
    ],
    starter_code: {
      mysql: 'SELECT name AS Customers\nFROM Customers\nWHERE id NOT IN (\n    SELECT customerId FROM Orders\n);',
      c: '// Not applicable for SQL challenge',
      cpp: '// Not applicable for SQL challenge',
      python: '# SQL Query challenge',
      java: '// Not applicable for SQL challenge'
    }
  }
];
