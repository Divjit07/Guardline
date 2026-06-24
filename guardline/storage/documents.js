const supabase = require('./supabase');

async function getDocument(key) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('key', key)
    .eq('active', true)
    .maybeSingle();
  if (error) console.error('[documents] get error:', error.message);
  return data;
}

module.exports = { getDocument };
