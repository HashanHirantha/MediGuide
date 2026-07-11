-- Migration: 00025_promote_admin
-- Elevate the newly registered admin@mediguide.com account to the admin role.

DO $$
BEGIN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = 'admin@mediguide.com';
END $$;
