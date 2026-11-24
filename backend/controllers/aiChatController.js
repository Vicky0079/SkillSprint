const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chatWithTutor = async (req, res) => {
  try {
    const { message, challengeDescription, userCode } = req.body;

    const prompt = `
      You are an expert, encouraging coding tutor for SkillSprint. 
      The student is working on this challenge: "${challengeDescription}".
      
      Their current code is:
      \`\`\`
      ${userCode || "No code written yet."}
      \`\`\`
      
      The student asks: "${message}"
      
      Provide a helpful, concise response. 
      CRITICAL RULE: DO NOT give them the full correct code directly. Instead, guide them, explain the concept, or point out the specific error in their current code.
    `;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash', // <-- FIXED MODEL NAME
          contents: prompt,
        });
        return res.json({ reply: response.text });
      } catch (error) {
        console.error(`🔥 Chat Attempt ${attempt} failed:`, error.message);
        
        if (attempt === 3) {
          return res.status(500).json({ 
            reply: "I'm having trouble connecting to my brain right now (High API Demand). Please try again in a few seconds!" 
          });
        }
        await sleep(2000); 
      }
    }
  } catch (error) {
    console.error("🔥 Server Error in Chat Controller:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { chatWithTutor };