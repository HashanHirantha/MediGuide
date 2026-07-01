-- Migration: 00012_add_profile_fields
-- Add missing height_cm, weight_kg, and bmi columns to the profiles table

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS bmi NUMERIC(5,2);

-- Fix any potential infinite recursion in policies by replacing the potentially problematic SELECT policy
DROP POLICY IF EXISTS "profiles_select_public_for_doctors" ON public.profiles;

CREATE POLICY "profiles_select_public_for_doctors" ON public.profiles
  FOR SELECT USING (
    role IN ('doctor', 'admin') OR auth.uid() = id
  );
