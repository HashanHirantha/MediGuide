(# 🗄️ MediGuide — Database Schema (Supabase)

## Overview

The application uses **Supabase** as its Backend-as-a-Service platform. Supabase provides a managed **PostgreSQL** database with built-in **Row Level Security (RLS)**, **Auth**, **Realtime**, and **Storage**. Below is the complete schema for all tables, their columns, relationships, RLS policies, and constraints.

> **Key Difference from Custom Backend**: Instead of Sequelize ORM models with Express.js middleware for auth, we use Supabase's PostgreSQL directly with RLS policies. The `auth.users` table is managed by Supabase Auth — we extend it with a `profiles` table via a trigger.

---

## Entity Relationship Diagram

```
┌──────────────────┐
│  auth.users      │  (Managed by Supabase Auth)
│  (id, email, ...) │
└────────┬─────────┘
         │ 1:1 (trigger creates profile on signup)
         ▼
┌──────────────┐       ┌──────────────┐       ┌──────────┐
│  profiles    │──1:N──│ appointments │──N:1──│ doctors  │
└────┬─────────┘       └──────┬───────┘       └────┬─────┘
     │                        │                    │
     │1:N                     │                    │1:N
     ▼                        │                    ▼
┌────────────────┐            │           ┌────────────────┐
│ medical_history│            │           │    reviews     │
└────────────────┘            │           └────────────────┘
                              │                    ▲
     ┌────────────┐           │                    │N:1
     │ symptoms   │──M:N──────┤           ┌────────┴───────┐
     └────────────┘           │           │   profiles     │
           │                  │           └────────────────┘
           │M:N               │
           ▼                  │
   ┌───────────────┐          │
   │disease_symptoms│         │
   │  (Junction)   │          │
   └───────┬───────┘          │
           │M:N               │
           ▼                  │
     ┌──────────┐             │
     │ diseases │             │
     └────┬─────┘             │
          │                   │
          │1:N                │
          ▼                   │
  ┌───────────────┐           │
  │doctor_specialties│        │
  │  (Junction)   │           │
  └───────┬───────┘           │
          │N:1                │
          ▼                   │
     ┌──────────┐             │
     │ doctors  │─────────────┘
     └──────────┘
  
  ┌──────────────────┐
  │ diagnosis_history│──N:1── profiles
  │                  │──N:1── diseases
  └──────────────────┘

  ┌──────────────────┐
  │ ai_check_history │──N:1── profiles
  └──────────────────┘
```

---

## Tables

### 1. `auth.users` (Managed by Supabase)

This table is **automatically managed** by Supabase Auth. **Do NOT modify it directly**. We extend it via the `profiles` table.

| Column   | Type   | Description             |
| :------- | :----- | :---------------------- |
| `id`     | `UUID` | Unique user identifier  |
| `email`  | `TEXT` | User email address      |
| `...`    | `...`  | Other Supabase-managed fields (encrypted_password, created_at, etc.) |

---

### 2. `profiles`

Extends `auth.users` with app-specific user data. **Created automatically** via a database trigger on `auth.users` INSERT.

| Column          | Type          | Constraints                               | Description                      |
| :-------------- | :------------ | :---------------------------------------- | :------------------------------- |
| `id`            | `UUID`        | PK, FK → auth.users.id ON DELETE CASCADE | Matches auth user ID             |
| `email`         | `TEXT`        | NOT NULL                                  | Copied from auth.users on create |
| `first_name`    | `VARCHAR(100)`| NULLABLE                                  | User first name                  |
| `last_name`     | `VARCHAR(100)`| NULLABLE                                  | User last name                   |
| `phone`         | `VARCHAR(20)` | NULLABLE                                  | Phone number                     |
| `date_of_birth` | `DATE`        | NULLABLE                                  | Date of birth                    |
| `gender`        | `TEXT`        | CHECK IN ('male','female','other'), NULLABLE | Gender                        |
| `blood_group`   | `VARCHAR(5)`  | NULLABLE                                  | Blood group (A+, B-, O+, etc.)   |
| `height_cm`     | `NUMERIC(5,2)`| NULLABLE                                  | Height in centimeters            |
| `weight_kg`     | `NUMERIC(5,2)`| NULLABLE                                  | Weight in kilograms              |
| `bmi`           | `NUMERIC(5,2)`| NULLABLE                                  | Body Mass Index                  |
| `profile_image` | `TEXT`        | NULLABLE                                  | Supabase Storage path/URL        |
| `role`          | `TEXT`        | CHECK IN ('patient','doctor','admin'), DEFAULT 'patient' | User role     |
| `is_active`     | `BOOLEAN`     | DEFAULT true                              | Account active status            |
| `created_at`    | `TIMESTAMPTZ` | DEFAULT NOW()                             | Account creation timestamp       |
| `updated_at`    | `TIMESTAMPTZ` | DEFAULT NOW()                             | Last update timestamp            |

**Indexes**: `email` (unique via auth.users)

**Trigger**: `on_auth_user_created` — automatically creates a `profiles` row when a user signs up.

> **Note**: All triggers use `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER` to prevent "already exists" errors on re-runs.

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'patient')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**RLS Policies**:
| Policy Name                          | Operation    | Rule                                                      |
| :----------------------------------- | :----------- | :-------------------------------------------------------- |
| `profiles_select_own`                | SELECT       | `auth.uid() = id`                                         |
| `profiles_update_own`                | UPDATE       | `auth.uid() = id`                                         |
| `profiles_insert_own`                | INSERT       | `auth.uid() = id`                                         |
| `profiles_select_public_for_doctors` | SELECT       | `role IN ('doctor', 'admin') OR auth.uid() = id`          |

