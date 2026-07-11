-- Migration: 00024_remove_mock_admin
-- Removes the manually seeded admin account because manual SQL password hashing often conflicts with GoTrue.

DO $$
BEGIN
    DELETE FROM auth.users WHERE email = 'admin@mediguide.com';
END $$;
