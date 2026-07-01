const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wacebhnvymggciqpebsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTYxMDksImV4cCI6MjA5NTEzMjEwOX0.iMboHTv5XGCezAqqNsWiGd_5Ec2Q_JyaEoecCVpxRfo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing select *...');
  const { data: data1, error: err1 } = await supabase.from('profiles').select('*').limit(1);
  console.log('Select * result:', err1 ? err1 : 'Success', data1 ? data1.length : 0);

  console.log('Testing select id...');
  const { data: data2, error: err2 } = await supabase.from('profiles').select('id').limit(1);
  console.log('Select id result:', err2 ? err2 : 'Success', data2 ? data2.length : 0);
  
  // Try to authenticate (we can't without a password, but we can just use the anon key)
}

test();