---

### 3. `symptoms`

Master list of all recognized symptoms.

| Column          | Type           | Constraints                                          | Description                    |
| :-------------- | :------------- | :--------------------------------------------------- | :----------------------------- |
| `id`            | `SERIAL`       | PK                                                   | Symptom ID                     |
| `name`          | `VARCHAR(200)` | UNIQUE, NOT NULL                                     | Symptom name (e.g., "Headache")|
| `description`   | `TEXT`         | NULLABLE                                             | Detailed description           |
| `body_part`     | `VARCHAR(100)` | NOT NULL                                             | Body area (head, chest, etc.)  |
| `severity_level`| `TEXT`         | CHECK IN ('mild','moderate','severe'), DEFAULT 'moderate' | Default severity          |
| `icon`          | `VARCHAR(50)`  | NULLABLE                                             | Icon identifier for UI         |
| `is_emergency`  | `BOOLEAN`      | DEFAULT false                                        | Emergency symptom flag         |
| `created_at`    | `TIMESTAMPTZ`  | DEFAULT NOW()                                        | Record creation timestamp      |
| `updated_at`    | `TIMESTAMPTZ`  | DEFAULT NOW()                                        | Last update timestamp          |

**Indexes**: `name` (unique), `body_part`

**RLS Policies**:
| Policy Name           | Operation | Rule                                |
| :-------------------- | :-------- | :---------------------------------- |
| `symptoms_select_all` | SELECT    | `true` (public read for all authenticated users) |

---

### 4. `diseases`

Master list of diseases/conditions the system can predict.

| Column              | Type           | Constraints                                              | Description                    |
| :------------------ | :------------- | :------------------------------------------------------- | :----------------------------- |
| `id`                | `SERIAL`       | PK                                                       | Disease ID                     |
| `name`              | `VARCHAR(200)` | UNIQUE, NOT NULL                                         | Disease name                   |
| `description`       | `TEXT`         | NOT NULL                                                 | Detailed description           |
| `specialty`         | `VARCHAR(100)` | NOT NULL                                                 | Related medical specialty      |
| `severity`          | `TEXT`         | CHECK IN ('low','medium','high','critical'), DEFAULT 'medium' | Severity level            |
| `precautions`       | `TEXT[]`       | NULLABLE                                                 | Array of precautionary measures|
| `symptoms_required` | `INTEGER`      | DEFAULT 2                                                | Min symptoms to consider       |
| `is_chronic`        | `BOOLEAN`      | DEFAULT false                                            | Whether condition is chronic   |
| `image_url`         | `TEXT`         | NULLABLE                                                 | Disease illustration URL       |
| `created_at`        | `TIMESTAMPTZ`  | DEFAULT NOW()                                            | Record creation timestamp      |
| `updated_at`        | `TIMESTAMPTZ`  | DEFAULT NOW()                                            | Last update timestamp          |

