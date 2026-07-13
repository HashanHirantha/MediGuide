-- Migration: 00031_fix_and_enhance_admin_doctors
-- 1. Updates the create_doctor_by_admin RPC to insert into auth.identities
-- 2. Creates the update_doctor_by_admin RPC

-- Update the existing create function to include auth.identities and fix NULL errors
-- Fix existing broken rows in auth.users (Database error querying schema fix)
UPDATE auth.users
SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, '');

CREATE OR REPLACE FUNCTION public.create_doctor_by_admin(
    p_email TEXT,
    p_password TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_specialty TEXT,
    p_registration_no TEXT,
    p_qualification TEXT,
    p_hospital_name TEXT,
    p_experience_years INT,
    p_consultation_fee INT
)
RETURNS JSONB AS $$
DECLARE
    new_user_id UUID;
    calling_user_role TEXT;
BEGIN
    -- 1. Check if caller is admin
    SELECT role INTO calling_user_role FROM public.profiles WHERE id = auth.uid();
    
    IF calling_user_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can create doctors';
    END IF;

    -- Ensure pgcrypto is enabled
    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

    -- 2. Create the user in auth.users
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user,
        confirmation_token, recovery_token, email_change_token_new, email_change
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', LOWER(p_email), extensions.crypt(p_password, extensions.gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{}', false, false,
        '', '', '', ''
    );

    -- 3. Insert into auth.identities so password login works properly in Supabase GoTrue
    INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    VALUES (
        gen_random_uuid(), new_user_id, new_user_id::text, 
        format('{"sub":"%s","email":"%s"}', new_user_id::text, LOWER(p_email))::jsonb, 
        'email', now(), now(), now()
    );

    -- 4. The trigger 'on_auth_user_created' creates a profile. We just need to update it.
    UPDATE public.profiles
    SET 
        role = 'doctor',
        first_name = p_first_name,
        last_name = p_last_name,
        is_active = true
    WHERE id = new_user_id;

    -- 5. Create the doctor record
    INSERT INTO public.doctors (
        user_id, 
        registration_no, 
        specialty, 
        qualification, 
        experience_years, 
        hospital_name, 
        consultation_fee, 
        is_verified,
        average_rating,
        total_reviews
    )
    VALUES (
        new_user_id,
        p_registration_no,
        p_specialty,
        p_qualification,
        p_experience_years,
        p_hospital_name,
        p_consultation_fee,
        true,
        0,
        0
    );

    RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create doctor: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Create a function for updating an existing doctor by admin
CREATE OR REPLACE FUNCTION public.update_doctor_by_admin(
    p_user_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_specialty TEXT,
    p_registration_no TEXT,
    p_qualification TEXT,
    p_hospital_name TEXT,
    p_experience_years INT,
    p_consultation_fee INT
)
RETURNS JSONB AS $$
DECLARE
    calling_user_role TEXT;
BEGIN
    -- 1. Check if caller is admin
    SELECT role INTO calling_user_role FROM public.profiles WHERE id = auth.uid();
    
    IF calling_user_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can update doctors';
    END IF;

    -- 2. Update profile
    UPDATE public.profiles
    SET 
        first_name = p_first_name,
        last_name = p_last_name
    WHERE id = p_user_id;

    -- 3. Update doctor details
    UPDATE public.doctors
    SET 
        specialty = p_specialty,
        registration_no = p_registration_no,
        qualification = p_qualification,
        hospital_name = p_hospital_name,
        experience_years = p_experience_years,
        consultation_fee = p_consultation_fee
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update doctor: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
