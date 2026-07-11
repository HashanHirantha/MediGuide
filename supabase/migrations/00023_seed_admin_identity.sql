-- Migration: 00023_seed_admin_identity
-- Adds the missing auth.identities row for the mock admin user so they can log in via GoTrue.

DO $$
DECLARE
    admin_uuid UUID;
    identity_exists BOOLEAN;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@mediguide.com';

    IF admin_uuid IS NOT NULL THEN
        -- Check if identity already exists
        SELECT EXISTS (
            SELECT 1 FROM auth.identities WHERE user_id = admin_uuid AND provider = 'email'
        ) INTO identity_exists;

        IF NOT identity_exists THEN
            -- Insert the email identity
            INSERT INTO auth.identities (
                id, user_id, provider_id, identity_data, provider, created_at, updated_at
            )
            VALUES (
                gen_random_uuid(), 
                admin_uuid, 
                admin_uuid::text, 
                jsonb_build_object('sub', admin_uuid, 'email', 'admin@mediguide.com'), 
                'email', 
                now(), 
                now()
            );
        END IF;
    END IF;
END $$;
