import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wacebhnvymggciqpebsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTYxMDksImV4cCI6MjA5NTEzMjEwOX0.iMboHTv5XGCezAqqNsWiGd_5Ec2Q_JyaEoecCVpxRfo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'doctor@mediguide.com',
    password: 'password123'
  });
  if (authErr) {
    console.log('Auth Error:', authErr.message);
    return;
  }
  const userId = authData.user.id;
  console.log('Logged in as:', userId);

  // Try to update role
  const { error: roleErr } = await supabase.from('profiles').update({ role: 'doctor' }).eq('id', userId);
  console.log('Role Update Error:', roleErr);

  // Try to insert
  const { data, error } = await supabase.from('doctors').insert([{
    user_id: userId,
    registration_no: `REG-${Date.now()}`,
    specialty: 'Cardiologist',
    qualification: 'MBBS',
    hospital_name: 'Test',
    consultation_fee: 150,
    is_verified: true
  }]);
  
  console.log('Insert Error:', error);
  console.log('Insert Data:', data);
}
run();
