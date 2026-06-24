function normalizePhone(phone) {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.startsWith('whatsapp:')) return trimmed;
  if (trimmed.startsWith('+')) return `whatsapp:${trimmed}`;
  return `whatsapp:+${trimmed.replace(/\D/g, '')}`;
}

function toSmsPhone(phone) {
  return normalizePhone(phone).replace(/^whatsapp:/, '');
}

module.exports = { normalizePhone, toSmsPhone };
