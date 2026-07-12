import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    
    let supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    if (host && host.includes('localhost')) {
        supabaseUrl = `http://${host.split(':')[0]}:54321`; 
    }
    
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: req.headers.get('Authorization') ? { Authorization: req.headers.get('Authorization')! } : {},
      },
    });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // --- 1. Delete expired unconfirmed appointments ---
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('status', 'pending')
      .lt('appointment_date', todayStr);

    if (deleteError) {
      console.error('Failed to delete expired unconfirmed appointments:', deleteError);
    }

    // --- 2. Fetch all confirmed appointments for tomorrow ---
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, appointment_time, doctors(profiles(first_name, last_name, expo_push_token, notify_appointments)), patient:profiles!appointments_patient_id_fkey(first_name, last_name, expo_push_token, notify_appointments)')
      .eq('status', 'confirmed')
      .eq('appointment_date', tomorrowStr);

    if (fetchError) {
      throw fetchError;
    }

    const results = [];

    // --- 3. Notify patients AND doctors ---
    if (appointments && appointments.length > 0) {
      for (const apt of appointments) {
        const patient = apt.patient as any;
        const doctor = apt.doctors as any;

        const docName = `Dr. ${doctor?.profiles?.first_name} ${doctor?.profiles?.last_name}`;
        const patientName = `${patient?.first_name} ${patient?.last_name}`;

        // Notify Patient
        if (patient?.expo_push_token && patient?.notify_appointments !== false) {
          const pushPayload = {
            expo_push_token: patient.expo_push_token,
            title: 'Appointment Reminder',
            body: `Reminder: You have an appointment with ${docName} tomorrow at ${apt.appointment_time}.`,
            data: { type: 'appointment_reminder', appointmentId: apt.id }
          };

          try {
            const { error: invokeError } = await supabase.functions.invoke('send-notification', { body: pushPayload });
            if (invokeError) throw invokeError;
            results.push({ id: apt.id, recipient: 'patient', status: 'sent' });
          } catch (e) {
            console.error(`Failed to send to patient ${patient.expo_push_token}`, e);
            results.push({ id: apt.id, recipient: 'patient', status: 'error', error: e });
          }
        }

        // Notify Doctor
        if (doctor?.profiles?.expo_push_token && doctor?.profiles?.notify_appointments !== false) {
          const pushPayload = {
            expo_push_token: doctor.profiles.expo_push_token,
            title: 'Upcoming Appointment',
            body: `Reminder: You have a confirmed appointment with ${patientName} tomorrow at ${apt.appointment_time}.`,
            data: { type: 'appointment_reminder', appointmentId: apt.id }
          };

          try {
            const { error: invokeError } = await supabase.functions.invoke('send-notification', { body: pushPayload });
            if (invokeError) throw invokeError;
            results.push({ id: apt.id, recipient: 'doctor', status: 'sent' });
          } catch (e) {
            console.error(`Failed to send to doctor ${doctor.profiles.expo_push_token}`, e);
            results.push({ id: apt.id, recipient: 'doctor', status: 'error', error: e });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Processed appointment reminders and cleanup', 
        date: tomorrowStr,
        processed: results.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
