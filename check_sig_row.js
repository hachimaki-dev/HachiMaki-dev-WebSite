import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rieloabfccxbczsbxtnh.supabase.co';
const supabaseKey = 'sb_publishable_xo_fe3Fd4U828vaXJKonUg_T9Sj5Hu8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: sigs, error: sigsErr } = await supabase
    .from('p2p_signaling')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (sigsErr) console.error(sigsErr);
  else console.log(JSON.stringify(sigs, null, 2));
}

check();