**Indexes**: `name` (unique), `specialty`

**RLS Policies**:
| Policy Name           | Operation | Rule                                |
| :-------------------- | :-------- | :---------------------------------- |
| `diseases_select_all` | SELECT    | `true` (public read for all authenticated users) |

---

### 5. `disease_symptoms` (Junction Table)

Maps many-to-many relationship between diseases and symptoms with a weight (importance factor).

| Column        | Type      | Constraints                                      | Description                     |
| :------------ | :-------- | :----------------------------------------------- | :------------------------------ |
| `id`          | `SERIAL`  | PK                                               | Record ID                       |
| `disease_id`  | `INTEGER` | FK → diseases.id ON DELETE CASCADE, NOT NULL     | Related disease                 |
| `symptom_id`  | `INTEGER` | FK → symptoms.id ON DELETE CASCADE, NOT NULL     | Related symptom                 |
| `weight`      | `REAL`    | DEFAULT 1.0, CHECK (weight >= 0.0 AND weight <= 5.0) | Importance weight for prediction|
| `is_primary`  | `BOOLEAN` | DEFAULT false                                    | Whether it's a primary symptom  |

**Indexes**: UNIQUE(`disease_id`, `symptom_id`)

**RLS Policies**:
| Policy Name                   | Operation | Rule   |
| :---------------------------- | :-------- | :----- |
| `disease_symptoms_select_all` | SELECT    | `true` |

---

### 6. `doctors`

Stores doctor/specialist profiles. Linked to `profiles` table (which is linked to `auth.users`).

| Column             | Type            | Constraints                                      | Description                    |
| :----------------- | :-------------- | :----------------------------------------------- | :----------------------------- |
| `id`               | `UUID`          | PK, DEFAULT gen_random_uuid()                   | Doctor profile ID              |
| `user_id`          | `UUID`          | FK → profiles.id ON DELETE CASCADE, UNIQUE, NOT NULL | Linked user profile       |
| `registration_no`  | `VARCHAR(100)`  | UNIQUE, NOT NULL                                 | Medical registration number    |
| `specialty`        | `VARCHAR(100)`  | NOT NULL                                         | Primary specialty              |
| `qualification`    | `VARCHAR(300)`  | NOT NULL                                         | Degrees & qualifications       |
| `experience_years` | `INTEGER`       | DEFAULT 0                                        | Years of experience            |
| `hospital_name`    | `VARCHAR(300)`  | NULLABLE                                         | Hospital / clinic name         |
| `hospital_address` | `TEXT`          | NULLABLE                                         | Full address                   |
| `latitude`         | `NUMERIC(10,8)` | NULLABLE                                         | Location latitude              |
| `longitude`        | `NUMERIC(11,8)` | NULLABLE                                         | Location longitude             |
| `consultation_fee` | `NUMERIC(10,2)` | DEFAULT 0.00                                     | Consultation fee               |
| `available_days`   | `VARCHAR(100)`  | NULLABLE                                         | e.g., "Mon,Tue,Wed,Fri"       |
| `available_from`   | `TIME`          | NULLABLE                                         | Start time (e.g., "09:00")     |
| `available_to`     | `TIME`          | NULLABLE                                         | End time (e.g., "17:00")       |
| `average_rating`   | `NUMERIC(3,2)`  | DEFAULT 0.00                                     | Calculated average rating      |
| `total_reviews`    | `INTEGER`       | DEFAULT 0                                        | Total review count             |
| `is_verified`      | `BOOLEAN`       | DEFAULT false                                    | Admin verification status      |
| `bio`              | `TEXT`          | NULLABLE                                         | Doctor bio / about             |
| `profile_image`    | `TEXT`          | NULLABLE                                         | Professional photo URL         |
| `created_at`       | `TIMESTAMPTZ`   | DEFAULT NOW()                                    | Record creation timestamp      |
| `updated_at`       | `TIMESTAMPTZ`   | DEFAULT NOW()                                    | Last update timestamp          |

