-- Migration: 00018_fix_specialties_seed_reviews
-- Standardizes specialties to job titles (e.g. 'Neurologist' instead of 'Neurology')
-- Seeds additional mock doctors and reviews.

-- ==========================================
-- 1. Standardize Specialties to Job Titles
-- ==========================================

-- Update diseases table
UPDATE public.diseases SET specialty = 'General Practitioner' WHERE specialty IN ('General Medicine');
UPDATE public.diseases SET specialty = 'Cardiologist' WHERE specialty IN ('Cardiology');
UPDATE public.diseases SET specialty = 'Neurologist' WHERE specialty IN ('Neurology');
UPDATE public.diseases SET specialty = 'Pulmonologist' WHERE specialty IN ('Pulmonology');
UPDATE public.diseases SET specialty = 'Endocrinologist' WHERE specialty IN ('Endocrinology');
UPDATE public.diseases SET specialty = 'Gastroenterologist' WHERE specialty IN ('Gastroenterology');
UPDATE public.diseases SET specialty = 'ENT Specialist' WHERE specialty IN ('ENT');
UPDATE public.diseases SET specialty = 'Dermatologist' WHERE specialty IN ('Dermatology');
UPDATE public.diseases SET specialty = 'Orthopedic Surgeon' WHERE specialty IN ('Orthopedics');
UPDATE public.diseases SET specialty = 'Ophthalmologist' WHERE specialty IN ('Ophthalmology');

-- Update doctor_specialties table
UPDATE public.doctor_specialties SET specialty = 'General Practitioner' WHERE specialty IN ('General Medicine');
UPDATE public.doctor_specialties SET specialty = 'Cardiologist' WHERE specialty IN ('Cardiology');
UPDATE public.doctor_specialties SET specialty = 'Neurologist' WHERE specialty IN ('Neurology');
UPDATE public.doctor_specialties SET specialty = 'Pulmonologist' WHERE specialty IN ('Pulmonology');
UPDATE public.doctor_specialties SET specialty = 'Endocrinologist' WHERE specialty IN ('Endocrinology');
UPDATE public.doctor_specialties SET specialty = 'Gastroenterologist' WHERE specialty IN ('Gastroenterology');
UPDATE public.doctor_specialties SET specialty = 'ENT Specialist' WHERE specialty IN ('ENT');
UPDATE public.doctor_specialties SET specialty = 'Dermatologist' WHERE specialty IN ('Dermatology');
UPDATE public.doctor_specialties SET specialty = 'Orthopedic Surgeon' WHERE specialty IN ('Orthopedics');
UPDATE public.doctor_specialties SET specialty = 'Ophthalmologist' WHERE specialty IN ('Ophthalmology');

-- Update existing doctors
UPDATE public.doctors SET specialty = 'General Practitioner' WHERE specialty IN ('General Medicine');
UPDATE public.doctors SET specialty = 'Cardiologist' WHERE specialty IN ('Cardiology');
UPDATE public.doctors SET specialty = 'Neurologist' WHERE specialty IN ('Neurology');
UPDATE public.doctors SET specialty = 'Pulmonologist' WHERE specialty IN ('Pulmonology');
UPDATE public.doctors SET specialty = 'Endocrinologist' WHERE specialty IN ('Endocrinology');
UPDATE public.doctors SET specialty = 'Gastroenterologist' WHERE specialty IN ('Gastroenterology');
UPDATE public.doctors SET specialty = 'ENT Specialist' WHERE specialty IN ('ENT');
UPDATE public.doctors SET specialty = 'Dermatologist' WHERE specialty IN ('Dermatology');
UPDATE public.doctors SET specialty = 'Orthopedic Surgeon' WHERE specialty IN ('Orthopedics');
UPDATE public.doctors SET specialty = 'Ophthalmologist' WHERE specialty IN ('Ophthalmology');

