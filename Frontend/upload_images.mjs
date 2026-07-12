import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://wacebhnvymggciqpebsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTYxMDksImV4cCI6MjA5NTEzMjEwOX0.iMboHTv5XGCezAqqNsWiGd_5Ec2Q_JyaEoecCVpxRfo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const files = [
  { name: 'doctor_kamal.png', path: '/home/twisted/.gemini/antigravity-ide/brain/21915b4d-f18b-4a2e-b9e1-1d7c46b59426/doctor_kamal_1783871563584.png' },
  { name: 'doctor_priyanthi.png', path: '/home/twisted/.gemini/antigravity-ide/brain/21915b4d-f18b-4a2e-b9e1-1d7c46b59426/doctor_priyanthi_1783871611225.png' },
  { name: 'doctor_saman.png', path: '/home/twisted/.gemini/antigravity-ide/brain/21915b4d-f18b-4a2e-b9e1-1d7c46b59426/doctor_saman_1783871626356.png' },
  { name: 'doctor_aruni.png', path: '/home/twisted/.gemini/antigravity-ide/brain/21915b4d-f18b-4a2e-b9e1-1d7c46b59426/doctor_aruni_1783871641711.png' },
  { name: 'doctor_asanka.png', path: '/home/twisted/.gemini/antigravity-ide/brain/21915b4d-f18b-4a2e-b9e1-1d7c46b59426/doctor_asanka_1783871660533.png' },
  { name: 'doctor_tharushi.png', path: '/home/twisted/.gemini/antigravity-ide/brain/21915b4d-f18b-4a2e-b9e1-1d7c46b59426/doctor_tharushi_1783871678293.png' },
  { name: 'doctor_dinesh.png', path: '/home/twisted/.gemini/antigravity-ide/brain/21915b4d-f18b-4a2e-b9e1-1d7c46b59426/doctor_dinesh_1783871696417.png' }
];

async function upload() {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'nimal.perera@mediguide.lk',
    password: 'password123'
  });
  
  const uid = signInData?.user?.id;
  if (!uid) { console.error('No UID available.'); return; }
  
  for (const f of files) {
    const fileBuffer = fs.readFileSync(f.path);
    const { data, error } = await supabase.storage
      .from('patients')
      .upload(`${uid}/${f.name}`, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading', f.name, error);
    } else {
      const { data: publicUrlData } = supabase.storage.from('patients').getPublicUrl(`${uid}/${f.name}`);
      console.log(`${f.name} URL:`, publicUrlData.publicUrl);
    }
  }
}

upload();
