-- Migration: 00030_admin_create_doctor
-- Creates an RPC function for the admin to securely create a doctor account
-- without logging out of the admin session.

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

    -- Ensure pgcrypto is enabled (it usually is)
    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

    -- 2. Create the user in auth.users
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
    )
    VALUES (
        new_user_id, 'authenticated', 'authenticated', p_email, extensions.crypt(p_password, extensions.gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{}', false, false
    );

    -- 3. The trigger 'on_auth_user_created' creates a profile. We just need to update it.
    UPDATE public.profiles
    SET 
        role = 'doctor',
        first_name = p_first_name,
        last_name = p_last_name,
        is_active = true
    WHERE id = new_user_id;

    -- 4. Create the doctor record
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
        true, -- Verified by default since admin creates them
        0,
        0
    );

    RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create doctor: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
