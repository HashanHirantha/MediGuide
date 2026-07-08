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
 * Maps common AI-generated specialist job titles → actual DB specialty department names.
 * Gemini often returns e.g. "General Practitioner" but the DB stores "General Medicine".
 */
const SPECIALTY_ALIASES: Record<string, string> = {
  // General
  'general practitioner':       'General Medicine',
  'gp':                         'General Medicine',
  'family medicine':            'General Medicine',
  'family physician':           'General Medicine',
  'internal medicine':          'General Medicine',
  'internist':                  'General Medicine',
  // Pulmonology
  'pulmonologist':              'Pulmonology',
  'respiratory specialist':     'Pulmonology',
  'chest physician':            'Pulmonology',
  // Cardiology
  'cardiologist':               'Cardiology',
  'heart specialist':           'Cardiology',
  // Neurology
  'neurologist':                'Neurology',
  'brain specialist':           'Neurology',
  // Endocrinology
  'endocrinologist':            'Endocrinology',
  'diabetes specialist':        'Endocrinology',
  'thyroid specialist':         'Endocrinology',
  // Gastroenterology
  'gastroenterologist':         'Gastroenterology',
  'gi specialist':              'Gastroenterology',
  // ENT
  'ent specialist':             'ENT',
  'otolaryngologist':           'ENT',
  'ear nose throat':            'ENT',
  // Dermatology
  'dermatologist':              'Dermatology',
  'skin specialist':            'Dermatology',
  // Orthopedics
  'orthopedic surgeon':         'Orthopedics',
  'orthopaedic surgeon':        'Orthopedics',
  'orthopedist':                'Orthopedics',
  'bone specialist':            'Orthopedics',
  // Ophthalmology
  'ophthalmologist':            'Ophthalmology',
  'eye doctor':                 'Ophthalmology',
  'eye specialist':             'Ophthalmology',
};

/**
 * Normalize an array of specialty strings from AI output to DB-stored values.
 * Falls through the alias map; if no alias found, keeps the original value.
 */
function normalizeSpecialties(specialties: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const sp of specialties) {
    const key = sp.toLowerCase().trim();
    const normalized = SPECIALTY_ALIASES[key] ?? sp;
    if (!seen.has(normalized.toLowerCase())) {
      seen.add(normalized.toLowerCase());
      result.push(normalized);
    }
  }

  return result;
}

/**
 * Fetch verified doctors matching any of the given specialties, ordered by average rating (highest first).
 * Automatically normalizes AI-generated specialist titles to DB specialty department names.
 *
 * @param specialties - Array of specialty names from AI (may include titles like "General Practitioner")
 */
export async function getRecommendedDoctors(specialties: string[]) {
  if (specialties.length === 0) {
    return { data: [], error: null };
  }

  // Normalize AI titles → DB department names (e.g. "General Practitioner" → "General Medicine")
  const normalized = normalizeSpecialties(specialties);
  console.log('[DoctorService] Querying specialties:', normalized.join(', '));

  // Build case-insensitive OR filter
  const orFilter = normalized
    .map((s) => `specialty.ilike.${s}`)
    .join(',');

  return supabase
    .from('doctors')
    .select('*, profiles(first_name, last_name, profile_image)')
    .eq('is_verified', true)
    .or(orFilter)
    .order('average_rating', { ascending: false });
}

/**
 * Fetch a doctor's profile by their user_id.
 */
export async function getDoctorProfileByUserId(userId: string) {
  return supabase
    .from('doctors')
    .select('*, profiles(first_name, last_name, profile_image, email, phone)')
    .eq('user_id', userId)
    .single();
}

/**
 * Update a doctor's profile and schedule details.
 */
export async function updateDoctorProfile(
  userId: string,
  doctorData: {
    specialty?: string;
    qualification?: string;
    hospital_name?: string;
    consultation_fee?: number;
    available_days?: string;
    available_from?: string;
    available_to?: string;
  }
) {
  return supabase
    .from('doctors')
    .update(doctorData)
    .eq('user_id', userId);
}