**Indexes**: `user_id` (unique), `specialty`, `registration_no` (unique)

**RLS Policies**:
| Policy Name              | Operation | Rule                                                         |
| :----------------------- | :-------- | :----------------------------------------------------------- |
| `doctors_select_all`     | SELECT    | `true` (all authenticated users can browse doctors)          |
| `doctors_update_own`     | UPDATE    | `auth.uid() = user_id` (doctor can edit their own profile)   |
| `doctors_insert_own`     | INSERT    | `auth.uid() = user_id` (user can create their doctor profile)|

---

### 7. `doctor_specialties` (Junction Table)

Maps diseases to doctor specialties (which specialist should be recommended for which disease).

| Column        | Type           | Constraints                                  | Description                     |
| :------------ | :------------- | :------------------------------------------- | :------------------------------ |
| `id`          | `SERIAL`       | PK                                           | Record ID                       |
| `disease_id`  | `INTEGER`      | FK → diseases.id ON DELETE CASCADE, NOT NULL | Related disease                 |
| `specialty`   | `VARCHAR(100)` | NOT NULL                                     | Doctor specialty name           |
| `priority`    | `INTEGER`      | DEFAULT 1                                    | Recommendation priority (1=top) |

**Indexes**: UNIQUE(`disease_id`, `specialty`)

**RLS Policies**:
| Policy Name                      | Operation | Rule   |
| :------------------------------- | :-------- | :----- |
| `doctor_specialties_select_all`  | SELECT    | `true` |

---

### 8. `appointments`

Tracks patient-doctor appointments.

| Column                | Type           | Constraints                                                        | Description                  |
| :-------------------- | :------------- | :----------------------------------------------------------------- | :--------------------------- |
| `id`                  | `UUID`         | PK, DEFAULT gen_random_uuid()                                     | Appointment ID               |
| `patient_id`          | `UUID`         | FK → profiles.id ON DELETE CASCADE, NOT NULL                      | Patient who booked           |
| `doctor_id`           | `UUID`         | FK → doctors.id ON DELETE CASCADE, NOT NULL                       | Booked doctor                |
| `disease_id`          | `INTEGER`      | FK → diseases.id ON DELETE SET NULL, NULLABLE                     | Predicted disease (if any)   |
| `appointment_date`    | `DATE`         | NOT NULL                                                           | Appointment date             |
| `appointment_time`    | `TIME`         | NOT NULL                                                           | Appointment time             |
| `status`              | `TEXT`         | CHECK IN ('pending','confirmed','completed','cancelled','no_show'), DEFAULT 'pending' | Booking status |
| `symptoms_text`       | `TEXT`         | NULLABLE                                                           | Patient's symptom description|
| `notes`               | `TEXT`         | NULLABLE                                                           | Doctor/patient notes         |
| `cancellation_reason` | `TEXT`         | NULLABLE                                                           | Reason for cancellation      |
| `created_at`          | `TIMESTAMPTZ`  | DEFAULT NOW()                                                      | Booking timestamp            |
| `updated_at`          | `TIMESTAMPTZ`  | DEFAULT NOW()                                                      | Last update timestamp        |

**Indexes**: `patient_id`, `doctor_id`, `status`, `appointment_date`

**RLS Policies**:
| Policy Name                    | Operation       | Rule                                                                              |
| :----------------------------- | :-------------- | :-------------------------------------------------------------------------------- |
| `appointments_select_patient`  | SELECT          | `auth.uid() = patient_id` (patients see their own appointments)                  |
| `appointments_select_doctor`   | SELECT          | `auth.uid() IN (SELECT user_id FROM doctors WHERE id = doctor_id)` (doctors see their appointments) |
| `appointments_insert_patient`  | INSERT          | `auth.uid() = patient_id` (patients can create bookings)                         |
| `appointments_update_patient`  | UPDATE          | `auth.uid() = patient_id` (patients can cancel)                                 |
| `appointments_update_doctor`   | UPDATE          | `auth.uid() IN (SELECT user_id FROM doctors WHERE id = doctor_id)` (doctors can confirm/reject) |

---

### 9. `reviews`

