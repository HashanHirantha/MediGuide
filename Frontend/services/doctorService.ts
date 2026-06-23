import { supabase } from '../lib/supabase';

/**
 * Fetch verified doctors, optionally filtered by specialty.
 */
export async function getDoctors(specialty?: string) {
  let query = supabase
    .from('doctors')
    .select('*, profiles(first_name, last_name, profile_image)')
    .eq('is_verified', true)
    .order('average_rating', { ascending: false });

  if (specialty) {
    query = query.ilike('specialty', specialty);
  }

  return query;
}

/**
 * Get a single doctor's full profile with reviews.
 */
export async function getDoctorById(id: string) {
  return supabase
    .from('doctors')
    .select('*, profiles(first_name, last_name, profile_image, email, phone)')
    .eq('id', id)
    .single();
}

/**
 * Get reviews for a doctor.
 */
export async function getDoctorReviews(doctorId: string) {
  return supabase
    .from('reviews')
    .select('*, profiles(first_name, last_name)')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });
}

/**
 * Submit a review for a doctor.
 */
export async function submitReview(review: {
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  rating: number;
  comment?: string;
  is_anonymous?: boolean;
}) {
  return supabase.from('reviews').insert(review);
}

/**
 * Fetch verified doctors matching any of the given specialties, ordered by average rating (highest first).
 * Used by the RecommendedDoctors component after symptom analysis.
 *
 * @param specialties - Array of specialty names (must match DB values exactly)
 */
export async function getRecommendedDoctors(specialties: string[]) {
  if (specialties.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from('doctors')
    .select('*, profiles(first_name, last_name, profile_image)')
    .eq('is_verified', true)
    .in('specialty', specialties)
    .order('average_rating', { ascending: false });
}
