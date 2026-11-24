const { executeCode } = require('../services/judge0');

// @desc    Run code using the free Judge0 CE API (no key required)
// @route   POST /api/execute
const runCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const result = await executeCode(code, language);

    // Normalize the Judge0 response to match our frontend format
    res.json({
      run: { stdout: result.stdout, stderr: result.stderr, code: result.statusId },
    });
  } catch (error) {
    console.error('Judge0 API Error:', error.message);
    res.status(500).json({
      message: 'Execution failed',
      error: error.message,
      details: error.response?.data || 'No additional details',
    });
  }
};

module.exports = { runCode };
