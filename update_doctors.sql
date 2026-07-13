-- Step 1: Copy profile_image URLs from doctors to profiles (using user_id = profiles.id)
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_rohan.png' WHERE id = 'd1000000-0000-0000-0000-000000000011';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_hasini.png' WHERE id = 'd1000000-0000-0000-0000-000000000013';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_james.png' WHERE id = '995a2e37-f83e-487e-8b79-acdaa677d870';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_chaminda.png' WHERE id = 'd1000000-0000-0000-0000-000000000012';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_thilina.png' WHERE id = 'd1000000-0000-0000-0000-000000000014';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_ruwan.png' WHERE id = 'd1000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_nimal.png' WHERE id = 'd1000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_sunethra.png' WHERE id = 'd1000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_kamal.png' WHERE id = 'd1000000-0000-0000-0000-000000000004';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_priyanthi.png' WHERE id = 'd1000000-0000-0000-0000-000000000005';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_saman.png' WHERE id = 'd1000000-0000-0000-0000-000000000006';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_aruni.png' WHERE id = 'd1000000-0000-0000-0000-000000000007';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_asanka.png' WHERE id = 'd1000000-0000-0000-0000-000000000008';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_dinesh.png' WHERE id = 'd1000000-0000-0000-0000-000000000010';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_thulana.png' WHERE id = 'df46d341-1bcc-43f7-a3a0-72f68f8383f0';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doctor_tharushi.png' WHERE id = 'd1000000-0000-0000-0000-000000000009';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_sapumal.png' WHERE id = '3d2ae536-cd5c-40b0-939d-54ae8c7eeef8';
UPDATE public.profiles SET profile_image = 'https://wacebhnvymggciqpebsd.supabase.co/storage/v1/object/public/doctors/doc_hashan.png' WHERE id = '7be116d1-a128-4844-935e-d1f97f9d36db';

-- Step 2: Drop the profile_image column from doctors table
ALTER TABLE public.doctors DROP COLUMN IF EXISTS profile_image;
