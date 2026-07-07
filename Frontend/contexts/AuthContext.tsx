import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  profile_image: string | null;
  role: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, meta?: { firstName?: string; lastName?: string; phone?: string; dateOfBirth?: string; gender?: string; bloodGroup?: string; profileImageUri?: string; heightCm?: number; weightKg?: number; bmi?: number }) => Promise<{ error: any; imageError: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('Session retrieval error:', error.message);
        // If there's an error (e.g. invalid refresh token), we can clear the session
        supabase.auth.signOut();
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    }).catch((e) => {
      console.log('Session error:', e);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, meta?: { firstName?: string; lastName?: string; phone?: string; dateOfBirth?: string; gender?: string; bloodGroup?: string; profileImageUri?: string; heightCm?: number; weightKg?: number; bmi?: number }) => {
    console.log('[Auth] Starting signUp for:', email);
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      console.error('[Auth] SignUp failed:', error.message);
      return { error, imageError: null };
    }

    console.log('[Auth] SignUp successful, user ID:', data.user?.id);
    let imageError: string | null = null;

    if (data.user && meta) {
      let profile_image = null;

      if (meta.profileImageUri) {
        const ext = meta.profileImageUri.split('.').pop() ?? 'jpg';
        const filePath = `${data.user.id}/avatar.${ext}`;
        console.log('[Storage] Uploading profile image to patients/' + filePath);
        try {
          const base64 = await FileSystem.readAsStringAsync(meta.profileImageUri, { encoding: FileSystem.EncodingType.Base64 });
          const arrayBuffer = decode(base64);
          
          const { error: uploadError } = await supabase.storage.from('patients').upload(filePath, arrayBuffer, {
            upsert: true,
            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          });
          
          if (uploadError) {
            const isBucketError = uploadError.message?.toLowerCase().includes('bucket') || uploadError.message?.toLowerCase().includes('not found');
            console.error('[Storage] Upload failed:', uploadError.message);
            imageError = isBucketError
              ? 'Storage bucket "patients" not found. Please run the 00016_create_storage_bucket.sql migration in the Supabase SQL Editor.'
              : `Image upload failed: ${uploadError.message}`;
          } else {
            const { data: urlData } = supabase.storage.from('patients').getPublicUrl(filePath);
            profile_image = `${urlData.publicUrl}?t=${Date.now()}`;
            console.log('[Storage] Upload successful! Public URL:', profile_image);
          }
        } catch (e: any) {
          console.error('[Storage] Image upload exception:', e?.message || e);
          imageError = `Image upload error: ${e?.message || 'Unknown error'}`;
        }
      }

      // Filter out undefined or empty string values to prevent DB constraints from failing
      const updateData: any = {};
      if (meta.firstName) updateData.first_name = meta.firstName;
      if (meta.lastName) updateData.last_name = meta.lastName;
      if (meta.phone) updateData.phone = meta.phone;
      if (meta.dateOfBirth) updateData.date_of_birth = meta.dateOfBirth;
      if (meta.gender) updateData.gender = meta.gender;
      if (meta.bloodGroup) updateData.blood_group = meta.bloodGroup;
      if (meta.heightCm) updateData.height_cm = meta.heightCm;
      if (meta.weightKg) updateData.weight_kg = meta.weightKg;
      if (meta.bmi) updateData.bmi = meta.bmi;
      if (profile_image) updateData.profile_image = profile_image;

      console.log('[Profile] Updating profile with fields:', Object.keys(updateData).join(', '));

      // Update profile with extra fields if any exist
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', data.user.id);
        
        if (updateError) {
          console.error('[Profile] Update failed:', updateError.message);
        } else {
          console.log('[Profile] Update successful!');
        }
      }
    }
    return { error, imageError };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
