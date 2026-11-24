const axios = require('axios');

// Judge0 language ids: 71 = Python 3, 63 = JavaScript (Node.js)
const LANGUAGE_IDS = { python: 71, javascript: 63 };

// Runs code on Judge0 and returns a normalized result.
// Throws only when Judge0 itself can't be reached (infrastructure problem).
const executeCode = async (code, language = 'python') => {
  const response = await axios.post(
    'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
    {
      language_id: LANGUAGE_IDS[language] || LANGUAGE_IDS.python,
      source_code: code,
      stdin: '',
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
  );

  const result = response.data;
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || result.compile_output || '',
    statusId: result.status?.id || 0,
  };
};

module.exports = { executeCode, LANGUAGE_IDS };
