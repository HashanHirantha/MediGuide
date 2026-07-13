import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://wacebhnvymggciqpebsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTYxMDksImV4cCI6MjA5NTEzMjEwOX0.iMboHTv5XGCezAqqNsWiGd_5Ec2Q_JyaEoecCVpxRfo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  // Fetch doctors
  const { data: doctors, error } = await supabase.from('doctors').select('*, profiles(first_name, last_name)');
  if (error) {
    console.error('Error fetching doctors:', error);
    return;
  }
  
  console.log('Doctors found:', doctors.length);
  
  const imagesDir = '/media/twisted/Local Disk/Projects/Ubuntu/MediGuide/supabase/images';
  const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  
  console.log('Images to upload:', imageFiles.length);

  for (let i = 0; i < Math.min(doctors.length, imageFiles.length); i++) {
    const doctor = doctors[i];
    const imageFile = imageFiles[i];
    const filePath = path.join(imagesDir, imageFile);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create bucket if not exists? supabase doesn't allow anon bucket creation usually. We assume doctors bucket exists.
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('doctors')
      .upload(`profiles/${doctor.id}/${imageFile}`, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`Error uploading for doctor ${doctor.id}:`, uploadError);
      continue;
    }
    
    const { data: publicUrlData } = supabase.storage.from('doctors').getPublicUrl(`profiles/${doctor.id}/${imageFile}`);
    const publicUrl = publicUrlData.publicUrl;
    
    console.log(`Uploaded ${imageFile} to ${publicUrl}`);
    
    const { error: updateError } = await supabase.from('doctors')
      .update({ profile_image: publicUrl })
      .eq('id', doctor.id);
      
    if (updateError) {
      console.error(`Error updating doctor ${doctor.id}:`, updateError);
    } else {
      console.log(`Updated doctor ${doctor.id} with new profile image url.`);
    }
  }
  
  console.log('Done uploading local images.');
}

run();
