import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// read from .env
const envPath = path.resolve('.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
  if(line.startsWith('EXPO_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if(line.startsWith('EXPO_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function run() {
  const { data: doctors } = await supabase.from('doctors').select('*');
  console.log('Doctors Count:', doctors?.length);

  if (doctors && doctors.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', doctors.map(d => d.user_id));
    console.log('Profiles for doctors:', profiles);
  }
}
run();
