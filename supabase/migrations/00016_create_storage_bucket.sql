-- Migration: 00016_create_storage_bucket
-- Creates the 'patients' storage bucket for profile image uploads
-- and adds RLS policies for secure access.
--
-- ⚠️ Run this manually in the Supabase SQL Editor.

-- 1. Create the 'patients' bucket (public, so profile images are accessible)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patients',
  'patients',
  true,
  5242880,  -- 5 MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS policies on storage.objects for the 'patients' bucket

-- Allow anyone to READ files from the patients bucket (public profile images)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'patients_public_read' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "patients_public_read" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'patients');
  END IF;
END $$;

-- Allow authenticated users to UPLOAD files into their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'patients_auth_insert' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "patients_auth_insert" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'patients'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow authenticated users to UPDATE their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'patients_auth_update' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "patients_auth_update" ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'patients'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow authenticated users to DELETE their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'patients_auth_delete' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "patients_auth_delete" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'patients'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