Patient reviews for doctors.

| Column           | Type           | Constraints                                                   | Description                  |
| :--------------- | :------------- | :------------------------------------------------------------ | :--------------------------- |
| `id`             | `SERIAL`       | PK                                                            | Review ID                    |
| `patient_id`     | `UUID`         | FK → profiles.id ON DELETE CASCADE, NOT NULL                 | Reviewing patient            |
| `doctor_id`      | `UUID`         | FK → doctors.id ON DELETE CASCADE, NOT NULL                  | Reviewed doctor              |
| `appointment_id` | `UUID`         | FK → appointments.id ON DELETE SET NULL, NULLABLE            | Related appointment          |
| `rating`         | `INTEGER`      | NOT NULL, CHECK (rating >= 1 AND rating <= 5)                | Star rating                  |
| `comment`        | `TEXT`         | NULLABLE                                                      | Written review               |
| `is_anonymous`   | `BOOLEAN`      | DEFAULT false                                                 | Anonymous review flag        |
| `created_at`     | `TIMESTAMPTZ`  | DEFAULT NOW()                                                 | Review timestamp             |
| `updated_at`     | `TIMESTAMPTZ`  | DEFAULT NOW()                                                 | Last update timestamp        |

**Indexes**: UNIQUE(`patient_id`, `doctor_id`, `appointment_id`), `doctor_id`

**RLS Policies**:
| Policy Name               | Operation | Rule                                                      |
| :------------------------ | :-------- | :-------------------------------------------------------- |
| `reviews_select_all`      | SELECT    | `true` (all users can read reviews)                       |
| `reviews_insert_patient`  | INSERT    | `auth.uid() = patient_id` (only the patient can submit)   |
| `reviews_update_own`      | UPDATE    | `auth.uid() = patient_id` (patients can edit own reviews) |
| `reviews_delete_own`      | DELETE    | `auth.uid() = patient_id`                                 |

---

### 10. `medical_history`

Patient's persistent medical records.

| Column          | Type           | Constraints                                                    | Description                  |
| :-------------- | :------------- | :------------------------------------------------------------- | :--------------------------- |
| `id`            | `SERIAL`       | PK                                                             | Record ID                    |
| `user_id`       | `UUID`         | FK → profiles.id ON DELETE CASCADE, NOT NULL                  | Patient                      |
| `condition`     | `VARCHAR(300)` | NOT NULL                                                       | Medical condition name       |
| `diagnosed_date`| `DATE`         | NULLABLE                                                       | When diagnosed               |
| `status`        | `TEXT`         | CHECK IN ('active','resolved','managed'), DEFAULT 'active'    | Condition status             |
| `medications`   | `TEXT[]`       | NULLABLE                                                       | Current medications          |
| `allergies`     | `TEXT[]`       | NULLABLE                                                       | Known allergies              |
| `notes`         | `TEXT`         | NULLABLE                                                       | Additional notes             |
| `created_at`    | `TIMESTAMPTZ`  | DEFAULT NOW()                                                  | Record creation timestamp    |
| `updated_at`    | `TIMESTAMPTZ`  | DEFAULT NOW()                                                  | Last update timestamp        |

**Indexes**: `user_id`

**RLS Policies**:
| Policy Name                     | Operation       | Rule                        |
| :------------------------------ | :-------------- | :-------------------------- |
| `medical_history_select_own`    | SELECT          | `auth.uid() = user_id`     |
| `medical_history_insert_own`    | INSERT          | `auth.uid() = user_id`     |
| `medical_history_update_own`    | UPDATE          | `auth.uid() = user_id`     |
| `medical_history_delete_own`    | DELETE          | `auth.uid() = user_id`     |

---

### 11. `diagnosis_history`

Logs of all symptom checks and predictions made by users (old implementation).

