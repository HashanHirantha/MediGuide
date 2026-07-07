/**
 * Deterministic doctor image URL resolver.
 *
 * Resolves a doctor's profile image from multiple possible sources and
 * generates a stable, per-doctor fallback so the same doctor always shows
 * the same placeholder across every screen.
 *
 * Priority order:
 *   1. profiles.profile_image  (from the joined profiles table)
 *   2. doctor.profile_image    (from the doctors table itself)
 *   3. Deterministic fallback  (hash of doctor ID → unique pravatar)
 */

/**
 * Simple numeric hash of a string, used to deterministically pick a
 * fallback avatar image based on the doctor's ID.
 */
function stableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0; // 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Get a consistent image URL for a doctor.
 *
 * @param doctor - A doctor object that may have nested `profiles` and/or a
 *                 top-level `profile_image` field.  The `id` (or any unique
 *                 identifier) is used to generate a stable fallback.
 * @returns A URL string — either the real image or a deterministic placeholder.
 */
export function getDoctorImageUrl(doctor: {
  id?: string;
  profile_image?: string | null;
  profiles?: {
    profile_image?: string | null;
  } | null;
} | null | undefined): string {
  if (!doctor) return 'https://i.pravatar.cc/150?img=11';

  // 1. From joined profiles table
  if (doctor.profiles?.profile_image) {
    return doctor.profiles.profile_image;
  }

  // 2. From doctors table directly
  if (doctor.profile_image) {
    return doctor.profile_image;
  }

  // 3. Deterministic fallback based on doctor ID
  //    pravatar.cc supports ?img=1 through ?img=70
  const id = doctor.id || 'unknown';
  const avatarIndex = (stableHash(id) % 70) + 1;
  return `https://i.pravatar.cc/150?img=${avatarIndex}`;
}
