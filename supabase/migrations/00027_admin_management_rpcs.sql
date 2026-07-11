-- Migration: 00027_admin_management_rpcs
-- Creates RPCs for admin operations that require bypassing RLS or complex aggregations.

-- 1. Secure function to allow admins to delete users from auth.users
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  calling_user_role TEXT;
BEGIN
  -- Verify the calling user is an admin
  SELECT role INTO calling_user_role FROM public.profiles WHERE id = auth.uid();
  
  IF calling_user_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- Delete the user from auth.users. 
  -- Due to ON DELETE CASCADE on profiles, doctors, etc., this will wipe all their data.
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Analytics Aggregation Function
-- Returns a JSON object with total counts for the admin dashboard.
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS JSONB AS $$
DECLARE
  total_users INT;
  total_doctors INT;
  total_appointments INT;
  total_predictions INT;
BEGIN
  -- Verify calling user is an admin
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO total_doctors FROM public.doctors;
  SELECT COUNT(*) INTO total_appointments FROM public.appointments;
  SELECT COUNT(*) INTO total_predictions FROM public.ai_check_history;

  RETURN jsonb_build_object(
    'total_users', total_users,
    'total_doctors', total_doctors,
    'total_appointments', total_appointments,
    'total_predictions', total_predictions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
