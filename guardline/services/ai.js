const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

async function getAIResponse(systemPrompt, history, userMessage) {
  if (!genAI) {
    logger.warn('GEMINI_API_KEY not set — AI unavailable');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0, maxOutputTokens: 1000 },
    });

    const formattedHistory = history.map((msg, i) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: i === 0 ? `${systemPrompt}\n\n${msg.content}` : msg.content }],
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(userMessage);
    let text = result.response.text().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
      return JSON.parse(text);
    } catch {
      logger.warn('AI returned non-JSON response', { text: text.slice(0, 200) });
      return null;
    }
  } catch (err) {
    logger.error('AI call failed', { error: err.message });
    return null;
  }
}

module.exports = { getAIResponse };