-- ==========================================
-- 2. Seed Mock Doctors
-- ==========================================
/*
MOCK DOCTOR CREDENTIALS:
1. email: dr.nimal@mediguide.com, password: password123 (General Practitioner)
2. email: dr.sunethra@mediguide.com, password: password123 (Neurologist)
3. email: dr.ruwan@mediguide.com, password: password123 (Cardiologist)
4. email: dr.kamal@mediguide.com, password: password123 (Pulmonologist)
5. email: dr.priyanthi@mediguide.com, password: password123 (Endocrinologist)
6. email: dr.saman@mediguide.com, password: password123 (Gastroenterologist)
7. email: dr.aruni@mediguide.com, password: password123 (Dermatologist)
8. email: dr.bandara@mediguide.com, password: password123 (Orthopedic Surgeon)
9. email: dr.tharushi@mediguide.com, password: password123 (Ophthalmologist)
10. email: dr.dinesh@mediguide.com, password: password123 (ENT Specialist)
*/

DO $$
DECLARE
    -- Mock Doctors
    d1_id UUID := 'd1000000-0000-0000-0000-000000000001';
    d2_id UUID := 'd1000000-0000-0000-0000-000000000002';
    d3_id UUID := 'd1000000-0000-0000-0000-000000000003';
    d4_id UUID := 'd1000000-0000-0000-0000-000000000004';
    d5_id UUID := 'd1000000-0000-0000-0000-000000000005';
    d6_id UUID := 'd1000000-0000-0000-0000-000000000006';
    d7_id UUID := 'd1000000-0000-0000-0000-000000000007';
    d8_id UUID := 'd1000000-0000-0000-0000-000000000008';
    d9_id UUID := 'd1000000-0000-0000-0000-000000000009';
    d10_id UUID := 'd1000000-0000-0000-0000-000000000010';

    -- Mock Patients (for reviews)
    p1_id UUID := 'b1000000-0000-0000-0000-000000000001';
    p2_id UUID := 'b1000000-0000-0000-0000-000000000002';
    p3_id UUID := 'b1000000-0000-0000-0000-000000000003';

    doc1_db_id UUID;
    doc2_db_id UUID;
    doc3_db_id UUID;
    doc4_db_id UUID;
    doc5_db_id UUID;
    doc6_db_id UUID;
    doc7_db_id UUID;
    doc8_db_id UUID;
    doc9_db_id UUID;
    doc10_db_id UUID;

