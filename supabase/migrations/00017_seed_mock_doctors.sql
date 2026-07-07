-- Migration: 00017_seed_mock_doctors
-- Creates a mock doctor account for testing the doctor dashboard and login flow.
-- Email: dr.smith@mediguide.com
-- Password: password123

DO $$
DECLARE
    doctor_uuid UUID := gen_random_uuid();
BEGIN
    -- 1. Insert into auth.users
    -- Note: Ensure pgcrypto extension is enabled. It is enabled by default in Supabase.
    INSERT INTO auth.users (
        id, aud, role, email, encrypted_password, 
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
    )
    VALUES (
        doctor_uuid, 'authenticated', 'authenticated', 'dr.smith@mediguide.com', crypt('password123', gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{}', false, false
    );

    -- 2. Update the auto-created profile role to 'doctor' and set names
    UPDATE public.profiles
    SET role = 'doctor', first_name = 'James', last_name = 'Smith'
    WHERE id = doctor_uuid;

    -- 3. Insert into public.doctors to populate professional details
    INSERT INTO public.doctors (
        user_id, registration_no, specialty, qualification, experience_years, 
        hospital_name, consultation_fee, available_days
    )
    VALUES (
        doctor_uuid, 'REG-DOC-001', 'Cardiologist', 'MD, FACC', 15,
        'MediGuide Central Hospital', 150.00, 'Mon,Wed,Fri'
    );
END $$;
