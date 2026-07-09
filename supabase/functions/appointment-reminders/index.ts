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
    // Determine the environment and construct the base URL
    // Try to get the local URL from the origin header first
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    
    // In local development, SUPABASE_URL might not be fully accurate for inter-function calls, 
    // so we use the request's host/origin if available. In production, we use the env vars.
    let supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    if (host && host.includes('localhost')) {
        supabaseUrl = `http://${host.split(':')[0]}:54321`; // standard local port
    }
    
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Create a Supabase client with the Auth context of the logged in user (or anon)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // 1. Calculate tomorrow's date (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 2. Fetch all confirmed appointments for tomorrow
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, appointment_time, doctors(profiles(first_name, last_name)), patient:profiles!appointments_patient_id_fkey(expo_push_token, notify_appointments)')
      .eq('status', 'confirmed')
      .eq('appointment_date', tomorrowStr);

    if (fetchError) {
      throw fetchError;
    }

    const results = [];

    // 3. For each appointment, if the patient has a push token and notifications enabled, send it
    if (appointments && appointments.length > 0) {
      for (const apt of appointments) {
        const patient = apt.patient as any;
        const doctor = apt.doctors as any;

        if (patient?.expo_push_token && patient?.notify_appointments !== false) {
          const docName = `Dr. ${doctor?.profiles?.first_name} ${doctor?.profiles?.last_name}`;
          
          const pushPayload = {
            expo_push_token: patient.expo_push_token,
            title: 'Appointment Reminder',
            body: `Reminder: You have an appointment with ${docName} tomorrow at ${apt.appointment_time}.`,
            data: { type: 'appointment_reminder', appointmentId: apt.id }
          };

          // Invoke the send-notification function
          try {
            const { error: invokeError } = await supabase.functions.invoke('send-notification', {
              body: pushPayload
            });
            if (invokeError) throw invokeError;
            results.push({ id: apt.id, status: 'sent' });
          } catch (e) {
            console.error(`Failed to send to ${patient.expo_push_token}`, e);
            results.push({ id: apt.id, status: 'error', error: e });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Processed appointment reminders for tomorrow', 
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
