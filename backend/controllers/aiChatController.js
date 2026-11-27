const { generateText } = require('../services/aiService');

const chatWithTutor = async (req, res) => {
  try {
    const { message, challengeDescription, userCode } = req.body;
    if (!message || !String(message).trim()) return res.status(400).json({ reply: 'Please type a question.' });

    const prompt = `
You are an expert, encouraging coding tutor for SkillSprint.
The student is working on this challenge: "${challengeDescription || 'a coding challenge'}".

Their current code is:
\`\`\`
${userCode || 'No code written yet.'}
\`\`\`

The student asks: "${message}"

Provide a helpful, concise response.
CRITICAL RULE: DO NOT give them the full correct code directly. Instead, guide them, explain the concept, or point out the specific error in their current code.`;

    const reply = await generateText(prompt, { maxWaitMs: 45 * 1000 });
    return res.json({ reply });
  } catch (error) {
    console.error('🔥 Chat failed:', error.status || '', error.message);
    // 200 on purpose: the frontend shows this text instead of "couldn't connect to the server"
    return res.json({ reply: "I'm having trouble reaching my AI brain right now. Please try again in a few seconds." });
  }
};

module.exports = { chatWithTutor };
