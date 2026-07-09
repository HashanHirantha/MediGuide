import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wacebhnvymggciqpebsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTYxMDksImV4cCI6MjA5NTEzMjEwOX0.iMboHTv5XGCezAqqNsWiGd_5Ec2Q_JyaEoecCVpxRfo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data: d, error } = await supabase.from('doctors').select('*, profiles(first_name, last_name)');
  console.log('Docs Error:', error);
  console.log('Docs Count:', d?.length);
  if (d) console.log('Docs:', JSON.stringify(d, null, 2));

  const { data: p } = await supabase.from('profiles').select('*');
  if (p) console.log('Profiles with role doctor:', p.filter(x => x.role === 'doctor'));
}
run();
