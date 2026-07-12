-- Migration: 00028_add_doctor_locations

-- 1. Update existing mock doctors with coordinates
UPDATE public.doctors SET latitude = 6.8845, longitude = 79.8732 WHERE registration_no = 'SLMC-10001'; -- Asiri Medical
UPDATE public.doctors SET latitude = 6.8858, longitude = 79.8727 WHERE registration_no = 'SLMC-10002'; -- Lanka Hospitals
UPDATE public.doctors SET latitude = 6.9186, longitude = 79.8519 WHERE registration_no = 'SLMC-10003'; -- Nawaloka Hospital
UPDATE public.doctors SET latitude = 6.9038, longitude = 79.8540 WHERE registration_no = 'SLMC-10004'; -- Durdans Hospital
UPDATE public.doctors SET latitude = 6.8870, longitude = 79.8750 WHERE registration_no = 'SLMC-10005'; -- Asiri Surgical
UPDATE public.doctors SET latitude = 6.8858, longitude = 79.8727 WHERE registration_no = 'SLMC-10006'; -- Lanka Hospitals
UPDATE public.doctors SET latitude = 6.9186, longitude = 79.8519 WHERE registration_no = 'SLMC-10007'; -- Nawaloka Hospital

-- Move the last 3 doctors to Galle
UPDATE public.doctors 
SET hospital_name = 'Karapitiya Teaching Hospital', hospital_address = 'Galle', latitude = 6.0694, longitude = 80.2255 
WHERE registration_no = 'SLMC-10008'; 

UPDATE public.doctors 
SET hospital_name = 'Hemas Hospital', hospital_address = 'Galle', latitude = 6.0535, longitude = 80.2210 
WHERE registration_no = 'SLMC-10009'; 

UPDATE public.doctors 
SET hospital_name = 'Ruhunu Hospital', hospital_address = 'Galle', latitude = 6.0683, longitude = 80.2119 
WHERE registration_no = 'SLMC-10010'; 

-- 2. Create RPC function for finding doctors within radius
-- This function uses the Haversine formula to calculate the distance between the user and the doctor.
CREATE OR REPLACE FUNCTION get_doctors_within_radius(
  user_lat NUMERIC,
  user_lon NUMERIC,
  radius_km NUMERIC,
  specialty_filters TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  gender VARCHAR,
  registration_no VARCHAR,
  specialty VARCHAR,
  qualification VARCHAR,
  experience_years INTEGER,
  hospital_name VARCHAR,
  hospital_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  consultation_fee NUMERIC,
  available_days VARCHAR,
  available_from TIME,
  available_to TIME,
  average_rating NUMERIC,
  total_reviews INTEGER,
  is_verified BOOLEAN,
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_km NUMERIC,
  first_name TEXT,
  last_name TEXT,
  prof_image TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.*,
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(d.latitude)) *
        cos(radians(d.longitude) - radians(user_lon)) +
        sin(radians(user_lat)) * sin(radians(d.latitude))
      )
    )::NUMERIC AS distance_km,
    p.first_name,
    p.last_name,
    p.profile_image AS prof_image
  FROM
    public.doctors d
  JOIN
    public.profiles p ON d.user_id = p.id
  WHERE
    d.latitude IS NOT NULL AND d.longitude IS NOT NULL
    AND d.is_verified = true
    AND (specialty_filters IS NULL OR d.specialty = ANY(specialty_filters))
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(d.latitude)) *
        cos(radians(d.longitude) - radians(user_lon)) +
        sin(radians(user_lat)) * sin(radians(d.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;
