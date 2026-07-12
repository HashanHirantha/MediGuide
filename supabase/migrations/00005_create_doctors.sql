-- Migration: 00005_create_doctors

CREATE TABLE IF NOT EXISTS public.doctors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gender            VARCHAR(20),
  registration_no   VARCHAR(100) UNIQUE NOT NULL,
  specialty         VARCHAR(100) NOT NULL,
  qualification     VARCHAR(300) NOT NULL,
  experience_years  INTEGER NOT NULL DEFAULT 0,
  hospital_name     VARCHAR(300),
  hospital_address  TEXT,
  latitude          NUMERIC(10, 8),
  longitude         NUMERIC(11, 8),
  consultation_fee  NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  available_days    VARCHAR(100),
  available_from    TIME,
  available_to      TIME,
  average_rating    NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  total_reviews     INTEGER NOT NULL DEFAULT 0,
  is_verified       BOOLEAN NOT NULL DEFAULT false,
  bio               TEXT,
  profile_image     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_is_verified ON public.doctors(is_verified);

CREATE TRIGGER set_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
