// PREMIUM question bank: company-specific interview questions + bonus questions.
// Only Premium members can open these. Same format as curriculum.js (each has its own tests).
//
// Note for the UI: these are "inspired by interview patterns commonly reported for each company",
// not official questions from the companies.

const md = (...lines) => lines.join('\n');
const T = (call, expected) => ({ call, expected });

const tip = (text) => md('### 🎯 What the interviewer looks for', '', text, '');

const premiumCurriculum = [
  // ───────────── TCS ─────────────
  {
    company: 'TCS', title: 'Palindrome Check', difficulty: 'EASY', xpReward: 150,
    lesson: md(tip('Can you compare a value with its own reverse? Basic string handling is asked in almost every TCS written round.'),
      '### Approach', '', '- A string is a **palindrome** if it reads the same forwards and backwards.', '- In Python, `text[::-1]` gives the reversed string.', '- `.lower()` makes `"Racecar"` and `"racecar"` equal.'),
    description: "Write a function `is_palindrome(text)` that returns `True` if the text reads the same forwards and backwards, ignoring upper/lowercase. Example: `is_palindrome('Racecar')` is `True`.",
    solution: md('### Solution', '```python', 'def is_palindrome(text):', '    t = text.lower()', '    return t == t[::-1]', '```', '### Dry Run', "1. Input `'Racecar'`, lowercased: `'racecar'`.", "2. Reversed: `'racecar'`.", '3. Both are equal, so it returns `True`.'),
    tests: [T("is_palindrome('madam')", 'True'), T("is_palindrome('hello')", 'False'), T("is_palindrome('Racecar')", 'True'), T("is_palindrome('a')", 'True'), T("is_palindrome('ab')", 'False')],
  },
  {
    company: 'TCS', title: 'Prime Number', difficulty: 'NORMAL', xpReward: 200,
    lesson: md(tip('A loop with a clear stopping rule. Bonus points if you stop at the square root instead of checking every number.'),
      '### Approach', '', '- A prime is a number above 1 that only divides evenly by 1 and itself.', '- Numbers below 2 are never prime.', '- Try dividing by every number from 2 up to `n - 1`. If any divides evenly (`n % i == 0`), it is not prime.', '- Faster: you only need to check up to the square root of n.'),
    description: 'Write a function `is_prime(n)` that returns `True` if n is a prime number, otherwise `False`. Remember that 0 and 1 are not prime.',
    solution: md('### Solution', '```python', 'def is_prime(n):', '    if n < 2:', '        return False', '    for i in range(2, int(n ** 0.5) + 1):', '        if n % i == 0:', '            return False', '    return True', '```', '### Dry Run', '1. Input `n = 15`.', '2. The loop checks i = 2 (no), i = 3: `15 % 3 == 0`.', '3. Found a divisor, so it returns `False`.'),
    tests: [T('is_prime(2)', 'True'), T('is_prime(1)', 'False'), T('is_prime(15)', 'False'), T('is_prime(17)', 'True'), T('is_prime(0)', 'False'), T('is_prime(97)', 'True')],
  },
  {
    company: 'TCS', title: 'Sum of Digits', difficulty: 'EASY', xpReward: 150,
    lesson: md(tip('Working with the digits of a number using `%` and `//`, without turning it into a string.'),
      '### Approach', '', '- `n % 10` gives the last digit.', '- `n // 10` removes the last digit.', '- Repeat until the number becomes 0, adding each last digit to a total.'),
    description: 'Write a function `digit_sum(n)` that returns the sum of the digits of a non-negative number. Example: `digit_sum(123)` returns 6.',
    solution: md('### Solution', '```python', 'def digit_sum(n):', '    total = 0', '    while n > 0:', '        total += n % 10', '        n = n // 10', '    return total', '```', '### Dry Run', '1. Input `n = 123`.', '2. Last digit 3, total 3, n becomes 12.', '3. Last digit 2, total 5, n becomes 1.', '4. Last digit 1, total 6, n becomes 0. Returns `6`.'),
    tests: [T('digit_sum(123)', '6'), T('digit_sum(9)', '9'), T('digit_sum(1000)', '1'), T('digit_sum(0)', '0'), T('digit_sum(98765)', '35')],
  },

  // ───────────── Infosys ─────────────
  {
    company: 'Infosys', title: 'Reverse a String', difficulty: 'EASY', xpReward: 150,
    lesson: md(tip('Do you understand that strings are sequences you can walk through? Try it with a loop first, then show the slicing shortcut.'),
      '### Approach', '', '- Slicing with a negative step reverses: `text[::-1]`.', '- Loop version: go through the letters and add each one to the **front** of a new string.'),
    description: "Write a function `reverse_string(text)` that returns the text backwards. Example: `reverse_string('hello')` returns `olleh`.",
    solution: md('### Solution', '```python', 'def reverse_string(text):', "    result = ''", '    for letter in text:', '        result = letter + result', '    return result', '```', '(Shortcut: `return text[::-1]`)', '### Dry Run', "1. Input `'abc'`.", "2. `'a'` then `'b' + 'a'` = `'ba'`, then `'c' + 'ba'` = `'cba'`.", "3. Returns `'cba'`."),
    tests: [T("reverse_string('hello')", 'olleh'), T("reverse_string('Python')", 'nohtyP'), T("reverse_string('a')", 'a'), T("reverse_string('abc def')", 'fed cba')],
  },
  {
    company: 'Infosys', title: 'Armstrong Number', difficulty: 'NORMAL', xpReward: 250,
    lesson: md(tip('Combining digit extraction with powers. A classic in Infosys and many campus drives.'),
      '### Approach', '', '- An **Armstrong number** equals the sum of each digit raised to the power of the number of digits.', '- Example: 153 has 3 digits, and `1**3 + 5**3 + 3**3 = 153`.', '- Convert to text to count the digits with `len(str(n))`.'),
    description: 'Write a function `is_armstrong(n)` that returns `True` if n is an Armstrong number, otherwise `False`. Example: 153 is an Armstrong number, 123 is not.',
    solution: md('### Solution', '```python', 'def is_armstrong(n):', '    digits = str(n)', '    power = len(digits)', '    total = 0', '    for d in digits:', '        total += int(d) ** power', '    return total == n', '```', '### Dry Run', '1. Input `n = 153`: digits `"153"`, power 3.', '2. `1 + 125 + 27 = 153`.', '3. Equal to n, so it returns `True`.'),
    tests: [T('is_armstrong(153)', 'True'), T('is_armstrong(370)', 'True'), T('is_armstrong(123)', 'False'), T('is_armstrong(9)', 'True'), T('is_armstrong(9474)', 'True'), T('is_armstrong(100)', 'False')],
  },
  {
    company: 'Infosys', title: 'Fibonacci Number', difficulty: 'NORMAL', xpReward: 250,
    lesson: md(tip('Can you keep track of two changing values in a loop? Interviewers often follow up by asking about recursion.'),
      '### Approach', '', '- The sequence starts `0, 1, 1, 2, 3, 5, 8 ...`. Each number is the sum of the two before it.', '- Keep two variables, `a` and `b`, and move them forward `n` times.', '- Python lets you update both at once: `a, b = b, a + b`.'),
    description: 'Write a function `fibonacci(n)` that returns the n-th Fibonacci number, counting from 0. So `fibonacci(0)` is 0, `fibonacci(1)` is 1 and `fibonacci(7)` is 13.',
    solution: md('### Solution', '```python', 'def fibonacci(n):', '    a, b = 0, 1', '    for i in range(n):', '        a, b = b, a + b', '    return a', '```', '### Dry Run', '1. Input `n = 4`. Start `a=0, b=1`.', '2. After loop 1: `a=1, b=1`. Loop 2: `a=1, b=2`.', '3. Loop 3: `a=2, b=3`. Loop 4: `a=3, b=5`.', '4. Returns `3`.'),
    tests: [T('fibonacci(0)', '0'), T('fibonacci(1)', '1'), T('fibonacci(2)', '1'), T('fibonacci(7)', '13'), T('fibonacci(10)', '55'), T('fibonacci(20)', '6765')],
  },

  // ───────────── Amazon ─────────────
  {
    company: 'Amazon', title: 'Pair With Target Sum', difficulty: 'NORMAL', xpReward: 300,
    lesson: md(tip('This is the famous "Two Sum" idea. Start with two loops (checking every pair), then explain how a `set` makes it faster.'),
      '### Approach', '', '- Check every pair of **different positions** `i` and `j`.', '- You may not use the same item twice: `[4]` with target 8 is `False`.', '- Faster idea: while looping, keep a set of numbers seen so far. For each number, check if `target - number` is already in the set.'),
    description: 'Write a function `has_pair_with_sum(nums, target)` that returns `True` if two different items in the list add up to `target`, otherwise `False`.',
    solution: md('### Solution', '```python', 'def has_pair_with_sum(nums, target):', '    seen = set()', '    for n in nums:', '        if target - n in seen:', '            return True', '        seen.add(n)', '    return False', '```', '### Dry Run', '1. Input `[2, 7, 11]`, target 9. `seen` is empty.', '2. n = 2: is 7 in seen? No. Add 2.', '3. n = 7: is 2 in seen? Yes! Returns `True`.'),
    tests: [T('has_pair_with_sum([2, 7, 11, 15], 9)', 'True'), T('has_pair_with_sum([1, 2, 3], 7)', 'False'), T('has_pair_with_sum([3, 3], 6)', 'True'), T('has_pair_with_sum([5], 10)', 'False'), T('has_pair_with_sum([4], 8)', 'False'), T('has_pair_with_sum([], 0)', 'False')],
  },
  {
    company: 'Amazon', title: 'First Unique Character', difficulty: 'NORMAL', xpReward: 300,
    lesson: md(tip('Counting how often things appear, then answering a question about the counts. A dictionary or `.count()` both work.'),
      '### Approach', '', '- Go through the letters in order.', '- For each letter, check how many times it appears in the whole text: `text.count(letter)`.', '- The first letter with a count of 1 is the answer.', '- If none is unique, return the text `-`.'),
    description: "Write a function `first_unique_char(text)` that returns the first character that appears only once in the text. If every character repeats, return `-`. Example: `first_unique_char('leetcode')` returns `l`.",
    solution: md('### Solution', '```python', 'def first_unique_char(text):', '    for letter in text:', '        if text.count(letter) == 1:', '            return letter', "    return '-'", '```', '### Dry Run', "1. Input `'aabc'`.", '2. `a` appears 2 times, skip it.', '3. `b` appears once, so return `b`.'),
    tests: [T("first_unique_char('leetcode')", 'l'), T("first_unique_char('aabb')", '-'), T("first_unique_char('loveleetcode')", 'v'), T("first_unique_char('z')", 'z')],
  },

  // ───────────── Google ─────────────
  {
    company: 'Google', title: 'Valid Brackets', difficulty: 'HARD', xpReward: 400,
    lesson: md(tip('Do you recognise the **stack** pattern (last in, first out)? A very common question in big-tech interviews.'),
      '### Approach', '', '- Use a list as a stack: `stack.append(x)` adds, `stack.pop()` removes the last item.', '- When you see an opening bracket `(`, `[` or `{`, push it.', '- When you see a closing bracket, the top of the stack must be its matching opener, otherwise the text is invalid.', '- At the end the stack must be empty.'),
    description: "Write a function `is_valid_brackets(text)` that returns `True` if every bracket in the text ( `()`, `[]`, `{}` ) is closed in the correct order, otherwise `False`. Example: `'{[]}'` is valid, `'([)]'` is not. An empty string is valid.",
    solution: md('### Solution', '```python', 'def is_valid_brackets(text):', "    pairs = {')': '(', ']': '[', '}': '{'}", '    stack = []', '    for ch in text:', "        if ch in '([{':", '            stack.append(ch)', '        elif ch in pairs:', '            if not stack or stack.pop() != pairs[ch]:', '                return False', '    return len(stack) == 0', '```', '### Dry Run', "1. Input `'([)]'`.", "2. Push `(`, push `[`.", "3. See `)`: the top is `[`, not `(`. Returns `False`."),
    tests: [T("is_valid_brackets('()')", 'True'), T("is_valid_brackets('()[]{}')", 'True'), T("is_valid_brackets('(]')", 'False'), T("is_valid_brackets('([)]')", 'False'), T("is_valid_brackets('{[]}')", 'True'), T("is_valid_brackets('(')", 'False'), T("is_valid_brackets('')", 'True')],
  },
  {
    company: 'Google', title: 'Anagram Check', difficulty: 'NORMAL', xpReward: 250,
    lesson: md(tip('Can you find a simple way to compare two words ignoring the order of letters? Sorting is the easy trick.'),
      '### Approach', '', '- Two words are **anagrams** if they use exactly the same letters, like `listen` and `silent`.', '- `sorted(word)` puts the letters in alphabetical order as a list.', '- If both sorted lists are equal, they are anagrams.'),
    description: 'Write a function `is_anagram(a, b)` that returns `True` if the two words are anagrams of each other, otherwise `False`.',
    solution: md('### Solution', '```python', 'def is_anagram(a, b):', '    return sorted(a) == sorted(b)', '```', '### Dry Run', "1. `sorted('listen')` is `['e','i','l','n','s','t']`.", "2. `sorted('silent')` is the same list.", '3. They match, so it returns `True`.'),
    tests: [T("is_anagram('listen', 'silent')", 'True'), T("is_anagram('hello', 'world')", 'False'), T("is_anagram('abc', 'ab')", 'False'), T("is_anagram('aabb', 'abab')", 'True')],
  },

  // ───────────── Flipkart ─────────────
  {
    company: 'Flipkart', title: 'Missing Number', difficulty: 'NORMAL', xpReward: 250,
    lesson: md(tip('Can you use math instead of brute force? The sum formula turns this into a one-liner.'),
      '### Approach', '', '- The list holds the numbers from 0 to n with exactly **one missing**, in any order.', '- The sum of 0..n is `n * (n + 1) // 2`.', '- The missing number is the expected sum minus the actual sum of the list.'),
    description: 'A list contains n different numbers taken from 0 to n, so exactly one number is missing. Write a function `missing_number(nums)` that returns it. Example: `missing_number([3, 0, 1])` returns 2.',
    solution: md('### Solution', '```python', 'def missing_number(nums):', '    n = len(nums)', '    expected = n * (n + 1) // 2', '    return expected - sum(nums)', '```', '### Dry Run', '1. Input `[3, 0, 1]`, so n = 3.', '2. Expected sum of 0..3 is `3 * 4 // 2 = 6`.', '3. Actual sum is 4. `6 - 4 = 2`.'),
    tests: [T('missing_number([3, 0, 1])', '2'), T('missing_number([0, 1])', '2'), T('missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1])', '8'), T('missing_number([0])', '1')],
  },

  // ───────────── Accenture ─────────────
  {
    company: 'Accenture', title: 'Most Frequent Number', difficulty: 'NORMAL', xpReward: 250,
    lesson: md(tip('Counting with a dictionary is one of the most useful everyday patterns, so interviewers love it.'),
      '### Approach', '', '- Use a dictionary: the number is the key, how many times you saw it is the value.', '- `counts[n] = counts.get(n, 0) + 1` adds one safely.', '- Then find the key with the biggest count.'),
    description: 'Write a function `most_frequent(nums)` that returns the number that appears most often in the list. You can assume there is no tie.',
    solution: md('### Solution', '```python', 'def most_frequent(nums):', '    counts = {}', '    for n in nums:', '        counts[n] = counts.get(n, 0) + 1', '    best = nums[0]', '    for n in counts:', '        if counts[n] > counts[best]:', '            best = n', '    return best', '```', '### Dry Run', '1. Input `[1, 3, 3]`. Counts become `{1: 1, 3: 2}`.', '2. `best` starts as 1.', '3. 3 has a bigger count (2 > 1), so `best` becomes 3.'),
    tests: [T('most_frequent([1, 3, 2, 3, 3, 1])', '3'), T('most_frequent([5])', '5'), T('most_frequent([2, 2, 1, 1, 2])', '2'), T('most_frequent([7, 8, 8])', '8')],
  },

  // ───────────── Bonus questions ─────────────
  {
    isBonus: true, title: 'Second Largest', difficulty: 'NORMAL', xpReward: 300,
    lesson: md('### 🎁 Bonus Challenge', '', 'A very common follow-up after "find the largest number".', '', '### Approach', '', '- Remove duplicates first with `set(nums)`, so `[5, 5, 4]` has a second largest of 4.', '- Sort what is left and take the second item from the end.', '- Or track `largest` and `second` while looping.'),
    description: 'Write a function `second_largest(nums)` that returns the second largest **different** value in the list. You can assume there are at least two different values. Example: `second_largest([5, 5, 4])` returns 4.',
    solution: md('### Solution', '```python', 'def second_largest(nums):', '    unique = sorted(set(nums))', '    return unique[-2]', '```', '### Dry Run', '1. Input `[3, 9, 2, 7]`.', '2. `set` then sorted: `[2, 3, 7, 9]`.', '3. `unique[-2]` is `7`.'),
    tests: [T('second_largest([3, 9, 2, 7])', '7'), T('second_largest([5, 5, 4])', '4'), T('second_largest([-1, -5, -3])', '-3'), T('second_largest([1, 2])', '1')],
  },
  {
    isBonus: true, title: 'Count Unique Items', difficulty: 'EASY', xpReward: 250,
    lesson: md('### 🎁 Bonus Challenge', '', '### Approach', '', '- A `set` keeps only one copy of each value.', '- `len()` of the set is the number of different values.'),
    description: 'Write a function `count_unique(items)` that returns how many different values are in the list. Example: `count_unique([1, 2, 2, 3, 3, 3])` returns 3.',
    solution: md('### Solution', '```python', 'def count_unique(items):', '    return len(set(items))', '```', '### Dry Run', '1. Input `[1, 2, 2, 3]`.', '2. `set(items)` is `{1, 2, 3}`.', '3. Its length is `3`.'),
    tests: [T('count_unique([1, 2, 2, 3, 3, 3])', '3'), T('count_unique([])', '0'), T("count_unique(['a', 'b', 'a'])", '2'), T('count_unique([7])', '1')],
  },
  {
    isBonus: true, title: 'Reverse Words', difficulty: 'NORMAL', xpReward: 300,
    lesson: md('### 🎁 Bonus Challenge', '', '### Approach', '', '- `text.split()` cuts a sentence into a list of words.', '- `words[::-1]` reverses that list.', "- `' '.join(words)` glues the words back together with spaces."),
    description: "Write a function `reverse_words(sentence)` that reverses the **order of the words**, not the letters. Example: `reverse_words('hello world')` returns `world hello`.",
    solution: md('### Solution', '```python', 'def reverse_words(sentence):', '    words = sentence.split()', "    return ' '.join(words[::-1])", '```', '### Dry Run', "1. Input `'I love Python'`.", "2. `split()` gives `['I', 'love', 'Python']`.", "3. Reversed and joined: `'Python love I'`."),
    tests: [T("reverse_words('hello world')", 'world hello'), T("reverse_words('one')", 'one'), T("reverse_words('I love Python')", 'Python love I')],
  },
  {
    isBonus: true, title: 'Collatz Steps', difficulty: 'HARD', xpReward: 400,
    lesson: md('### 🎁 Bonus Challenge', '', '### Approach', '', 'Start with any positive number n and repeat until you reach 1:', '', '- if n is even, divide it by 2 (`n // 2`)', '- if n is odd, change it to `3 * n + 1`', '', 'Count how many steps it takes. A `while` loop is perfect because you do not know in advance how many steps it will take.'),
    description: 'Write a function `collatz_steps(n)` that returns how many steps it takes to reach 1 using the rule above. Example: 6 goes 6, 3, 10, 5, 16, 8, 4, 2, 1 which is 8 steps. `collatz_steps(1)` is 0.',
    solution: md('### Solution', '```python', 'def collatz_steps(n):', '    steps = 0', '    while n != 1:', '        if n % 2 == 0:', '            n = n // 2', '        else:', '            n = 3 * n + 1', '        steps += 1', '    return steps', '```', '### Dry Run', '1. Input `n = 3`.', '2. 3 is odd: 10 (1 step). 10 is even: 5 (2). 5 is odd: 16 (3).', '3. 16 -> 8 -> 4 -> 2 -> 1 (7 steps total). Returns `7`.'),
    tests: [T('collatz_steps(1)', '0'), T('collatz_steps(6)', '8'), T('collatz_steps(7)', '16'), T('collatz_steps(27)', '111')],
  },
];

// Fixed values every premium question shares
premiumCurriculum.forEach((q, i) => {
  q.order = 1000 + i;                       // after the free path and company challenges (999)
  q.category = 'CODING';
  q.isPremium = true;
  q.isBonus = !!q.isBonus;
  q.company = q.company || null;
  q.topic = q.isBonus ? 'Bonus Challenge' : 'Interview Prep';
});

module.exports = { premiumCurriculum };
