// AUTO-GENERATED from backend/data/curriculum.js. Do not edit by hand.
// Regenerate with: cd backend && node scripts/syncFrontendTests.js
export const TESTS_BY_TITLE = {
  "hello world": [
    {
      "call": "hello()",
      "expected": "Hello, World!"
    }
  ],
  "add two numbers": [
    {
      "call": "add(3, 5)",
      "expected": "8"
    },
    {
      "call": "add(-1, 1)",
      "expected": "0"
    },
    {
      "call": "add(0, 0)",
      "expected": "0"
    }
  ],
  "square a number": [
    {
      "call": "square(4)",
      "expected": "16"
    },
    {
      "call": "square(-3)",
      "expected": "9"
    },
    {
      "call": "square(0)",
      "expected": "0"
    },
    {
      "call": "square(10)",
      "expected": "100"
    }
  ],
  "area of a rectangle": [
    {
      "call": "rectangle_area(3, 4)",
      "expected": "12"
    },
    {
      "call": "rectangle_area(5, 5)",
      "expected": "25"
    },
    {
      "call": "rectangle_area(0, 7)",
      "expected": "0"
    },
    {
      "call": "rectangle_area(10, 2)",
      "expected": "20"
    }
  ],
  "full name": [
    {
      "call": "full_name('Ada', 'Lovelace')",
      "expected": "Ada Lovelace"
    },
    {
      "call": "full_name('Tom', 'Hanks')",
      "expected": "Tom Hanks"
    },
    {
      "call": "full_name('A', 'B')",
      "expected": "A B"
    }
  ],
  "minutes to hours": [
    {
      "call": "format_time(150)",
      "expected": "2h 30m"
    },
    {
      "call": "format_time(45)",
      "expected": "0h 45m"
    },
    {
      "call": "format_time(60)",
      "expected": "1h 0m"
    },
    {
      "call": "format_time(0)",
      "expected": "0h 0m"
    },
    {
      "call": "format_time(200)",
      "expected": "3h 20m"
    }
  ],
  "even or odd": [
    {
      "call": "is_even(4)",
      "expected": "True"
    },
    {
      "call": "is_even(7)",
      "expected": "False"
    },
    {
      "call": "is_even(0)",
      "expected": "True"
    }
  ],
  "can you vote?": [
    {
      "call": "can_vote(20)",
      "expected": "True"
    },
    {
      "call": "can_vote(18)",
      "expected": "True"
    },
    {
      "call": "can_vote(17)",
      "expected": "False"
    },
    {
      "call": "can_vote(0)",
      "expected": "False"
    }
  ],
  "positive, negative or zero": [
    {
      "call": "sign_of(5)",
      "expected": "Positive"
    },
    {
      "call": "sign_of(-3)",
      "expected": "Negative"
    },
    {
      "call": "sign_of(0)",
      "expected": "Zero"
    },
    {
      "call": "sign_of(100)",
      "expected": "Positive"
    }
  ],
  "grade calculator": [
    {
      "call": "grade(95)",
      "expected": "A"
    },
    {
      "call": "grade(90)",
      "expected": "A"
    },
    {
      "call": "grade(85)",
      "expected": "B"
    },
    {
      "call": "grade(72)",
      "expected": "C"
    },
    {
      "call": "grade(70)",
      "expected": "C"
    },
    {
      "call": "grade(69)",
      "expected": "F"
    },
    {
      "call": "grade(40)",
      "expected": "F"
    }
  ],
  "fizzbuzz": [
    {
      "call": "fizzbuzz(3)",
      "expected": "Fizz"
    },
    {
      "call": "fizzbuzz(5)",
      "expected": "Buzz"
    },
    {
      "call": "fizzbuzz(15)",
      "expected": "FizzBuzz"
    },
    {
      "call": "fizzbuzz(7)",
      "expected": "7"
    },
    {
      "call": "fizzbuzz(9)",
      "expected": "Fizz"
    },
    {
      "call": "fizzbuzz(30)",
      "expected": "FizzBuzz"
    }
  ],
  "sum 1 to n": [
    {
      "call": "sum_to_n(5)",
      "expected": "15"
    },
    {
      "call": "sum_to_n(1)",
      "expected": "1"
    },
    {
      "call": "sum_to_n(10)",
      "expected": "55"
    },
    {
      "call": "sum_to_n(0)",
      "expected": "0"
    }
  ],
  "count up text": [
    {
      "call": "count_up(5)",
      "expected": "1 2 3 4 5"
    },
    {
      "call": "count_up(1)",
      "expected": "1"
    },
    {
      "call": "count_up(3)",
      "expected": "1 2 3"
    },
    {
      "call": "count_up(10)",
      "expected": "1 2 3 4 5 6 7 8 9 10"
    }
  ],
  "count vowels": [
    {
      "call": "count_vowels('hello')",
      "expected": "2"
    },
    {
      "call": "count_vowels('sky')",
      "expected": "0"
    },
    {
      "call": "count_vowels('Education')",
      "expected": "5"
    },
    {
      "call": "count_vowels('Programming')",
      "expected": "3"
    },
    {
      "call": "count_vowels('')",
      "expected": "0"
    }
  ],
  "factorial": [
    {
      "call": "factorial(5)",
      "expected": "120"
    },
    {
      "call": "factorial(0)",
      "expected": "1"
    }
  ],
  "power of a number": [
    {
      "call": "power(2, 3)",
      "expected": "8"
    },
    {
      "call": "power(5, 0)",
      "expected": "1"
    },
    {
      "call": "power(3, 4)",
      "expected": "81"
    },
    {
      "call": "power(10, 2)",
      "expected": "100"
    }
  ],
  "sum of a list": [
    {
      "call": "sum_list([1, 2, 3])",
      "expected": "6"
    },
    {
      "call": "sum_list([])",
      "expected": "0"
    },
    {
      "call": "sum_list([-5, 5, 10])",
      "expected": "10"
    }
  ],
  "is it in the list?": [
    {
      "call": "contains([1, 2, 3], 2)",
      "expected": "True"
    },
    {
      "call": "contains([1, 2, 3], 5)",
      "expected": "False"
    },
    {
      "call": "contains([], 1)",
      "expected": "False"
    },
    {
      "call": "contains(['a', 'b'], 'b')",
      "expected": "True"
    }
  ],
  "largest number": [
    {
      "call": "find_max([3, 9, 2])",
      "expected": "9"
    },
    {
      "call": "find_max([-5, -2, -9])",
      "expected": "-2"
    },
    {
      "call": "find_max([7])",
      "expected": "7"
    },
    {
      "call": "find_max([1, 1, 1])",
      "expected": "1"
    }
  ],
  "count even numbers": [
    {
      "call": "count_evens([1, 2, 3, 4])",
      "expected": "2"
    },
    {
      "call": "count_evens([])",
      "expected": "0"
    },
    {
      "call": "count_evens([1, 3, 5])",
      "expected": "0"
    },
    {
      "call": "count_evens([2, 4, 6])",
      "expected": "3"
    },
    {
      "call": "count_evens([0, -2, 7])",
      "expected": "2"
    }
  ],
  "longest word": [
    {
      "call": "longest_word(['cat', 'elephant', 'dog'])",
      "expected": "elephant"
    },
    {
      "call": "longest_word(['hi'])",
      "expected": "hi"
    },
    {
      "call": "longest_word(['a', 'abc', 'ab'])",
      "expected": "abc"
    },
    {
      "call": "longest_word(['sun', 'moon', 'stars'])",
      "expected": "stars"
    }
  ],
  "palindrome check": [
    {
      "call": "is_palindrome('madam')",
      "expected": "True"
    },
    {
      "call": "is_palindrome('hello')",
      "expected": "False"
    },
    {
      "call": "is_palindrome('Racecar')",
      "expected": "True"
    },
    {
      "call": "is_palindrome('a')",
      "expected": "True"
    },
    {
      "call": "is_palindrome('ab')",
      "expected": "False"
    }
  ],
  "prime number": [
    {
      "call": "is_prime(2)",
      "expected": "True"
    },
    {
      "call": "is_prime(1)",
      "expected": "False"
    },
    {
      "call": "is_prime(15)",
      "expected": "False"
    },
    {
      "call": "is_prime(17)",
      "expected": "True"
    },
    {
      "call": "is_prime(0)",
      "expected": "False"
    },
    {
      "call": "is_prime(97)",
      "expected": "True"
    }
  ],
  "sum of digits": [
    {
      "call": "digit_sum(123)",
      "expected": "6"
    },
    {
      "call": "digit_sum(9)",
      "expected": "9"
    },
    {
      "call": "digit_sum(1000)",
      "expected": "1"
    },
    {
      "call": "digit_sum(0)",
      "expected": "0"
    },
    {
      "call": "digit_sum(98765)",
      "expected": "35"
    }
  ],
  "reverse a string": [
    {
      "call": "reverse_string('hello')",
      "expected": "olleh"
    },
    {
      "call": "reverse_string('Python')",
      "expected": "nohtyP"
    },
    {
      "call": "reverse_string('a')",
      "expected": "a"
    },
    {
      "call": "reverse_string('abc def')",
      "expected": "fed cba"
    }
  ],
  "armstrong number": [
    {
      "call": "is_armstrong(153)",
      "expected": "True"
    },
    {
      "call": "is_armstrong(370)",
      "expected": "True"
    },
    {
      "call": "is_armstrong(123)",
      "expected": "False"
    },
    {
      "call": "is_armstrong(9)",
      "expected": "True"
    },
    {
      "call": "is_armstrong(9474)",
      "expected": "True"
    },
    {
      "call": "is_armstrong(100)",
      "expected": "False"
    }
  ],
  "fibonacci number": [
    {
      "call": "fibonacci(0)",
      "expected": "0"
    },
    {
      "call": "fibonacci(1)",
      "expected": "1"
    },
    {
      "call": "fibonacci(2)",
      "expected": "1"
    },
    {
      "call": "fibonacci(7)",
      "expected": "13"
    },
    {
      "call": "fibonacci(10)",
      "expected": "55"
    },
    {
      "call": "fibonacci(20)",
      "expected": "6765"
    }
  ],
  "pair with target sum": [
    {
      "call": "has_pair_with_sum([2, 7, 11, 15], 9)",
      "expected": "True"
    },
    {
      "call": "has_pair_with_sum([1, 2, 3], 7)",
      "expected": "False"
    },
    {
      "call": "has_pair_with_sum([3, 3], 6)",
      "expected": "True"
    },
    {
      "call": "has_pair_with_sum([5], 10)",
      "expected": "False"
    },
    {
      "call": "has_pair_with_sum([4], 8)",
      "expected": "False"
    },
    {
      "call": "has_pair_with_sum([], 0)",
      "expected": "False"
    }
  ],
  "first unique character": [
    {
      "call": "first_unique_char('leetcode')",
      "expected": "l"
    },
    {
      "call": "first_unique_char('aabb')",
      "expected": "-"
    },
    {
      "call": "first_unique_char('loveleetcode')",
      "expected": "v"
    },
    {
      "call": "first_unique_char('z')",
      "expected": "z"
    }
  ],
  "valid brackets": [
    {
      "call": "is_valid_brackets('()')",
      "expected": "True"
    },
    {
      "call": "is_valid_brackets('()[]{}')",
      "expected": "True"
    },
    {
      "call": "is_valid_brackets('(]')",
      "expected": "False"
    },
    {
      "call": "is_valid_brackets('([)]')",
      "expected": "False"
    },
    {
      "call": "is_valid_brackets('{[]}')",
      "expected": "True"
    },
    {
      "call": "is_valid_brackets('(')",
      "expected": "False"
    },
    {
      "call": "is_valid_brackets('')",
      "expected": "True"
    }
  ],
  "anagram check": [
    {
      "call": "is_anagram('listen', 'silent')",
      "expected": "True"
    },
    {
      "call": "is_anagram('hello', 'world')",
      "expected": "False"
    },
    {
      "call": "is_anagram('abc', 'ab')",
      "expected": "False"
    },
    {
      "call": "is_anagram('aabb', 'abab')",
      "expected": "True"
    }
  ],
  "missing number": [
    {
      "call": "missing_number([3, 0, 1])",
      "expected": "2"
    },
    {
      "call": "missing_number([0, 1])",
      "expected": "2"
    },
    {
      "call": "missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1])",
      "expected": "8"
    },
    {
      "call": "missing_number([0])",
      "expected": "1"
    }
  ],
  "most frequent number": [
    {
      "call": "most_frequent([1, 3, 2, 3, 3, 1])",
      "expected": "3"
    },
    {
      "call": "most_frequent([5])",
      "expected": "5"
    },
    {
      "call": "most_frequent([2, 2, 1, 1, 2])",
      "expected": "2"
    },
    {
      "call": "most_frequent([7, 8, 8])",
      "expected": "8"
    }
  ],
  "second largest": [
    {
      "call": "second_largest([3, 9, 2, 7])",
      "expected": "7"
    },
    {
      "call": "second_largest([5, 5, 4])",
      "expected": "4"
    },
    {
      "call": "second_largest([-1, -5, -3])",
      "expected": "-3"
    },
    {
      "call": "second_largest([1, 2])",
      "expected": "1"
    }
  ],
  "count unique items": [
    {
      "call": "count_unique([1, 2, 2, 3, 3, 3])",
      "expected": "3"
    },
    {
      "call": "count_unique([])",
      "expected": "0"
    },
    {
      "call": "count_unique(['a', 'b', 'a'])",
      "expected": "2"
    },
    {
      "call": "count_unique([7])",
      "expected": "1"
    }
  ],
  "reverse words": [
    {
      "call": "reverse_words('hello world')",
      "expected": "world hello"
    },
    {
      "call": "reverse_words('one')",
      "expected": "one"
    },
    {
      "call": "reverse_words('I love Python')",
      "expected": "Python love I"
    }
  ],
  "collatz steps": [
    {
      "call": "collatz_steps(1)",
      "expected": "0"
    },
    {
      "call": "collatz_steps(6)",
      "expected": "8"
    },
    {
      "call": "collatz_steps(7)",
      "expected": "16"
    },
    {
      "call": "collatz_steps(27)",
      "expected": "111"
    }
  ]
};
