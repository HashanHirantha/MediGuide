# 🚀 MediGuide — Future Features & Development Roadmap

## Overview

This document tracks all planned features, enhancements, and technical improvements for the MediGuide Disease & Doctor Recommendation app. Features are organized by development phase and priority.

> **Architecture**: The app uses **Supabase** as its backend (PostgreSQL, Auth, Storage, Edge Functions, Realtime). There is **no custom Express.js backend** — the React Native (Expo) frontend communicates directly with Supabase. AI-powered symptom analysis uses **Google Gemini** via a secure Supabase Edge Function.

---

## Phase 1 — MVP (Core Features) ✅ MOSTLY COMPLETE

> **Goal**: Build a working symptom checker with disease prediction and doctor listing using Supabase.

### 1.1 Supabase Project Setup ✅ DONE
- [x] Create Supabase project and configure environment
- [x] Set up `supabase/` directory with CLI config (`config.toml`)
- [x] Create all SQL migration files for tables (11 migrations)
- [x] Enable Row Level Security (RLS) on all tables
- [x] Write and apply RLS policies (including `profiles_insert_own`, `diagnosis_history` update/delete)
- [x] Create database trigger for `profiles` table on auth signup (with `DROP TRIGGER IF EXISTS` for idempotency)
- [x] Seed symptoms, diseases, disease-symptom mappings, and doctor data
- [x] Create `doctors.db` with Sri Lankan mock doctor data
- [ ] Generate TypeScript types (`supabase gen types typescript`) — types file exists but may need refresh
- [x] Initialize Supabase JS client in Frontend (`lib/supabase.ts`)
- [x] Configure Supabase URL and anon key (`constants/config.ts`)

### 1.2 Authentication & User Management (Supabase Auth) ✅ DONE
- [x] User registration with email & password via `supabase.auth.signUp()`
- [x] Login with `supabase.auth.signInWithPassword()`
- [x] Auth state listener with `supabase.auth.onAuthStateChange()`
- [x] Session persistence via AsyncStorage adapter
- [x] Protected navigation (redirect unauthenticated users to login)
- [x] User profile CRUD via `profiles` table (name, phone, DOB, gender, blood group, height, weight, BMI)
- [x] Password reset via `supabase.auth.resetPasswordForEmail()`
- [x] Auto-refresh token handling (built-in to Supabase client)
- [x] Profile image upload during registration (Supabase Storage `patients` bucket)
- [x] Auto-BMI calculation from height/weight
- [x] SignUp with full metadata (firstName, lastName, phone, dateOfBirth, gender, bloodGroup, heightCm, weightKg, profileImage)
- [x] Session error handling with automatic sign-out on invalid refresh token
- [x] Forgot password screen

### 1.3 Symptom Checker ✅ DONE
- [x] Symptom database seeding (50+ symptoms in `supabase/seed.sql`)
- [x] Fetch symptoms via `supabase.from('symptoms').select('*')`
- [x] Symptom search with `ilike` (debounced, via `symptomService.ts`)
- [x] Multi-select symptom picker UI (chip-based)
- [x] Default common symptom chips (Headache, Fever, Fatigue, Chest Tightness, Cough, Dizziness, Nausea, Body Aches, Sore Throat, Shortness of Breath)
- [x] Duration selector (6 preset options: Less than a day → 1+ month)
- [x] Additional notes text input
- [x] Image/document attachment support (camera, gallery, document picker with base64 encoding)
- [x] 4-step progress indicator with visual progress circle

### 1.4 Disease Prediction Engine ✅ DONE
- [x] **Gemini AI prediction** via `gemini-symptom-check` Edge Function (primary engine)
- [x] Rule-based prediction algorithm via `predict-disease` Edge Function (fallback)
- [x] Multi-modal analysis (text symptoms + attached images/documents)
- [x] Patient context (age, gender) sent for personalized analysis
- [x] Confidence score / possibility percentage per predicted condition
- [x] Risk level per condition (low/moderate/high/critical)
- [x] Overall risk assessment with color-coded display
- [x] Recommended specialist and recommended_specialties in response
- [x] Disease database seeding (30+ diseases with symptom mappings)
- [x] Save diagnosis results to `ai_check_history` table — service wired in check.tsx

