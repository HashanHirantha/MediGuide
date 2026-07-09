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
 * Fetch unique specialties from verified doctors.
 */
export async function getUniqueSpecialties() {
  const { data, error } = await supabase
    .from('doctors')
    .select('specialty')
    .eq('is_verified', true);
  
  if (error || !data) return [];
  
  const unique = Array.from(new Set(data.map(d => d.specialty)));
  return unique.sort();
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
  'general practitioner':       'General Practitioner',
  'gp':                         'General Practitioner',
  'general medicine':           'General Practitioner',
  'family medicine':            'General Practitioner',
  'family physician':           'General Practitioner',
  'internal medicine':          'General Practitioner',
  'internist':                  'General Practitioner',
  // Pulmonology
  'pulmonologist':              'Pulmonologist',
  'pulmonology':                'Pulmonologist',
  'respiratory specialist':     'Pulmonologist',
  'chest physician':            'Pulmonologist',
  // Cardiology
  'cardiologist':               'Cardiologist',
  'cardiology':                 'Cardiologist',
  'heart specialist':           'Cardiologist',
  // Neurology
  'neurologist':                'Neurologist',
  'neurology':                  'Neurologist',
  'brain specialist':           'Neurologist',
  // Endocrinology
  'endocrinologist':            'Endocrinologist',
  'endocrinology':              'Endocrinologist',
  'diabetes specialist':        'Endocrinologist',
  'thyroid specialist':         'Endocrinologist',
  // Gastroenterology
  'gastroenterologist':         'Gastroenterologist',
  'gastroenterology':           'Gastroenterologist',
  'gi specialist':              'Gastroenterologist',
  // ENT
  'ent specialist':             'ENT Specialist',
  'ent':                        'ENT Specialist',
  'otolaryngologist':           'ENT Specialist',
  'ear nose throat':            'ENT Specialist',
  // Dermatology
  'dermatologist':              'Dermatologist',
  'dermatology':                'Dermatologist',
  'skin specialist':            'Dermatologist',
  // Orthopedics
  'orthopedic surgeon':         'Orthopedic Surgeon',
  'orthopedics':                'Orthopedic Surgeon',
  'orthopaedic surgeon':        'Orthopedic Surgeon',
  'orthopedist':                'Orthopedic Surgeon',
  'bone specialist':            'Orthopedic Surgeon',
  // Ophthalmology
  'ophthalmologist':            'Ophthalmologist',
  'ophthalmology':              'Ophthalmologist',
  'eye doctor':                 'Ophthalmologist',
  'eye specialist':             'Ophthalmologist',
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
    .maybeSingle();
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
    experience_years?: number;
  }
) {
  // 1. Update the role in profiles to 'doctor' so their profile is public to patients
  const { error: roleError } = await supabase
    .from('profiles')
    .update({ role: 'doctor' })
    .eq('id', userId);

  if (roleError) {
    console.error('[DoctorService] Role update error:', roleError);
    return { data: null, error: roleError };
  }

  // Sanitize empty strings
  const specialty = doctorData.specialty?.trim() || 'General Practitioner';
  const qualification = doctorData.qualification?.trim() || 'MBBS';

  const updatePayload = {
    ...doctorData,
    specialty,
    qualification,
    is_verified: true
  };

  // 2. Check if doctor exists in doctors table
  const { data: existingDoc } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingDoc) {
    return supabase
      .from('doctors')
      .update(updatePayload)
      .eq('user_id', userId);
  } else {
    // Insert new doctor record if it doesn't exist
    return supabase
      .from('doctors')
      .insert([
        {
          user_id: userId,
          registration_no: `REG-${Date.now()}`,
          ...updatePayload
        }
      ]);
  }
}
