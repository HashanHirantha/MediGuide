-- Migration: 00022_seed_mock_admin
-- Creates a mock admin account for testing the admin dashboard and login flow.
-- Email: admin@mediguide.com
-- Password: admin123

DO $$
DECLARE
    admin_uuid UUID;
BEGIN
    -- Note: Ensure pgcrypto extension is enabled. It is enabled by default in Supabase.
    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

    -- Check if admin already exists
    SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@mediguide.com';

    IF admin_uuid IS NULL THEN
        admin_uuid := gen_random_uuid();

        -- 1. Insert into auth.users
        INSERT INTO auth.users (
            id, aud, role, email, encrypted_password, 
            email_confirmed_at, created_at, updated_at,
            raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
        )
        VALUES (
            admin_uuid, 'authenticated', 'authenticated', 'admin@mediguide.com', extensions.crypt('admin123', extensions.gen_salt('bf')),
            now(), now(), now(),
            '{"provider":"email","providers":["email"]}', '{}', false, false
        );

        -- 2. Update the auto-created profile role to 'admin' and set names
        UPDATE public.profiles
        SET role = 'admin', first_name = 'System', last_name = 'Admin'
        WHERE id = admin_uuid;
    END IF;
END $$;
