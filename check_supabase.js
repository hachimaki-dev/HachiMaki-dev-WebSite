import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rieloabfccxbczsbxtnh.supabase.co';
const supabaseKey = 'sb_publishable_xo_fe3Fd4U828vaXJKonUg_T9Sj5Hu8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: peers, error: peersErr } = await supabase.from('peer_libraries').select('*');
  if (peersErr) console.error(peersErr);
  else console.log(JSON.stringify(peers.map(p => ({ visitor_id: p.visitor_id, is_online: p.is_online, last_seen: p.last_seen, files: p.files })), null, 2));
}

check();
