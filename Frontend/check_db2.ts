import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing supabase keys in .env", { SUPABASE_URL, SUPABASE_ANON_KEY });
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data: doctors, error: dErr } = await supabase.from('doctors').select('*');
  console.log('Doctors Count:', doctors?.length, dErr);
  if (doctors) {
      console.log('Doctors Data:', JSON.stringify(doctors, null, 2));
  }

  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log('Profiles Count:', profiles?.length, pErr);
  if (profiles) {
    const drs = profiles.filter(p => p.role === 'doctor');
    console.log('Profiles with role=doctor:', JSON.stringify(drs, null, 2));
  }
}
run();