| Column                 | Type            | Constraints                                              | Description                  |
| :--------------------- | :-------------- | :------------------------------------------------------- | :--------------------------- |
| `id`                   | `SERIAL`        | PK                                                       | Record ID                    |
| `user_id`              | `UUID`          | FK → profiles.id ON DELETE CASCADE, NOT NULL             | Patient who checked          |
| `symptoms`             | `INTEGER[]`     | NOT NULL                                                 | Array of symptom IDs entered |
| `predicted_disease_id` | `INTEGER`       | FK → diseases.id ON DELETE SET NULL, NULLABLE            | Top predicted disease        |
| `confidence_score`     | `NUMERIC(5,2)`  | NOT NULL                                                 | Prediction confidence (%)    |
| `all_predictions`      | `JSONB`         | NOT NULL                                                 | Full prediction results JSON |
| `feedback`             | `TEXT`          | CHECK IN ('helpful','not_helpful','incorrect'), NULLABLE | User feedback                |
| `created_at`           | `TIMESTAMPTZ`   | DEFAULT NOW()                                            | Diagnosis timestamp          |

**Indexes**: `user_id`, `predicted_disease_id`, `created_at`

**RLS Policies**:
| Policy Name                       | Operation | Rule                    |
| :-------------------------------- | :-------- | :---------------------- |
| `diagnosis_history_select_own`    | SELECT    | `auth.uid() = user_id` |
| `diagnosis_history_insert_own`    | INSERT    | `auth.uid() = user_id` |
| `diagnosis_history_update_own`    | UPDATE    | `auth.uid() = user_id` |
| `diagnosis_history_delete_own`    | DELETE    | `auth.uid() = user_id` |

**`all_predictions` JSONB format:**
```json
[
  {
    "disease_id": 1,
    "disease_name": "Common Cold",
    "confidence": 85.5,
    "specialty": "General Medicine"
  },
  {
    "disease_id": 4,
    "disease_name": "Flu",
    "confidence": 72.3,
    "specialty": "General Medicine"
  }
]
```

---

### 12. `ai_check_history`

Stores AI symptom check results from the Gemini-based checker.

| Column                   | Type          | Constraints                                  | Description                    |
| :----------------------- | :------------ | :------------------------------------------- | :----------------------------- |
| `id`                     | `UUID`        | PK, DEFAULT gen_random_uuid()                | Unique record ID               |
| `user_id`                | `UUID`        | FK → profiles.id ON DELETE CASCADE           | Patient who performed check    |
| `symptoms`               | `TEXT[]`      | NOT NULL, DEFAULT '{}'                       | Symptoms reported              |
| `duration`               | `TEXT`        | NOT NULL, DEFAULT ''                         | Duration of symptoms           |
| `additional_notes`       | `TEXT`        | NULLABLE                                     | Additional user notes          |
| `overall_risk`           | `TEXT`        | NOT NULL, DEFAULT 'LOW'                      | Overall risk assessment        |
| `conditions`             | `JSONB`       | NOT NULL, DEFAULT '[]'                       | Array of predicted conditions  |
| `recommendation`         | `TEXT`        | NULLABLE                                     | AI recommendation text         |
| `recommended_specialist` | `TEXT`        | NULLABLE                                     | Suggested specialist title     |
| `recommended_specialties`| `TEXT[]`      | DEFAULT '{}'                                 | Array of specialty tags        |
| `created_at`             | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW()                      | Timestamp of prediction        |

**Indexes**: `user_id`, `created_at`

**RLS Policies**:
| Policy Name                          | Operation    | Rule                                                      |
| :----------------------------------- | :----------- | :-------------------------------------------------------- |
| `ai_check_history_select_own`        | SELECT       | `auth.uid() = user_id`                                    |
| `ai_check_history_insert_own`        | INSERT       | `auth.uid() = user_id`                                    |
| `ai_check_history_delete_own`        | DELETE       | `auth.uid() = user_id`                                    |

---

## Supabase Storage Buckets

| Bucket Name   | Public | Description                        | Access Policy                          |
| :------------ | :----- | :--------------------------------- | :------------------------------------- |
| `patients`    | Yes    | User & doctor profile images       | Authenticated users can upload to their own path (`user_id/*`) |
| `medical-docs`| No     | Medical documents & reports        | Only the owning user can read/write    |

> **Note**: The `patients` bucket is used for all profile image uploads — both during registration (via `AuthContext.signUp()`) and in the profile settings editor (`settings/profile.tsx`). Images are stored at `{user_id}/avatar.{ext}` with `upsert: true` to allow overwrites.

