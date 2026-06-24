const supabase = require('./supabase');

const EXPIRY_HOURS = parseInt(process.env.CONVERSATION_EXPIRY_HOURS || '4', 10);

function emptyConversation(phone) {
  return { guard_phone: phone, site: null, history: [], active_incident_id: null };
}

async function getConversation(phone) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('guard_phone', phone)
    .maybeSingle();

  if (error) console.error('[conversations] get error:', error.message);
  if (!data) return emptyConversation(phone);

  const hoursSince = (Date.now() - new Date(data.last_active).getTime()) / 3600000;
  if (hoursSince > EXPIRY_HOURS) {
    await clearConversation(phone);
    return emptyConversation(phone);
  }
  return data;
}

async function saveConversation(phone, updates) {
  const { error } = await supabase.from('conversations').upsert({
    guard_phone: phone,
    ...updates,
    last_active: new Date().toISOString(),
  });
  if (error) console.error('[conversations] save error:', error.message);
}

async function clearConversation(phone) {
  const { error } = await supabase.from('conversations').delete().eq('guard_phone', phone);
  if (error) console.error('[conversations] clear error:', error.message);
}

module.exports = { getConversation, saveConversation, clearConversation };
