const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — storage calls will fail');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
