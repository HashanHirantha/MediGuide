import { useState } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

interface Doctor {
  id: string;
  specialty: string;
  experience_years: number;
  hospital_name: string | null;
  consultation_fee: number;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  available_days: string | null;
  bio: string | null;
  distance_km?: number;
  profiles?: {
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
}

/**
 * Hook for fetching doctors from Supabase.
 */
export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async (specialty?: string) => {
    setLoading(true);
    try {
      // 1. Try to get user location
      let userLocation = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        userLocation = location.coords;
      }

      // 2. Fetch doctors based on location or default
      if (userLocation) {
        // Use RPC to get doctors within 20km
        const { data, error: rpcError } = await supabase.rpc('get_doctors_within_radius', {
          user_lat: userLocation.latitude,
          user_lon: userLocation.longitude,
          radius_km: 20,
          specialty_filters: specialty ? [specialty] : null
        });

        if (rpcError) throw rpcError;
        
        // Map RPC result to match the standard Doctor interface shape expected by the UI
        const mappedData = (data || []).map((d: any) => ({
          ...d,
          profiles: {
            first_name: d.first_name,
            last_name: d.last_name,
            profile_image: d.prof_image
          }
        }));
        setDoctors(mappedData);
      } else {
        // Fallback: No location permission, fetch normally
        let query = supabase
          .from('doctors')
          .select('*, profiles(first_name, last_name, profile_image)')
          .eq('is_verified', true)
          .order('average_rating', { ascending: false });

        if (specialty) {
          query = query.ilike('specialty', specialty);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setDoctors(data ?? []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorById = async (id: string) => {
    const { data, error: fetchError } = await supabase
      .from('doctors')
      .select('*, profiles(first_name, last_name, profile_image, email, phone)')
      .eq('id', id)
      .single();
    if (fetchError) return { data: null, error: fetchError.message };
    return { data, error: null };
  };

  return { doctors, loading, error, fetchDoctors, fetchDoctorById };
}
