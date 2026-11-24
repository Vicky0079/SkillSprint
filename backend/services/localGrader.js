const { executeCode } = require('./judge0');
const { getTestCases } = require('./testCases');

// Scoring rules for the instant grader (it is only a provisional score):
//   empty submission                         -> 0
//   all test cases pass                      -> 100
//   code runs but a test gives wrong output  -> 50 (half marks)
//   code crashes / syntax error              -> 25
//   challenge has no tests (can't verify)    -> 50 if it runs, 25 if it crashes
const SCORES = { ALL_PASS: 100, WRONG_OUTPUT: 50, ERROR: 25, EMPTY: 0, UNVERIFIED: 50 };

const MARKER = '---TEST-OUTPUT---';

const buildHarness = (content, call, language) =>
  language === 'javascript'
    ? `${content}\n\nconsole.log("${MARKER}");\nconst __r = ${call};\nif (__r !== undefined) console.log(__r);`
    : `${content}\n\nprint("${MARKER}")\n__r = ${call}\nif __r is not None:\n    print(__r)`;

// Exact match, except True/False which JavaScript prints in lowercase.
const sameOutput = (actual, expected) =>
  /^(true|false)$/i.test(expected) ? actual.toLowerCase() === expected.toLowerCase() : actual === expected;

const runOneTest = async (content, test, language) => {
  const run = await executeCode(buildHarness(content, test.call, language), language);
  if (run.stderr || run.statusId !== 3) {
    return { ...test, actual: 'Error', passed: false, error: run.stderr || `Execution status ${run.statusId}` };
  }
  const out = run.stdout.includes(MARKER) ? run.stdout.split(MARKER)[1] : run.stdout;
  const actual = out.trim();
  return { ...test, actual, passed: sameOutput(actual, test.expected) };
};

// Throws if Judge0 can't be reached, so the caller can keep the submission retryable.
const gradeLocally = async ({ content, challengeTitle, language = 'python' }) => {
  const header =
    '⚡ **Instant grade (provisional)** — you skipped the full AI review, so this score comes only ' +
    'from automated test cases and may differ from what the AI would have given.\n\n';

  if (!content || !content.trim()) {
    return { score: SCORES.EMPTY, feedback: header + 'Your submission is empty, so it scores 0.' };
  }

  const tests = getTestCases(challengeTitle);

  // No tests for this challenge: all we can check is that the code runs.
  if (tests.length === 0) {
    const run = await executeCode(content, language);
    if (run.stderr || run.statusId !== 3) {
      return { score: SCORES.ERROR, feedback: header + `❌ Your code crashed:\n\n\`\`\`\n${run.stderr}\n\`\`\`` };
    }
    return {
      score: SCORES.UNVERIFIED,
      feedback: header + 'Your code runs without errors, but this challenge has no automated tests, so correctness could not be verified. Max instant score is 50 — wait for the AI review for full marks.',
    };
  }

  const results = await Promise.all(tests.map((t) => runOneTest(content, t, language)));
  const passedCount = results.filter((r) => r.passed).length;
  const crashed = results.some((r) => r.error);

  let score;
  if (passedCount === results.length) score = SCORES.ALL_PASS;
  else if (crashed) score = SCORES.ERROR;
  else score = SCORES.WRONG_OUTPUT;

  const lines = results.map((r) => {
    if (r.passed) return `- ✅ \`${r.call}\` → \`${r.expected}\``;
    if (r.error) return `- ❌ \`${r.call}\` crashed:\n\n  \`\`\`\n  ${r.error.trim().split('\n').join('\n  ')}\n  \`\`\``;
    return `- ❌ \`${r.call}\` expected \`${r.expected}\` but got \`${r.actual}\``;
  });

  return {
    score,
    feedback: `${header}**${passedCount}/${results.length} test cases passed.**\n\n${lines.join('\n')}`,
  };
};

module.exports = { gradeLocally, SCORES };
