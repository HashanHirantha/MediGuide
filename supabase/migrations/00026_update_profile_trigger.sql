-- Migration: 00026_update_profile_trigger
-- Updates the handle_new_user trigger to populate profile details directly from raw_user_meta_data during signup.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    first_name, 
    last_name, 
    phone, 
    date_of_birth, 
    gender, 
    blood_group, 
    height_cm, 
    weight_kg, 
    bmi
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    'patient',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::DATE,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'blood_group',
    NULLIF(NEW.raw_user_meta_data->>'height_cm', '')::NUMERIC,
    NULLIF(NEW.raw_user_meta_data->>'weight_kg', '')::NUMERIC,
    NULLIF(NEW.raw_user_meta_data->>'bmi', '')::NUMERIC
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
