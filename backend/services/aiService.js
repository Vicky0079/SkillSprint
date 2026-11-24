const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// NOTE: 'gemini-1.5-flash-latest' was shut down by Google (Sept 2025), so every call failed
// and the old fake grader always kicked in. Set GEMINI_MODEL in .env to change the model.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// How long we keep retrying a busy/overloaded Gemini before giving up (default 5 min).
const MAX_WAIT_MS = Number(process.env.GEMINI_MAX_WAIT_MS) || 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Only "busy / network" problems are worth waiting for. Bad model name, bad key,
// bad request etc. will never fix themselves, so those fail immediately.
const isRetryable = (err) => {
  const status = err?.status ?? err?.code;
  if (typeof status === 'number') return status === 408 || status === 429 || status >= 500;
  return /timeout|timed out|ECONNRESET|ENOTFOUND|EAI_AGAIN|fetch failed|overloaded|unavailable/i.test(err?.message || '');
};

const buildPrompt = ({ content, challenge, language }) => `
You are an expert, strict code evaluator for a platform called SkillSprint.
Review the student's ${language} submission for this challenge.

Challenge title: ${challenge.title}
Category: ${challenge.category}
Task description:
${challenge.description}

CRITICAL INSTRUCTIONS:
1. Mentally run the code against the task description. The output must match the task EXACTLY
   (including punctuation such as "!" and capitalisation).
2. If the code has ANY bug, syntax error or wrong output, give a score below 100. State the exact line,
   explain the error, and provide the corrected code.
3. Only give 100 if the code is completely correct, and praise the logic.
4. Empty or irrelevant code scores 0.

Return a valid JSON object with:
- "score": an integer between 0 and 100.
- "feedback": a string (markdown allowed) with your detailed feedback.

Student's Submission:
---
${content}
---
`;

/**
 * Asks Gemini to review the code and WAITS for it (retrying while Gemini is busy).
 * There is no fake fallback grader here anymore.
 *
 * isCancelled: optional async () => boolean. Checked between retries; if it returns true
 * (e.g. the student clicked "skip") we stop calling Gemini and return null.
 * Throws if Gemini fails permanently or stays unavailable longer than MAX_WAIT_MS.
 */
const generateFeedback = async ({ content, challenge, language = 'python', isCancelled }) => {
  const prompt = buildPrompt({ content, challenge, language });
  const startedAt = Date.now();
  let attempt = 0;
  let lastError;

  while (Date.now() - startedAt < MAX_WAIT_MS) {
    if (isCancelled && (await isCancelled())) return null;
    attempt += 1;

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          httpOptions: { timeout: REQUEST_TIMEOUT_MS },
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: { score: { type: 'integer' }, feedback: { type: 'string' } },
            required: ['score', 'feedback'],
          },
        },
      });

      const parsed = JSON.parse(response.text);
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
      if (Number.isNaN(score) || typeof parsed.feedback !== 'string') throw new Error('Bad AI response shape');
      return { score, feedback: parsed.feedback };
    } catch (error) {
      lastError = error;
      console.log(`AI attempt ${attempt} failed (${error.status || 'n/a'}): ${error.message}`);
      if (!isRetryable(error)) throw error;
      await sleep(Math.min(3000 * 2 ** (attempt - 1), 30000)); // 3s, 6s, 12s, 24s, 30s, 30s...
    }
  }

  throw new Error(`Gemini stayed unavailable for ${Math.round(MAX_WAIT_MS / 1000)}s: ${lastError?.message}`);
};

module.exports = { generateFeedback, ai, MODEL, isRetryable };
