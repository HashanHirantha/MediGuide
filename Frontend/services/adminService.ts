import { supabase } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminUnverifiedDoctor {
  id: string;
  user_id: string;
  registration_no: string;
  specialty: string;
  qualification: string;
  hospital_name: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AdminAnalytics {
  total_users: number;
  total_doctors: number;
  total_appointments: number;
  total_predictions: number;
}

/**
 * Fetch all users for the admin dashboard
 */
export async function getUsers(): Promise<{ data: AdminUser[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[AdminService] Fetch users error:', error.message);
    return { data: null, error: error.message };
  }

  return { data: data as AdminUser[], error: null };
}

/**
 * Toggle a user's active status (block/unblock)
 */
export async function toggleUserActive(userId: string, isActive: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    console.error('[AdminService] Toggle user active error:', error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Permanently delete a user via RPC (requires admin role)
 */
export async function deleteUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId });

  if (error) {
    console.error('[AdminService] Delete user error:', error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Fetch doctors waiting for verification
 */
export async function getUnverifiedDoctors(): Promise<{ data: AdminUnverifiedDoctor[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      id, user_id, registration_no, specialty, qualification, hospital_name, created_at,
      profiles (first_name, last_name, email)
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[AdminService] Fetch unverified doctors error:', error.message);
    return { data: null, error: error.message };
  }

  return { data: data as any as AdminUnverifiedDoctor[], error: null };
}

/**
 * Verify a doctor
 */
export async function verifyDoctor(doctorId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('doctors')
    .update({ is_verified: true })
    .eq('id', doctorId);

  if (error) {
    console.error('[AdminService] Verify doctor error:', error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Get aggregate analytics for the admin dashboard
 */
export async function getAdminAnalytics(): Promise<{ data: AdminAnalytics | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_admin_analytics');

  if (error) {
    console.error('[AdminService] Get analytics error:', error.message);
    return { data: null, error: error.message };
  }

  return { data: data as AdminAnalytics, error: null };
}