BEGIN
    -- Ensure pgcrypto is enabled
    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

    -- Insert Doctor Auth Users
    INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user)
    VALUES
        (d1_id, 'authenticated', 'authenticated', 'dr.nimal@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d2_id, 'authenticated', 'authenticated', 'dr.sunethra@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d3_id, 'authenticated', 'authenticated', 'dr.ruwan@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d4_id, 'authenticated', 'authenticated', 'dr.kamal@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d5_id, 'authenticated', 'authenticated', 'dr.priyanthi@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d6_id, 'authenticated', 'authenticated', 'dr.saman@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d7_id, 'authenticated', 'authenticated', 'dr.aruni@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d8_id, 'authenticated', 'authenticated', 'dr.bandara@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d9_id, 'authenticated', 'authenticated', 'dr.tharushi@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (d10_id, 'authenticated', 'authenticated', 'dr.dinesh@mediguide.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Patient Auth Users
    INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user)
    VALUES
        (p1_id, 'authenticated', 'authenticated', 'patient1@example.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (p2_id, 'authenticated', 'authenticated', 'patient2@example.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
        (p3_id, 'authenticated', 'authenticated', 'patient3@example.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false)
    ON CONFLICT (id) DO NOTHING;

    -- Update Profiles for Doctors
    UPDATE public.profiles SET role = 'doctor', first_name = 'Nimal', last_name = 'Perera', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_nimal.png', is_active = true WHERE id = d1_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Sunethra', last_name = 'Silva', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_sunethra.png', is_active = true WHERE id = d2_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Ruwan', last_name = 'Fernando', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_ruwan.png', is_active = true WHERE id = d3_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Kamal', last_name = 'Gunawardena', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_kamal.png', is_active = true WHERE id = d4_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Priyanthi', last_name = 'Dias', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_priyanthi.png', is_active = true WHERE id = d5_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Saman', last_name = 'Kumara', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_saman.png', is_active = true WHERE id = d6_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Aruni', last_name = 'Jayakody', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_aruni.png', is_active = true WHERE id = d7_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Asanka', last_name = 'Bandara', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_asanka.png', is_active = true WHERE id = d8_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Tharushi', last_name = 'Rathnayake', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_tharushi.png', is_active = true WHERE id = d9_id;
    UPDATE public.profiles SET role = 'doctor', first_name = 'Dinesh', last_name = 'Weerasinghe', profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/patients/d1000000-0000-0000-0000-000000000001/doctor_dinesh.png', is_active = true WHERE id = d10_id;

    -- Update Profiles for Patients
    UPDATE public.profiles SET first_name = 'Sanjeewa', last_name = 'Jayawardena', role = 'patient' WHERE id = p1_id;
    UPDATE public.profiles SET first_name = 'Niroshi', last_name = 'Perera', role = 'patient' WHERE id = p2_id;
    UPDATE public.profiles SET first_name = 'Kasun', last_name = 'Madushanka', role = 'patient' WHERE id = p3_id;

    -- Insert Doctors
    INSERT INTO public.doctors (user_id, registration_no, specialty, qualification, experience_years, hospital_name, hospital_address, consultation_fee, available_days, available_from, available_to, is_verified, bio)
    VALUES
        (d1_id, 'SLMC-10001', 'General Practitioner', 'MBBS, MD', 12, 'Asiri Medical Hospital', 'Colombo 05', 2000.00, 'Mon,Wed,Fri', '08:00', '12:00', true, 'Experienced general practitioner providing primary care.'),
        (d2_id, 'SLMC-10002', 'Neurologist', 'MBBS, MD, MRCP', 18, 'Lanka Hospitals', 'Colombo 05', 4500.00, 'Tue,Thu,Sat', '16:00', '20:00', true, 'Specialist in complex neurological disorders.'),
        (d3_id, 'SLMC-10003', 'Cardiologist', 'MBBS, MD Cardiology', 15, 'Nawaloka Hospital', 'Colombo 02', 4000.00, 'Mon,Tue,Thu', '10:00', '14:00', true, 'Expert in heart diseases and preventive cardiology.'),
        (d4_id, 'SLMC-10004', 'Pulmonologist', 'MBBS, MD Chest', 10, 'Durdans Hospital', 'Colombo 03', 3500.00, 'Mon,Wed,Fri', '09:00', '13:00', true, 'Specializes in respiratory and lung conditions.'),
        (d5_id, 'SLMC-10005', 'Endocrinologist', 'MBBS, MD, FACE', 14, 'Asiri Surgical', 'Colombo 05', 3800.00, 'Tue,Thu,Sat', '14:00', '18:00', true, 'Expert in diabetes and thyroid management.'),
        (d6_id, 'SLMC-10006', 'Gastroenterologist', 'MBBS, MD', 11, 'Lanka Hospitals', 'Colombo 05', 3600.00, 'Mon,Tue,Wed', '16:00', '19:00', true, 'Specialist in digestive system disorders.'),
        (d7_id, 'SLMC-10007', 'Dermatologist', 'MBBS, MD Dermatology', 9, 'Nawaloka Hospital', 'Colombo 02', 3000.00, 'Wed,Fri,Sun', '09:00', '12:00', true, 'Providing advanced skin care treatments.'),
        (d8_id, 'SLMC-10008', 'Orthopedic Surgeon', 'MBBS, MS Ortho', 20, 'Durdans Hospital', 'Colombo 03', 5000.00, 'Mon,Thu', '15:00', '19:00', true, 'Expert in joint replacements and sports injuries.'),
        (d9_id, 'SLMC-10009', 'Ophthalmologist', 'MBBS, MD Vision', 13, 'Asiri Medical', 'Colombo 05', 3200.00, 'Tue,Sat', '10:00', '13:00', true, 'Specialist in eye care and vision correction.'),
        (d10_id, 'SLMC-10010', 'ENT Specialist', 'MBBS, MS ENT', 16, 'Lanka Hospitals', 'Colombo 05', 3400.00, 'Wed,Thu,Fri', '17:00', '20:00', true, 'Specializes in ear, nose, and throat conditions.')
    ON CONFLICT (user_id) DO NOTHING;

    -- Get doctor internal UUIDs for reviews
    SELECT id INTO doc1_db_id FROM public.doctors WHERE user_id = d1_id;
    SELECT id INTO doc2_db_id FROM public.doctors WHERE user_id = d2_id;
    SELECT id INTO doc3_db_id FROM public.doctors WHERE user_id = d3_id;
    SELECT id INTO doc4_db_id FROM public.doctors WHERE user_id = d4_id;
    SELECT id INTO doc5_db_id FROM public.doctors WHERE user_id = d5_id;
    SELECT id INTO doc6_db_id FROM public.doctors WHERE user_id = d6_id;
    SELECT id INTO doc7_db_id FROM public.doctors WHERE user_id = d7_id;
    SELECT id INTO doc8_db_id FROM public.doctors WHERE user_id = d8_id;
    SELECT id INTO doc9_db_id FROM public.doctors WHERE user_id = d9_id;
    SELECT id INTO doc10_db_id FROM public.doctors WHERE user_id = d10_id;

    -- ==========================================
    -- 3. Seed Mock Reviews
    -- ==========================================

    -- We use a simple loop or just direct inserts.
    -- Ensure we have the doctor IDs before inserting.
    IF doc1_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p1_id, doc1_db_id, 5, 'Dr. Nimal is very attentive and kind. Highly recommend!'),
            (p2_id, doc1_db_id, 4, 'Good experience, but had to wait a bit.'),
            (p3_id, doc1_db_id, 5, 'Very knowledgeable and took time to explain.');
    END IF;

    IF doc2_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p1_id, doc2_db_id, 5, 'Excellent neurologist. Helped me with my migraines.'),
            (p2_id, doc2_db_id, 5, 'Highly professional and thorough.');
    END IF;

    IF doc3_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p2_id, doc3_db_id, 4, 'Good consultation, very detailed.'),
            (p3_id, doc3_db_id, 5, 'Dr. Ruwan saved my father. God bless him.');
    END IF;

    IF doc4_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p1_id, doc4_db_id, 5, 'My asthma is finally under control.'),
            (p3_id, doc4_db_id, 4, 'Very good doctor.');
    END IF;

    IF doc5_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p1_id, doc5_db_id, 5, 'Helped me manage my diabetes effectively.'),
            (p2_id, doc5_db_id, 5, 'Very patient and understanding.');
    END IF;

    IF doc6_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p3_id, doc6_db_id, 4, 'Good advice, feeling much better now.');
    END IF;

    IF doc7_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p1_id, doc7_db_id, 5, 'Cleared up my skin issue in just two weeks!'),
            (p2_id, doc7_db_id, 5, 'Very friendly and effective treatments.');
    END IF;

    IF doc8_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p2_id, doc8_db_id, 5, 'Great surgeon, knee replacement went perfectly.'),
            (p3_id, doc8_db_id, 4, 'Clear explanations about the surgery.');
    END IF;

    IF doc9_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p1_id, doc9_db_id, 5, 'Perfect vision checkup.'),
            (p3_id, doc9_db_id, 5, 'Very gentle and thorough eye exam.');
    END IF;

    IF doc10_db_id IS NOT NULL THEN
        INSERT INTO public.reviews (patient_id, doctor_id, rating, comment) VALUES
            (p1_id, doc10_db_id, 4, 'Helped clear my sinus infection.'),
            (p2_id, doc10_db_id, 5, 'Great ENT doctor.');
    END IF;

END $$;