### 1.5 Doctor Listing & Recommendation ✅ DONE
- [x] Doctor database seeding (15+ doctors across specialties)
- [x] Sri Lankan mock doctor data (`supabase/doctors.db`)
- [x] Specialty-based doctor filtering (filter chips UI)
- [x] Doctor profile cards (name, specialty, hospital, rating, fee)
- [x] Doctor detail screen with full profile (`doctors/[id].tsx`)
- [x] Post-analysis recommended doctors component (`RecommendedDoctors.tsx`) — fetches by AI-recommended specialties
- [x] Mock data fallback when no Supabase data available

### 1.6 Appointment Booking ✅ DONE
- [x] Date picker (next 7 available dates filtered by doctor's available_days)
- [x] Time slot selection UI (auto-generated from doctor's available_from/available_to)
- [x] Date scanning up to 30 days ahead to find valid available days
- [x] Symptom text input for booking context
- [x] Booking creation via `supabase.from('appointments').insert({ ... })`
- [x] Booking confirmation with summary
- [x] My Bookings list with status filters (`history.tsx`)
- [x] Appointment detail screen (`appointments/[id].tsx`)
- [ ] Cancel appointment UI — needs implementation
- [ ] Realtime appointment status updates via Supabase Realtime subscriptions — hook exists but not fully wired

---

## Phase 2 — Enhanced Experience 🔜 PARTIALLY DONE

> **Goal**: Add rich user experience features, doctor-side portal, and review system.

### 2.1 Doctor Dashboard (Doctor Role) — ✅ DONE
- [x] Doctor registration flow (separate from patient)
- [x] Doctor-specific bottom tab layout (`app/(doctor)/` — Dashboard, Schedule, Profile)
- [x] Dashboard home screen with stats (today's appointments, total patients, average rating)
- [x] Today's schedule and recent patients display on dashboard
- [x] Professional Profile editor (specialty, qualifications, hospital, fees, experience, bio)
- [x] Professional Profile uses shared `Input`/`Button` UI components (matches main app theme)
- [x] Edit Profile (general) hides patient-specific fields (blood group, height, weight) for doctors
- [x] Availability schedule management (day-of-week picker, time range selector)
- [x] Schedule data persisted to `doctors` table (`available_days`, `available_from`, `available_to`)
- [x] Doctor bio/about field editable from Professional Profile, displayed on patient-facing detail screen
- [x] Incoming appointment requests view (realtime via Supabase)
- [x] Accept / Reject / Reschedule appointments
- [x] Patient symptom summary view before appointment
- [x] All doctor dashboard changes sync live with main patient app

### 2.2 Ratings & Reviews System ✅ DONE
- [x] Patient review modal on doctor detail screen ("Write a Review" button)
- [x] Star rating UI (1–5 tappable stars)
- [x] Optional comment text input with `KeyboardAvoidingView` for smooth keyboard handling
- [x] Anonymous review toggle (checkbox)
- [x] Review submission service (`doctorService.ts → submitReview()`)
- [x] Review display on doctor detail screen (latest 5 reviews)
- [x] Average rating auto-calculation via `update_doctor_rating()` trigger
- [x] Dynamic patient count from `appointments` table (not `total_reviews`)
- [x] Doctor image resolution via `getDoctorImageUrl()` utility (Storage → profile_image → fallback)
- [ ] Post-appointment review prompt (auto-suggest after completed appointment)
- [ ] Review moderation (flag inappropriate content)

### 2.3 Medical History & Health Profile ✅ PARTIALLY DONE
- [ ] Chronic conditions tracker via `medical_history` table — table exists, UI not built
- [ ] Current medications list
- [ ] Allergies management
- [ ] Family medical history
- [x] Past diagnosis history display (`history.tsx` tab)
- [ ] PDF export of medical history

### 2.4 Push Notifications ✅ DONE
- [x] Appointment reminders via Supabase Edge Function (`appointment-reminders`)
- [x] Booking status change notifications (triggered by `appointmentService.ts`)
- [x] Health tip of the day (`daily-health-tip` Edge Function)
- [x] Emergency health alerts (Local notification on High/Critical AI risk)
- [x] User-specific notification preferences stored in `profiles` (DB migration 00016)

### 2.5 File Storage & Image Handling ✅ PARTIALLY DONE
- [x] Profile image upload to Supabase Storage (`patients` bucket)
- [x] Profile image upload during registration (with upsert)
- [x] Profile image update from settings/profile screen
- [ ] Medical document upload to Supabase Storage (`medical-docs` bucket)
- [ ] Image compression before upload
- [x] Storage access via `storageService.ts`

### 2.6 UI/UX Enhancements — PARTIALLY DONE
- [ ] Dark mode support
- [ ] Onboarding walkthrough screens
- [ ] Skeleton loading screens
- [ ] Pull-to-refresh on all lists
- [ ] Animated transitions between screens
- [ ] Haptic feedback on actions

### 2.7 UI Redesign (Mockup-Based) ✅ DONE
- [x] Home screen redesigned — greeting, search bar, Disease Prediction card, Book a Doctor card, FAB button
- [x] Symptom Checker (check.tsx) redesigned — 4-step progress circle, add symptom search, common observation chips, duration tracker, AI prediction insights with percentages, image attachment support
- [x] Settings screen redesigned — profile card with avatar, General section (Profile Settings, Notifications, Security), Preference section (Language, Help/Support), Sign Out button
- [x] Settings sub-screens implemented — profile edit, notifications preferences, security settings

### 2.8 Settings & Preferences ✅ DONE
- [x] Settings hub screen with profile card and navigation
- [x] Profile Settings sub-screen (edit all fields: name, phone, DOB, gender, blood group, height, weight; avatar picker; BMI calculation)
- [x] Notifications sub-screen (appointment reminders, health tips, email notifications, SMS alerts — all toggleable)
- [x] Security sub-screen (change password, two-factor authentication, biometric login — all toggleable)
- [x] Sign Out with confirmation dialog
- [x] Language selection — `settings/language.tsx` with English, Sinhala, Tamil (i18n)
- [x] Help & Support — `settings/help.tsx` screen

---

## Phase 3 — Advanced & AI Features 🔮 PARTIALLY STARTED

> **Goal**: Integrate machine learning, telemedicine, and advanced healthcare features.

### 3.1 AI/ML-Powered Disease Prediction ✅ PARTIALLY DONE
- [x] **Gemini AI integration** via `gemini-symptom-check` Edge Function
- [x] Multi-modal analysis (text + images via base64)
- [x] Patient context-aware analysis (age, gender from profile)
- [x] Structured JSON response with conditions, confidence %, risk levels
- [x] Recommended specialties returned from AI for doctor matching
- [x] NLP symptom input ("I've had a headache and nausea for 2 days")
- [x] Improved prediction accuracy with patient history context
- [x] Feedback loop — user reports help retrain model
- [x] Confidence calibration and multi-disease comorbidity detection

### 3.2 Telemedicine & Virtual Consultation — TODO
- [ ] In-app video calling (WebRTC / Twilio)
- [ ] Real-time chat between patient and doctor (Supabase Realtime)
- [ ] File/image sharing in chat (Supabase Storage)
- [ ] Digital prescription generation
- [ ] Consultation recording (with consent)

### 3.3 Health Articles & Content ✅ DONE
- [x] Curated health articles stored in Supabase (`articles` table)
- [x] AI-generated articles via `generate-articles` Edge Function (Gemini AI)
- [x] Auto-scheduled article generation every 2 days via `pg_cron` + `pg_net`
- [x] Auto-cleanup of articles older than 7 days
- [x] Preventive care tips & lifestyle recommendations (generated categories)
- [x] Seasonal health alerts (generated categories)
- [x] Bookmarking articles (`user_article_bookmarks` table)
- [x] Article search & categories (`articles/index.tsx`)
- [x] Article detail view (`articles/[id].tsx`)
- [x] `articleService.ts` for CRUD & bookmark management

### 3.4 Interactive Symptom Input — PARTIALLY DONE
- [x] Common symptom chip selection
- [x] Photo-based symptom input (image attachment support via camera/gallery)
- [x] Document attachment for lab reports
- [x] 3D human body model for symptom selection
- [ ] Voice-based symptom input
- [ ] Symptom timeline visualization
- [ ] Related symptom suggestions ("Did you also experience...")

### 3.5 Maps & Navigation — TODO
- [ ] Google Maps integration for doctor locations
- [ ] Directions to hospital/clinic
- [ ] Nearby hospitals/pharmacies search
- [ ] Emergency services locator

---

## Phase 4 — Scale & Monetization 💰

> **Goal**: Prepare for production, add premium features, and admin tooling.

### 4.1 Admin Panel
- [ ] Use Supabase Dashboard for basic admin operations
- [ ] Build custom admin views with Supabase RLS admin policies
- [ ] User management (view, block, delete)
- [ ] Doctor verification & approval workflow
- [ ] Symptom & disease CRUD management
- [ ] Analytics via Supabase SQL queries and dashboards

### 4.2 Payment Integration
- [ ] Stripe / Razorpay integration for consultation fees
- [ ] Payment processing via Supabase Edge Functions
- [ ] In-app payment during booking
- [ ] Payment history & receipts
- [ ] Doctor payout management
- [ ] Refund processing for cancellations

### 4.3 Multi-language Support ✅ DONE
- [x] i18n framework integration (`i18n/` module)
- [x] Sinhala language support (`si.json`)
- [x] Tamil language support (`ta.json`)
- [x] English language support (`en.json`)
- [x] Language switcher in settings (`settings/language.tsx`)
- [x] `LanguageContext` for app-wide locale state management
- [x] All UI strings use `i18n.t()` keys

### 4.4 Accessibility
- [ ] Screen reader support (VoiceOver / TalkBack)
- [ ] Font size adjustments
- [ ] High contrast mode
- [ ] Reduced motion mode

### 4.5 Performance & DevOps
- [ ] Supabase connection pooling (PgBouncer built-in)
- [ ] Image optimization via Supabase Storage transforms
- [ ] Edge Function monitoring and logging
- [ ] CI/CD pipeline (GitHub Actions + Supabase CLI)
- [ ] Automated testing (Jest + React Native Testing Library)
- [ ] Error tracking (Sentry)
- [ ] Supabase database backups and Point-in-Time Recovery

---

## Technical Debt & Improvements

| Item                                    | Priority | Description                                               |
| :-------------------------------------- | :------- | :-------------------------------------------------------- |
| Diagnosis history save                  | ~~High~~ | ~~Wire up `diagnosis_history` insert after Gemini prediction in `check.tsx`~~ ✅ Done — saved to `ai_check_history` |
| Appointment cancellation UI             | High     | Add cancel button/flow to appointment detail screen       |
| Realtime subscriptions wiring           | High     | Connect `useRealtime` hook to appointment status updates  |
| RLS policy audit                        | High     | Review all RLS policies for data leaks and edge cases     |
| TypeScript types sync                   | High     | Auto-generate DB types on every migration via CI          |
| Input validation                        | High     | Validate inputs client-side and in Edge Functions         |
| Error handling standardization          | High     | Consistent error handling for Supabase `{ data, error }` responses |
| Remove dead local styles                | Low      | `home.tsx` has unused local `styles` object after migration to `globalStyles` |
| Database indexing                       | Medium   | Optimize queries with proper indexes (check query plans)  |
| TypeScript strict mode                  | Medium   | Enable `strict: true` in tsconfig                         |
| Logging                                 | Medium   | Structured logging in Edge Functions                      |
| Security audit                          | High     | Review RLS policies, Storage policies, Edge Function auth |
| Test coverage                           | Medium   | Aim for 80%+ coverage on services and hooks               |
| Environment config                      | Low      | Validate Supabase URL/key with `zod` at startup           |
| Code documentation                      | Low      | JSDoc comments on all public functions                     |
| Supabase migrations versioning          | Medium   | Keep all schema changes in migration files, never edit via Dashboard SQL Editor |
| Settings toggles persistence            | Medium   | Notification/security toggles are local state only — need backend persistence |
| Storage bucket naming                   | Low      | Profile settings uses `avatars` bucket but registration uses `patients` — standardize |

---

## Data Sources for Seed Data

| Resource                              | URL / Description                                           |
| :------------------------------------ | :--------------------------------------------------------- |
| Disease-Symptom Dataset (Kaggle)     | Kaggle datasets for disease-symptom mappings                |
| WHO ICD-11 Classification            | International Classification of Diseases                    |
| Mayo Clinic Symptom Checker          | Reference for symptom-disease relationships                 |
| NHS Health A-Z                       | Disease descriptions and precautions                        |
| Sri Lanka Medical Council            | Doctor registration & specialty data (if localizing)        |

---

## Development Priority Order

```
Phase 1 (MVP) ✅ MOSTLY COMPLETE
├── 1.1 Supabase Setup ────────── ✅ Done
├── 1.2 Auth (Supabase Auth) ──── ✅ Done
├── 1.3 Symptom Checker ──────── ✅ Done
├── 1.4 Disease Prediction ────── ✅ Done (Gemini AI)
├── 1.5 Doctor Recommendation ─── ✅ Done
└── 1.6 Appointment Booking ───── ✅ Mostly Done (cancel/realtime pending)

Phase 2 (Enhanced) 🔜 IN PROGRESS
├── 2.1 Doctor Dashboard ──────── ✅ Done (dashboard, schedule, profile)
├── 2.2 Reviews System ────────── ✅ Done (review modal, stars, anonymous, auto-rating)
├── 2.3 Medical History ────────── Partially Done (schema ready, UI pending)
├── 2.4 Notifications ─────────── ✅ Done (Edge Functions, Local, Expo Push)
├── 2.5 Storage & Images ──────── Partially Done
├── 2.6 UI Polish ─────────────── TODO
├── 2.7 UI Redesign ───────────── ✅ Done
└── 2.8 Settings Sub-screens ──── ✅ Done

Phase 3 (Advanced) 🔮 PARTIALLY STARTED
├── 3.1 AI Prediction ─────────── ✅ Gemini integrated
├── 3.2 Telemedicine ──────────── TODO
├── 3.3 Health Articles ───────── ✅ Done (AI-generated, bookmarks, cron)
├── 3.4 Interactive Input ─────── Partially Done (image attachments)
└── 3.5 Maps & Navigation ────── TODO

Phase 4 (Scale) ──────────────── PARTIALLY STARTED
├── 4.3 Multi-language (i18n) ─── ✅ Done (EN, SI, TA)
```

---

## Notes

- All medical information in the app must include a **disclaimer** that this is not a substitute for professional medical advice.
- Disease prediction confidence below **50%** should recommend visiting a **General Practitioner**.
- Emergency symptoms (chest pain, difficulty breathing, severe bleeding) should trigger an **immediate emergency alert** with local emergency numbers.
- User medical data must be protected by **Supabase RLS policies** and **transmitted over HTTPS** only (Supabase enforces HTTPS by default).
- **Never expose the Supabase `service_role` key** in the mobile app. Only use the `anon` key client-side. Use `service_role` only in Edge Functions or server-side scripts.
- **Never expose the `GEMINI_API_KEY`** in the mobile app. It must only live as a Supabase Edge Function secret.
- Keep all database schema changes in **migration files** (`supabase/migrations/`). Avoid making schema changes directly in the Supabase Dashboard SQL Editor to prevent drift.
