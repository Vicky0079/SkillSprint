// SINGLE SOURCE OF TRUTH for the learning path.
// Each step has its lesson, description, solution AND its test cases.
// - backend/prisma/seed.js and backend/prisma/updateCurriculum.js write these into the database
// - backend/services/testCases.js uses `tests` for the instant grader
// - frontend/src/data/testCases.js is generated from `tests` (run: node scripts/syncFrontendTests.js)
//
// To add a question later: add one object below, then run the update command.

const md = (...lines) => lines.join('\n');
const T = (call, expected) => ({ call, expected });

const curriculum = [
  // ───────────── Print ─────────────
  {
    order: 1, title: 'Hello World', topic: 'Print Statement', difficulty: 'VERY BASIC', xpReward: 50,
    lesson: "### Python Print Statement\n\nThe `print()` function is used to output text to the screen. Whatever you put inside the parentheses will be displayed.\n\n```python\nprint('Hello, World!')\n```\n\n**Important:** Text must be wrapped in quotes (single `''` or double `\"\"`).",
    description: "Write a Python function called `hello()` that prints 'Hello, World!' to the console.",
    solution: "### Solution\n```python\ndef hello():\n    print('Hello, World!')\n```\n### Dry Run\n1. The function `hello` is defined.\n2. When called, it executes `print('Hello, World!')`.\n3. The string 'Hello, World!' is output to the console.",
    tests: [T('hello()', 'Hello, World!')],
  },

  // ───────────── Variables & Math ─────────────
  {
    order: 2, title: 'Add Two Numbers', topic: 'Variables & Math', difficulty: 'VERY BASIC', xpReward: 50,
    lesson: "### Variables and Math\n\nVariables store data. You can assign a value to a variable using the `=` sign. Python supports standard math operations like `+`, `-`, `*`, `/`.\n\n```python\nx = 5\ny = 3\nresult = x + y\n```",
    description: 'Write a function `add(a, b)` that takes two numbers and returns their sum.',
    solution: "### Solution\n```python\ndef add(a, b):\n    return a + b\n```\n### Dry Run\n1. Input: `a = 3`, `b = 5`.\n2. The `+` operator adds 3 and 5.\n3. Returns `8`.",
    tests: [T('add(3, 5)', '8'), T('add(-1, 1)', '0'), T('add(0, 0)', '0')],
  },
  {
    order: 3, title: 'Square a Number', topic: 'Variables & Math', difficulty: 'VERY BASIC', xpReward: 50,
    lesson: md(
      '### Using Variables in Math', '',
      'A function can take a value, do math with it, and **return** the answer. `*` multiplies two numbers.', '',
      '```python', 'def double(n):', '    return n * 2', '', 'print(double(4))  # 8', '```', '',
      'The same variable can be used more than once in one expression.'),
    description: 'Write a function `square(n)` that returns the number multiplied by itself.',
    solution: md('### Solution', '```python', 'def square(n):', '    return n * n', '```', '### Dry Run',
      '1. Input: `n = 4`.', '2. `n * n` becomes `4 * 4`.', '3. Returns `16`.'),
    tests: [T('square(4)', '16'), T('square(-3)', '9'), T('square(0)', '0'), T('square(10)', '100')],
  },
  {
    order: 4, title: 'Area of a Rectangle', topic: 'Variables & Math', difficulty: 'VERY BASIC', xpReward: 50,
    lesson: md(
      '### Storing a Result in a Variable', '',
      'Instead of returning right away, you can save a result in a variable first. This makes longer code easier to read.', '',
      '```python', 'def total_legs(dogs, birds):', '    dog_legs = dogs * 4', '    bird_legs = birds * 2', '    return dog_legs + bird_legs', '```'),
    description: 'Write a function `rectangle_area(width, height)` that returns the area of a rectangle (width times height).',
    solution: md('### Solution', '```python', 'def rectangle_area(width, height):', '    area = width * height', '    return area', '```', '### Dry Run',
      '1. Input: `width = 3`, `height = 4`.', '2. `area` is set to `3 * 4`, which is `12`.', '3. Returns `12`.'),
    tests: [T('rectangle_area(3, 4)', '12'), T('rectangle_area(5, 5)', '25'), T('rectangle_area(0, 7)', '0'), T('rectangle_area(10, 2)', '20')],
  },
  {
    order: 5, title: 'Full Name', topic: 'Variables & Math', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### Text Variables (Strings)', '',
      'Variables can hold text too. Text is called a **string**. You can join strings together with `+`.', '',
      '```python', "first = 'Sam'", "last = 'Lee'", "full = first + ' ' + last", 'print(full)  # Sam Lee', '```', '',
      "Notice the `' '` in the middle. It adds a space, otherwise the names would stick together."),
    description: "Write a function `full_name(first, last)` that returns the first and last name joined with one space between them. Example: `full_name('Ada', 'Lovelace')` returns `Ada Lovelace`.",
    solution: md('### Solution', '```python', 'def full_name(first, last):', "    return first + ' ' + last", '```', '### Dry Run',
      "1. Input: `first = 'Ada'`, `last = 'Lovelace'`.", "2. `'Ada' + ' '` becomes `'Ada '`.", "3. Adding `'Lovelace'` gives `'Ada Lovelace'`."),
    tests: [T("full_name('Ada', 'Lovelace')", 'Ada Lovelace'), T("full_name('Tom', 'Hanks')", 'Tom Hanks'), T("full_name('A', 'B')", 'A B')],
  },
  {
    order: 6, title: 'Minutes to Hours', topic: 'Variables & Math', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### Whole Division and Remainder', '',
      'Two handy operators:', '',
      '- `//` divides and throws away the decimal part: `7 // 2` is `3`', '- `%` gives the remainder: `7 % 2` is `1`', '',
      '```python', 'minutes = 135', 'hours = minutes // 60   # 2', 'left = minutes % 60      # 15', "print(f'{hours}h {left}m')", '```', '',
      'An f-string (`f"..."`) lets you put variables inside `{ }` in the text.'),
    description: "Write a function `format_time(minutes)` that turns minutes into text like `2h 30m`. Example: `format_time(150)` returns `2h 30m`, and `format_time(45)` returns `0h 45m`.",
    solution: md('### Solution', '```python', 'def format_time(minutes):', '    hours = minutes // 60', '    left = minutes % 60', "    return f'{hours}h {left}m'", '```', '### Dry Run',
      '1. Input: `minutes = 150`.', '2. `150 // 60` is `2` hours.', '3. `150 % 60` is `30` minutes left.', "4. Returns `'2h 30m'`."),
    tests: [T('format_time(150)', '2h 30m'), T('format_time(45)', '0h 45m'), T('format_time(60)', '1h 0m'), T('format_time(0)', '0h 0m'), T('format_time(200)', '3h 20m')],
  },

  // ───────────── If / Else ─────────────
  {
    order: 7, title: 'Even or Odd', topic: 'Conditionals (If/Else)', difficulty: 'EASY', xpReward: 100,
    lesson: "### Conditionals and Modulo\n\nUse `if` and `else` to make decisions. The modulo operator (`%`) returns the remainder of a division.\n\n```python\nif 4 % 2 == 0:\n    print('Even')\n```",
    description: 'Write a function `is_even(n)` that returns `True` if a number is even, and `False` otherwise.',
    solution: "### Solution\n```python\ndef is_even(n):\n    return n % 2 == 0\n```",
    tests: [T('is_even(4)', 'True'), T('is_even(7)', 'False'), T('is_even(0)', 'True')],
  },
  {
    order: 8, title: 'Can You Vote?', topic: 'Conditionals (If/Else)', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### Comparing Values', '',
      'Comparison operators give back `True` or `False`:', '',
      '- `>` greater than, `<` less than', '- `>=` greater than or equal, `<=` less than or equal', '- `==` equal to, `!=` not equal to', '',
      '```python', 'age = 20', 'if age >= 18:', "    print('Adult')", 'else:', "    print('Minor')", '```', '',
      'Careful: `=` stores a value, `==` compares two values.'),
    description: 'Write a function `can_vote(age)` that returns `True` if the age is 18 or more, otherwise `False`.',
    solution: md('### Solution', '```python', 'def can_vote(age):', '    if age >= 18:', '        return True', '    else:', '        return False', '```',
      '(Shorter version: `return age >= 18`)', '### Dry Run', '1. Input: `age = 18`.', '2. `18 >= 18` is true.', '3. Returns `True`.'),
    tests: [T('can_vote(20)', 'True'), T('can_vote(18)', 'True'), T('can_vote(17)', 'False'), T('can_vote(0)', 'False')],
  },
  {
    order: 9, title: 'Positive, Negative or Zero', topic: 'Conditionals (If/Else)', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### More Than Two Choices: elif', '',
      '`elif` means "else if". It lets you check several conditions in order. Python runs the **first** block that is true and skips the rest.', '',
      '```python', 'def size(n):', '    if n > 100:', "        return 'Big'", '    elif n > 10:', "        return 'Medium'", '    else:', "        return 'Small'", '```'),
    description: "Write a function `sign_of(n)` that returns the text `Positive` if n is above 0, `Negative` if n is below 0, and `Zero` if n is 0.",
    solution: md('### Solution', '```python', 'def sign_of(n):', '    if n > 0:', "        return 'Positive'", '    elif n < 0:', "        return 'Negative'", '    else:', "        return 'Zero'", '```',
      '### Dry Run', '1. Input: `n = -3`.', '2. `-3 > 0` is false, so skip.', '3. `-3 < 0` is true, so return `Negative`.'),
    tests: [T('sign_of(5)', 'Positive'), T('sign_of(-3)', 'Negative'), T('sign_of(0)', 'Zero'), T('sign_of(100)', 'Positive')],
  },
  {
    order: 10, title: 'Grade Calculator', topic: 'Conditionals (If/Else)', difficulty: 'NORMAL', xpReward: 200,
    lesson: md(
      '### Order Matters in elif Chains', '',
      'Python checks conditions from top to bottom and stops at the first one that is true. So put the **strictest** check first.', '',
      '```python', 'if score >= 90:', "    grade = 'A'", 'elif score >= 80:', "    grade = 'B'", '```', '',
      'If you checked `score >= 80` first, a score of 95 would wrongly get a B.'),
    description: "Write a function `grade(score)` that returns `A` for 90 or more, `B` for 80 to 89, `C` for 70 to 79, and `F` for anything below 70.",
    solution: md('### Solution', '```python', 'def grade(score):', '    if score >= 90:', "        return 'A'", '    elif score >= 80:', "        return 'B'", '    elif score >= 70:', "        return 'C'", '    else:', "        return 'F'", '```',
      '### Dry Run', '1. Input: `score = 85`.', '2. `85 >= 90` is false.', '3. `85 >= 80` is true, so return `B`.'),
    tests: [T('grade(95)', 'A'), T('grade(90)', 'A'), T('grade(85)', 'B'), T('grade(72)', 'C'), T('grade(70)', 'C'), T('grade(69)', 'F'), T('grade(40)', 'F')],
  },
  {
    order: 11, title: 'FizzBuzz', topic: 'Conditionals (If/Else)', difficulty: 'NORMAL', xpReward: 200,
    lesson: md(
      '### Combining Conditions', '',
      'A famous beginner problem. You need to check if a number divides evenly, using `%`.', '',
      '- `n % 3 == 0` means n is a multiple of 3', '- `and` is true only when both sides are true', '',
      '```python', 'if n % 2 == 0 and n % 5 == 0:', "    print('Multiple of both')", '```', '',
      'Hint: check the "both" case first, or it will never be reached.'),
    description: "Write a function `fizzbuzz(n)` that returns `FizzBuzz` if n is a multiple of both 3 and 5, `Fizz` if only a multiple of 3, `Buzz` if only a multiple of 5, otherwise the number itself.",
    solution: md('### Solution', '```python', 'def fizzbuzz(n):', '    if n % 3 == 0 and n % 5 == 0:', "        return 'FizzBuzz'", '    elif n % 3 == 0:', "        return 'Fizz'", '    elif n % 5 == 0:', "        return 'Buzz'", '    else:', '        return n', '```',
      '### Dry Run', '1. Input: `n = 15`.', '2. 15 is divisible by both 3 and 5.', '3. Returns `FizzBuzz`.'),
    tests: [T('fizzbuzz(3)', 'Fizz'), T('fizzbuzz(5)', 'Buzz'), T('fizzbuzz(15)', 'FizzBuzz'), T('fizzbuzz(7)', '7'), T('fizzbuzz(9)', 'Fizz'), T('fizzbuzz(30)', 'FizzBuzz')],
  },

  // ───────────── Loops ─────────────
  {
    order: 12, title: 'Sum 1 to N', topic: 'Loops (For)', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### Your First For Loop', '',
      'A `for` loop repeats code. `range(1, 5)` gives 1, 2, 3, 4 (it stops **before** 5).', '',
      '```python', 'for i in range(1, 5):', '    print(i)', '```', '',
      'A common pattern is a **running total**: start at 0 and add to it each time around the loop.', '',
      '```python', 'total = 0', 'for i in range(1, 4):', '    total = total + i   # 1, then 3, then 6', '```'),
    description: 'Write a function `sum_to_n(n)` that returns 1 + 2 + 3 + ... + n using a loop. For n = 0 it returns 0.',
    solution: md('### Solution', '```python', 'def sum_to_n(n):', '    total = 0', '    for i in range(1, n + 1):', '        total += i', '    return total', '```',
      '### Dry Run', '1. Input: `n = 3`. `total` starts at 0.', '2. i = 1: total is 1.', '3. i = 2: total is 3.', '4. i = 3: total is 6. Returns `6`.'),
    tests: [T('sum_to_n(5)', '15'), T('sum_to_n(1)', '1'), T('sum_to_n(10)', '55'), T('sum_to_n(0)', '0')],
  },
  {
    order: 13, title: 'Count Up Text', topic: 'Loops (For)', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### Building a String in a Loop', '',
      'You can build text one piece at a time. `str(5)` turns the number 5 into the text `"5"`, and `.strip()` removes spaces from both ends.', '',
      '```python', "text = ''", 'for i in range(1, 4):', "    text = text + str(i) + '-'", 'print(text)   # 1-2-3-', '```'),
    description: "Write a function `count_up(n)` that returns the numbers from 1 to n as text separated by spaces. Example: `count_up(5)` returns `1 2 3 4 5`.",
    solution: md('### Solution', '```python', 'def count_up(n):', "    text = ''", '    for i in range(1, n + 1):', "        text = text + str(i) + ' '", '    return text.strip()', '```',
      '### Dry Run', '1. Input: `n = 3`.', "2. After the loop, text is `'1 2 3 '`.", "3. `.strip()` removes the last space, returning `'1 2 3'`."),
    tests: [T('count_up(5)', '1 2 3 4 5'), T('count_up(1)', '1'), T('count_up(3)', '1 2 3'), T('count_up(10)', '1 2 3 4 5 6 7 8 9 10')],
  },
  {
    order: 14, title: 'Count Vowels', topic: 'Loops (For)', difficulty: 'NORMAL', xpReward: 200,
    lesson: md(
      '### Looping Over Text', '',
      'A `for` loop can go through each letter of a string. `in` checks if something is inside another string.', '',
      '```python', "for letter in 'cat':", '    print(letter)   # c, a, t', '', "print('a' in 'aeiou')   # True", '```', '',
      '`.lower()` turns text into lowercase, so `"E"` becomes `"e"` and you only need to check lowercase vowels.'),
    description: "Write a function `count_vowels(text)` that returns how many vowels (a, e, i, o, u) are in the text. Count both uppercase and lowercase. Example: `count_vowels('hello')` returns 2.",
    solution: md('### Solution', '```python', 'def count_vowels(text):', '    count = 0', '    for letter in text.lower():', "        if letter in 'aeiou':", '            count += 1', '    return count', '```',
      '### Dry Run', "1. Input: `'Hi'`. After `.lower()` it is `'hi'`.", "2. `'h'` is not a vowel.", "3. `'i'` is a vowel, so count becomes 1.", '4. Returns `1`.'),
    tests: [T("count_vowels('hello')", '2'), T("count_vowels('sky')", '0'), T("count_vowels('Education')", '5'), T("count_vowels('Programming')", '3'), T("count_vowels('')", '0')],
  },
  {
    order: 15, title: 'Factorial', topic: 'Loops (For)', difficulty: 'NORMAL', xpReward: 200,
    lesson: "### For Loops\n\nA `for` loop repeats a block of code. `range(1, 5)` generates numbers from 1 up to (but not including) 5.\n\n```python\nfor i in range(1, 4):\n    print(i) # Prints 1, 2, 3\n```",
    description: 'Write a function `factorial(n)` that returns the factorial of `n` using a loop.',
    solution: "### Solution\n```python\ndef factorial(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result\n```",
    tests: [T('factorial(5)', '120'), T('factorial(0)', '1')],
  },
  {
    order: 16, title: 'Power of a Number', topic: 'Loops (For)', difficulty: 'NORMAL', xpReward: 200,
    lesson: md(
      '### Repeating Multiplication', '',
      'A power is just repeated multiplication: 2 to the power of 3 is `2 * 2 * 2 = 8`.', '',
      'If you do not need the loop counter, you can still write `for i in range(times):`. The loop simply runs `times` times.', '',
      '```python', 'result = 1', 'for i in range(3):', '    result = result * 2', '# result is now 8', '```'),
    description: 'Write a function `power(base, exp)` that returns base raised to the power exp, using a loop (do not use `**`). `power(5, 0)` is 1.',
    solution: md('### Solution', '```python', 'def power(base, exp):', '    result = 1', '    for i in range(exp):', '        result *= base', '    return result', '```',
      '### Dry Run', '1. Input: `base = 2`, `exp = 3`. `result` starts at 1.', '2. Loop 1: result is 2.', '3. Loop 2: result is 4.', '4. Loop 3: result is 8. Returns `8`.'),
    tests: [T('power(2, 3)', '8'), T('power(5, 0)', '1'), T('power(3, 4)', '81'), T('power(10, 2)', '100')],
  },

  // ───────────── Lists ─────────────
  {
    order: 17, title: 'Sum of a List', topic: 'Lists', difficulty: 'EASY', xpReward: 100,
    lesson: "### Introduction to Lists\n\nA list stores multiple items in a single variable. You can loop through a list or use built-in functions like `sum()`.\n\n```python\nnums = [1, 2, 3]\ntotal = sum(nums)\n```",
    description: 'Write a function `sum_list(nums)` that takes a list of numbers and returns their total sum.',
    solution: "### Solution\n```python\ndef sum_list(nums):\n    return sum(nums)\n```",
    tests: [T('sum_list([1, 2, 3])', '6'), T('sum_list([])', '0'), T('sum_list([-5, 5, 10])', '10')],
  },
  {
    order: 18, title: 'Is It in the List?', topic: 'Lists', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### Checking Membership', '',
      'The `in` keyword checks if a value is inside a list. It gives back `True` or `False`.', '',
      '```python', "fruits = ['apple', 'banana']", "print('apple' in fruits)    # True", "print('grape' in fruits)    # False", '```', '',
      'You can also use it directly in an `if` statement.'),
    description: 'Write a function `contains(items, target)` that returns `True` if `target` is in the list `items`, otherwise `False`.',
    solution: md('### Solution', '```python', 'def contains(items, target):', '    return target in items', '```', '### Dry Run',
      '1. Input: `items = [1, 2, 3]`, `target = 2`.', '2. Python looks through the list and finds 2.', '3. Returns `True`.'),
    tests: [T('contains([1, 2, 3], 2)', 'True'), T('contains([1, 2, 3], 5)', 'False'), T('contains([], 1)', 'False'), T("contains(['a', 'b'], 'b')", 'True')],
  },
  {
    order: 19, title: 'Largest Number', topic: 'Lists', difficulty: 'EASY', xpReward: 100,
    lesson: md(
      '### Looping Through a List', '',
      'You can use a `for` loop to visit every item. A good trick for finding the biggest value: remember the best one so far, and replace it whenever you find a bigger one.', '',
      '```python', 'nums = [4, 9, 2]', 'for n in nums:', '    print(n)', '', 'first = nums[0]   # lists start at position 0', '```'),
    description: 'Write a function `find_max(nums)` that returns the largest number in a non-empty list. Try to solve it with a loop first.',
    solution: md('### Solution', '```python', 'def find_max(nums):', '    biggest = nums[0]', '    for n in nums:', '        if n > biggest:', '            biggest = n', '    return biggest', '```',
      '(Shortcut: `return max(nums)`)', '### Dry Run', '1. Input: `[3, 9, 2]`. `biggest` starts as 3.', '2. 9 is bigger than 3, so `biggest` becomes 9.', '3. 2 is not bigger. Returns `9`.'),
    tests: [T('find_max([3, 9, 2])', '9'), T('find_max([-5, -2, -9])', '-2'), T('find_max([7])', '7'), T('find_max([1, 1, 1])', '1')],
  },
  {
    order: 20, title: 'Count Even Numbers', topic: 'Lists', difficulty: 'NORMAL', xpReward: 200,
    lesson: md(
      '### Loop + If Together', '',
      'Most real programs combine ideas. Here you loop through a list and use an `if` to decide what to count.', '',
      '```python', 'nums = [1, 2, 3, 4]', 'count = 0', 'for n in nums:', '    if n > 2:', '        count += 1', '# count is now 2', '```', '',
      'Remember `n % 2 == 0` means n is even.'),
    description: 'Write a function `count_evens(nums)` that returns how many even numbers are in the list.',
    solution: md('### Solution', '```python', 'def count_evens(nums):', '    count = 0', '    for n in nums:', '        if n % 2 == 0:', '            count += 1', '    return count', '```',
      '### Dry Run', '1. Input: `[1, 2, 3, 4]`. `count` starts at 0.', '2. 1 is odd, skip.', '3. 2 is even, count is 1.', '4. 3 is odd, skip.', '5. 4 is even, count is 2. Returns `2`.'),
    tests: [T('count_evens([1, 2, 3, 4])', '2'), T('count_evens([])', '0'), T('count_evens([1, 3, 5])', '0'), T('count_evens([2, 4, 6])', '3'), T('count_evens([0, -2, 7])', '2')],
  },
  {
    order: 21, title: 'Longest Word', topic: 'Lists', difficulty: 'NORMAL', xpReward: 200,
    lesson: md(
      '### Lists of Text', '',
      'Lists can hold strings. `len()` tells you how many characters a string has (or how many items a list has).', '',
      '```python', "words = ['hi', 'hello']", "print(len('hello'))   # 5", '```', '',
      'This is the same "best so far" idea as finding the largest number, but you compare lengths instead of values.'),
    description: 'Write a function `longest_word(words)` that returns the longest word in a non-empty list of words. (You can assume there is no tie.)',
    solution: md('### Solution', '```python', 'def longest_word(words):', '    longest = words[0]', '    for word in words:', '        if len(word) > len(longest):', '            longest = word', '    return longest', '```',
      '### Dry Run', "1. Input: `['cat', 'elephant', 'dog']`. `longest` starts as `'cat'`.", "2. `'elephant'` has 8 letters, more than 3, so it becomes `longest`.", "3. `'dog'` is shorter. Returns `'elephant'`."),
    tests: [T("longest_word(['cat', 'elephant', 'dog'])", 'elephant'), T("longest_word(['hi'])", 'hi'), T("longest_word(['a', 'abc', 'ab'])", 'abc'), T("longest_word(['sun', 'moon', 'stars'])", 'stars')],
  },
];

module.exports = { curriculum };
