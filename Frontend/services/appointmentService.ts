import { supabase } from '../lib/supabase';

interface AppointmentPayload {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  disease_id?: number | null;
  symptoms_text?: string | null;
  notes?: string | null;
}

/**
 * Create a new appointment booking.
 */
export async function createAppointment(payload: AppointmentPayload) {
  return supabase.from('appointments').insert({ ...payload, status: 'pending' });
}

/**
 * Fetch all appointments for the current user (patient).
 */
export async function getPatientAppointments(userId: string) {
  return supabase
    .from('appointments')
    .select('*, doctors(specialty, consultation_fee, profiles(first_name, last_name, profile_image))')
    .eq('patient_id', userId)
    .order('appointment_date', { ascending: true });
}

/**
 * Get a single appointment by ID.
 */
export async function getAppointmentById(id: string) {
  return supabase
    .from('appointments')
    .select('*, doctors(specialty, hospital_name, consultation_fee, profiles(first_name, last_name, profile_image)), diseases(name, severity)')
    .eq('id', id)
    .single();
}

/**
 * Update appointment status.
 */
export async function updateAppointmentStatus(id: string, status: string, reason?: string) {
  const result = await supabase
    .from('appointments')
    .update({ status, cancellation_reason: reason ?? null })
    .eq('id', id)
    .select('*, doctors(profiles(first_name, last_name)), patient:profiles!appointments_patient_id_fkey(expo_push_token, notify_appointments)')
    .single();

  if (!result.error && result.data) {
    const data = result.data as any;
    
    // Check if the patient has a push token and has appointments notifications enabled
    if (data.patient?.expo_push_token && data.patient?.notify_appointments !== false) {
      const docName = `Dr. ${data.doctors?.profiles?.first_name} ${data.doctors?.profiles?.last_name}`;
      let title = '';
      let body = '';
      
      if (status === 'confirmed') {
        title = 'Appointment Confirmed';
        body = `Your appointment with ${docName} on ${data.appointment_date} has been confirmed!`;
      } else if (status === 'cancelled') {
        title = 'Appointment Cancelled';
        body = `Your appointment with ${docName} on ${data.appointment_date} has been cancelled.`;
      } else if (status === 'completed') {
        title = 'Appointment Completed';
        body = `Your appointment with ${docName} is complete. Tap here to leave a review!`;
      }

      if (title && body) {
        // Trigger Edge Function in background
        supabase.functions.invoke('send-notification', {
          body: {
            expo_push_token: data.patient.expo_push_token,
            title,
            body,
            data: { type: 'appointment_update', appointmentId: id, status }
          }
        }).catch(err => console.error('Error invoking send-notification:', err));
      }
    }
  }

  return { error: result.error, data: result.data };
}

/**
 * Cancel an appointment.
 */
export async function cancelAppointment(id: string, reason?: string) {
  return updateAppointmentStatus(id, 'cancelled', reason);
}

/**
 * Fetch all appointments for a specific doctor.
 */
export async function getDoctorAppointments(doctorId: string) {
  return supabase
    .from('appointments')
    .select('*, profiles(first_name, last_name, profile_image, phone), diseases(name, severity)')
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });
}

/**
 * Subscribe to real-time appointment updates for a specific doctor.
 */
export function subscribeDoctorAppointments(doctorId: string, callback: () => void) {
  const channel = supabase
    .channel(`doctor_appointments_${doctorId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `doctor_id=eq.${doctorId}`,
      },
      (payload) => {
        console.log('Realtime appointment update:', payload);
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to real-time appointment updates for a specific patient.
 */
export function subscribePatientAppointments(patientId: string, callback: () => void) {
  const channel = supabase
    .channel(`patient_appointments_${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        console.log('Realtime patient appointment update:', payload);
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
