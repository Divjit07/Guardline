const counts = new Map();

const MAX_MESSAGES = parseInt(process.env.RATE_LIMIT_MAX_MESSAGES || '20', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_HOURS || '1', 10) * 3600000;

function checkRateLimit(phone) {
  const now = Date.now();
  const entry = counts.get(phone);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    counts.set(phone, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_MESSAGES) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}

module.exports = { checkRateLimit };
