const supabase = require('./supabase');

async function guardByPhone(phone) {
  const { data, error } = await supabase
    .from('guards')
    .select('*')
    .eq('phone', phone)
    .eq('active', true)
    .maybeSingle();

  if (error) console.error('[roster] guardByPhone error:', error.message);
  if (!data) {
    return { name: 'Unknown Guard', phone, site: null, default_site: null, isKnown: false };
  }
  return { ...data, site: data.default_site, isKnown: true };
}

module.exports = { guardByPhone };
