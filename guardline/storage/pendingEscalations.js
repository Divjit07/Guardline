const supabase = require('./supabase');

async function savePendingEscalation(esc) {
  const { error } = await supabase.from('pending_escalations').insert(esc);
  if (error) console.error('[pendingEscalations] save error:', error.message);
  return !error;
}

async function getDuePendingEscalations() {
  const { data, error } = await supabase
    .from('pending_escalations')
    .select('*')
    .eq('fired', false)
    .lte('fire_at', new Date().toISOString());
  if (error) console.error('[pendingEscalations] getDue error:', error.message);
  return data || [];
}

async function markEscalationFired(id) {
  const { error } = await supabase
    .from('pending_escalations')
    .update({ fired: true, fired_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.error('[pendingEscalations] markFired error:', error.message);
}

module.exports = { savePendingEscalation, getDuePendingEscalations, markEscalationFired };
