const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wacebhnvymggciqpebsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTYxMDksImV4cCI6MjA5NTEzMjEwOX0.iMboHTv5XGCezAqqNsWiGd_5Ec2Q_JyaEoecCVpxRfo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log('Seeding mock doctor...');
  
  // 1. Sign up the doctor
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'dr.smith@mediguide.com',
    password: 'password123',
    options: {
      data: {
        first_name: 'James',
        last_name: 'Smith',
      }
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log('User already registered. Trying to log in to verify...');
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: 'dr.smith@mediguide.com',
            password: 'password123'
        });
        if (loginError) {
            console.error('Login failed! password might be wrong or email not confirmed:', loginError.message);
        } else {
            console.log('Login successful. Updating role...');
            await updateRole(authData?.user?.id || (await supabase.auth.getUser()).data.user.id);
        }
    } else {
        console.error('Auth error:', authError.message);
        return;
    }
  } else {
      console.log('User created:', authData.user?.id);
      await updateRole(authData.user.id);
  }
}

async function updateRole(userId) {
    if (!userId) {
        console.error('No user ID found');
        return;
    }
    // Update role in profiles
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'doctor', first_name: 'James', last_name: 'Smith' })
        .eq('id', userId);
        
    if (profileError) {
        console.error('Profile update error:', profileError.message);
    } else {
        console.log('Profile updated to doctor.');
    }

    // Insert into doctors table
    const { error: doctorError } = await supabase
        .from('doctors')
        .upsert({
            user_id: userId,
            registration_no: 'REG-DOC-001-' + Math.floor(Math.random() * 1000),
            specialty: 'Cardiologist',
            qualification: 'MD, FACC',
            experience_years: 15,
            hospital_name: 'MediGuide Central Hospital',
            consultation_fee: 150.00,
            available_days: 'Mon,Wed,Fri'
        }, { onConflict: 'user_id' });
        
    if (doctorError) {
        console.error('Doctor table insertion error:', doctorError.message);
    } else {
        console.log('Doctor details inserted successfully.');
    }
    console.log('Done!');
}

seed();
