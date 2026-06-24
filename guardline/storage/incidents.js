const supabase = require('./supabase');

async function saveIncident(incident) {
  const { error } = await supabase.from('incidents').insert(incident);
  if (error) console.error('[incidents] save failed:', error.message);
  return !error;
}

async function getIncident(id) {
  const { data, error } = await supabase.from('incidents').select('*').eq('id', id).maybeSingle();
  if (error) console.error('[incidents] get error:', error.message);
  return data;
}

async function updateIncident(id, updates) {
  const { error } = await supabase.from('incidents').update(updates).eq('id', id);
  if (error) console.error('[incidents] update error:', error.message);
  return !error;
}

async function getOvernightIncidents() {
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .gte('timestamp', since)
    .order('timestamp', { ascending: true });
  if (error) console.error('[incidents] overnight query error:', error.message);
  return data || [];
}

async function listIncidents({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) console.error('[incidents] list error:', error.message);
  return data || [];
}

module.exports = { saveIncident, getIncident, updateIncident, getOvernightIncidents, listIncidents };
