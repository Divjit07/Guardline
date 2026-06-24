const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err) {
  const msg = err.message || '';
  return msg.includes('429') || msg.includes('503') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('UNAVAILABLE');
}

async function getAIResponse(systemPrompt, history, userMessage) {
  const ai = getAI();
  if (!ai) {
    logger.warn('GEMINI_API_KEY not set — AI unavailable');
    return null;
  }

  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const chat = ai.chats.create({
          model,
          history: formattedHistory,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0,
            maxOutputTokens: 2000,
          },
        });

        const result = await chat.sendMessage({ message: userMessage });
        let text = (result.text || '').replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        try {
          logger.info('AI response ok', { model });
          return JSON.parse(text);
        } catch {
          logger.warn('AI returned non-JSON response', { model, text: text.slice(0, 200) });
          return null;
        }
      } catch (err) {
        if (isRetryable(err) && attempt === 0) {
          logger.warn('AI retryable error, waiting 3s', { model });
          await sleep(3000);
          continue;
        }
        logger.warn('AI call failed', { model, error: err.message.slice(0, 120) });
        break;
      }
    }
  }

  logger.error('All AI models failed');
  return null;
}

module.exports = { getAIResponse };