### Storage RLS Example

```sql
-- Allow users to upload their own profile image
CREATE POLICY "users_upload_own_image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'patients'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read for profile images
CREATE POLICY "public_read_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'patients');
```

---

## Database Functions (Supabase SQL Functions)

### `update_doctor_rating()`
Automatically recalculates a doctor's average rating and total review count when a review is inserted/updated/deleted.

```sql
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE doctors
  SET
    average_rating = COALESCE(
      (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)),
      0.00
    ),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_rating();
```

### `update_timestamp()`
Automatically updates the `updated_at` column on row modification.

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at (idempotent with DROP IF EXISTS)
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS set_updated_at ON public.doctors;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS set_updated_at ON public.appointments;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS set_updated_at ON public.reviews;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS set_updated_at ON public.medical_history;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON medical_history FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS set_updated_at ON public.symptoms;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON symptoms FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS set_updated_at ON public.diseases;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON diseases FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

---

## Relationships Summary

| Relationship                     | Type    | Description                                            |
| :------------------------------- | :------ | :----------------------------------------------------- |
| `auth.users` → `profiles`       | 1:1     | Auto-created via trigger on signup                      |
| `profiles` → `appointments`     | 1:N     | A patient can have many appointments                    |
| `profiles` → `medical_history`  | 1:N     | A patient can have multiple medical records             |
| `profiles` → `diagnosis_history`| 1:N     | A patient can run many symptom checks                   |
| `profiles` → `reviews`          | 1:N     | A patient can write many reviews                        |
| `profiles` → `doctors`          | 1:1     | A doctor user has one doctor profile                    |
| `profiles` → `ai_check_history` | 1:N     | A patient can have multiple AI check histories          |
| `doctors` → `appointments`      | 1:N     | A doctor can have many appointments                     |
| `doctors` → `reviews`           | 1:N     | A doctor can receive many reviews                       |
| `diseases` ↔ `symptoms`         | M:N     | Via `disease_symptoms` junction table                   |
| `diseases` → `doctor_specialties`| 1:N    | Each disease maps to one or more specialties            |
| `diseases` → `diagnosis_history`| 1:N     | A disease can be predicted in many diagnoses            |

---

## Seed Data Requirements

### Symptoms (~50+ entries)
Categories: Head, Eyes, Ears/Nose/Throat, Chest, Abdomen, Skin, Musculoskeletal, Neurological, General

### Diseases (~30+ entries)
Common conditions: Common Cold, Flu, Migraine, Hypertension, Diabetes Type 2, Asthma, Allergic Rhinitis, Gastritis, UTI, Dengue, Malaria, COVID-19, Bronchitis, Pneumonia, Anemia, Thyroid Disorders, etc.

### Doctors (~15+ entries)
Specialties: General Medicine, Cardiology, Dermatology, Orthopedics, Neurology, ENT, Pulmonology, Gastroenterology, Endocrinology, Pediatrics, Ophthalmology, Psychiatry

> **Seed file**: `supabase/seed.sql` — run via Supabase CLI or Dashboard SQL Editor.
> **Note**: Sri Lankan mock doctor data is available in `supabase/doctors.db`. You can run this file in the Supabase SQL Editor to populate the doctors and profiles tables.

---

## Supabase CLI Commands

```bash
# Start local Supabase (requires Docker)
supabase start

# Stop local Supabase
supabase stop

# Create a new migration
supabase migration new <migration_name>

# Apply migrations to local DB
supabase db reset

# Push migrations to remote project
supabase db push

# Pull remote schema into local migrations
supabase db pull

# Seed data (run against local)
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql

# Generate TypeScript types
supabase gen types typescript --linked > Frontend/types/database.types.ts

# Deploy Edge Functions
supabase functions deploy predict-disease
supabase functions deploy send-notification

# View logs
supabase functions logs predict-disease
```

---

## Enabling RLS (Row Level Security)

> **Critical**: RLS must be enabled on ALL tables that contain user data. Without RLS, any authenticated user can read/write all rows.

```sql
-- Enable RLS on each table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_check_history ENABLE ROW LEVEL SECURITY;
```
