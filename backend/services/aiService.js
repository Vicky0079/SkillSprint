const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || '').trim() });

// Models are tried in this order. If one is retired (404) or out of quota (429), the next one is used.
// Put GEMINI_MODEL=<name> in backend/.env to force a preferred first model.
const MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
].filter(Boolean).filter((m, i, a) => a.indexOf(m) === i);

let MODEL = MODELS[0]; // last model that worked (kept for backward compatibility)

const MAX_WAIT_MS = Number(process.env.GEMINI_MAX_WAIT_MS) || 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const statusOf = (err) => (typeof err?.status === 'number' && err.status >= 100 ? err.status : undefined);
const isAbort = (err) => err?.name === 'AbortError' || err?.code === 20 || /abort|timed out|timeout|deadline/i.test(err?.message || '');
const msgOf = (err) => err?.message || String(err);

// Busy / network problems: worth retrying the same model.
const isRetryable = (err) => {
  const s = statusOf(err);
  if (typeof s === 'number') return s === 408 || s === 500 || s === 502 || s === 503 || s === 504;
  return /timeout|timed out|ECONNRESET|ENOTFOUND|EAI_AGAIN|fetch failed|overloaded|unavailable/i.test(msgOf(err));
};
// Problem with THIS model only: try the next model.
const shouldSwitchModel = (err) => {
  const s = statusOf(err);
  return isAbort(err) || s === 404 || s === 429 || /not found|no longer available|not supported|quota|RESOURCE_EXHAUSTED/i.test(msgOf(err));
};
// Bad key / permission: no model will work, tell the developer clearly.
const isKeyProblem = (err) => {
  const s = statusOf(err);
  return s === 401 || s === 403 || /API key|API_KEY_INVALID|PERMISSION_DENIED|unregistered callers/i.test(msgOf(err));
};

/**
 * Core call with retry + model fallback. Returns the response text.
 * options: { json: boolean, isCancelled: async () => boolean, maxWaitMs: number }
 */
const generateText = async (prompt, options = {}) => {
  const { json = false, isCancelled, maxWaitMs = 60 * 1000, attemptTimeoutMs = 25 * 1000 } = options;
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing. Check backend/.env');

  const startedAt = Date.now();
  let lastError;
  const order = [MODEL, ...MODELS.filter((m) => m !== MODEL)];

  // Every model always gets at least one attempt, so one slow model can't use up the whole time budget.
  for (const model of order) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (isCancelled && (await isCancelled())) return null;
      if (attempt > 1 && Date.now() - startedAt > maxWaitMs) break;
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            httpOptions: { timeout: attemptTimeoutMs },
            ...(json ? { responseMimeType: 'application/json' } : {}),
          },
        });
        const text = response.text;
        if (!text) throw new Error('Empty response from Gemini');
        if (model !== MODEL) console.log(`[AI] switched to model ${model}`);
        MODEL = model;
        return text;
      } catch (error) {
        lastError = error;
        console.error(`[AI] model=${model} attempt=${attempt} status=${statusOf(error) ?? 'n/a'}: ${msgOf(error).slice(0, 200)}`);
        if (isKeyProblem(error)) throw error;
        if (shouldSwitchModel(error)) break;                       // 404 / 429: next model
        if (statusOf(error) === 503 || statusOf(error) === 504) break; // overloaded / timeout: next model
        if (!isRetryable(error)) throw error;
        await sleep(1500);
      }
    }
  }
  throw lastError || new Error('Gemini unavailable');
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

Return ONLY a valid JSON object (no markdown fences) with:
- "score": an integer between 0 and 100.
- "feedback": a string (markdown allowed) with your detailed feedback.

Student's Submission:
---
${content}
---
`;

const parseJson = (text) => JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim());

// Same signature as before, so submissionController.js needs no change.
const generateFeedback = async ({ content, challenge, language = 'python', isCancelled }) => {
  const prompt = buildPrompt({ content, challenge, language });
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    if (isCancelled && (await isCancelled())) return null;
    try {
      const text = await generateText(prompt, { json: true, isCancelled, maxWaitMs: 90 * 1000, attemptTimeoutMs: 60 * 1000 });
      if (text === null) return null;
      const parsed = parseJson(text);
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
      if (Number.isNaN(score) || typeof parsed.feedback !== 'string') throw new Error('Bad AI response shape');
      return { score, feedback: parsed.feedback };
    } catch (error) {
      lastError = error;
      if (isKeyProblem(error)) throw error;
      if (!(isRetryable(error) || shouldSwitchModel(error) || error instanceof SyntaxError || /Bad AI response|Empty response/.test(msgOf(error)))) throw error;
      await sleep(5000);
    }
  }
  throw new Error(`Gemini stayed unavailable for ${Math.round(MAX_WAIT_MS / 1000)}s: ${msgOf(lastError)}`);
};

module.exports = { generateFeedback, generateText, ai, MODELS, isRetryable, get MODEL() { return MODEL; } };
