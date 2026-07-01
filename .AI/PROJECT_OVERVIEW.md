# 🏥 MediGuide — Disease & Doctor Recommendation App

## Project Overview

**MediGuide** is a mobile healthcare application that helps users identify potential diseases based on their symptoms and recommends suitable doctors/specialists nearby. The app uses **Google Gemini AI** (via a secure Supabase Edge Function) as its primary prediction engine to analyze symptoms and suggest possible conditions, then matches users with verified healthcare professionals based on specialty, location, ratings, and availability.

> ⚠️ **Disclaimer**: This app is a **decision-support tool** and does NOT replace professional medical diagnosis. Users should always consult a licensed healthcare provider for medical advice.

---

## Tech Stack

| Layer               | Technology                                           |
| :------------------ | :--------------------------------------------------- |
| **Mobile Frontend** | React Native (Expo SDK 54) + TypeScript              |
| **Backend / BaaS**  | Supabase (PostgreSQL, Auth, Storage, Edge Functions)  |
| **Database**        | Supabase PostgreSQL (with Row Level Security)         |
| **Authentication**  | Supabase Auth (Email/Password)                        |
| **AI Engine**       | Google Gemini API (via Supabase Edge Function)         |
| **Realtime**        | Supabase Realtime (Postgres Changes subscriptions)    |
| **Storage**         | Supabase Storage (`patients` bucket for profile images)|
| **Edge Functions**  | Supabase Edge Functions (Deno/TypeScript)             |
| **State Management**| React Context API + AsyncStorage                     |
| **Navigation**      | Expo Router v6 (file-based routing, Stack + Bottom Tabs) |
| **HTTP Client**     | Supabase JS Client (`@supabase/supabase-js` v2.45+)  |
| **Styling**         | React Native StyleSheet + Custom Theme System + Global Styles |
| **Maps/Location**   | React Native Maps + Expo Location                    |
| **Image Handling**  | Expo Image Picker + Expo Document Picker + Supabase Storage |
| **File System**     | Expo File System (for image base64 encoding)          |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  MOBILE APP (React Native / Expo)        │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │  Auth      │  │ Symptom   │  │ Doctor              │  │
│  │  Screens   │  │ Checker   │  │ Recommendation      │  │
│  └─────┬─────┘  └─────┬─────┘  └───────┬─────────────┘  │
│        │              │                 │                │
│        └──────────────┼─────────────────┘                │
│                       │                                  │
│              ┌────────▼────────┐                         │
│              │  Supabase JS    │                         │
│              │  Client SDK     │                         │
│              └────────┬────────┘                         │
└───────────────────────┼─────────────────────────────────┘
                        │  HTTPS
┌───────────────────────┼─────────────────────────────────┐
│            SUPABASE CLOUD PLATFORM                       │
│              ┌────────▼────────┐                         │
│              │  API Gateway    │                         │
│              │  (PostgREST +   │                         │
│              │   GoTrue Auth)  │                         │
│              └────────┬────────┘                         │
│     ┌─────────────────┼─────────────────┐                │
│     │                 │                 │                │
│  ┌──▼──────┐  ┌───────▼──────┐  ┌──────▼──────────┐     │
│  │ Auth    │  │  Edge        │  │  Realtime       │     │
│  │ (GoTrue)│  │  Functions   │  │  (WebSocket)    │     │
│  │         │  │  (Deno)      │  │                 │     │
│  └──┬──────┘  └───────┬──────┘  └──────┬──────────┘     │
│     │                 │                │                │
│     │          ┌──────▼──────┐         │                │
│     │          │ Gemini API  │         │                │
│     │          │ (External)  │         │                │
│     │          └──────┬──────┘         │                │
│     │                 │                │                │
│     └─────────────────┼────────────────┘                │
│              ┌────────▼────────┐                         │
│              │  PostgreSQL     │                         │
│              │  (with RLS)     │                         │
│              └────────┬────────┘                         │
│              ┌────────▼────────┐                         │
│              │  Storage        │                         │
│              │  (S3-compatible)│                         │
│              └─────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

---

## Core Features

### Phase 1 — Foundation (MVP)

1. **User Authentication**
   - Register / Login (Email + Password) via Supabase Auth
   - Session management with Supabase `onAuthStateChange` listener
   - Profile management (name, age, gender, blood group, height, weight, BMI, profile image) stored in `profiles` table
   - Profile image upload during registration (Supabase Storage `patients` bucket)
   - Auto-BMI calculation from height/weight on profile save
   - Password reset via Supabase Auth built-in email flow
   - Sign-out confirmation dialog

2. **Symptom Checker**
   - Searchable symptom list with debounced autocomplete from Supabase DB
   - Multi-select symptom picker UI with chip-based selection
   - Default common symptom chips (Headache, Fever, Fatigue, etc.)
   - Duration & severity input per symptom (6 preset options)
   - Additional notes text input
   - Image/document attachment support (camera, gallery, document picker with base64 encoding)
   - 4-step progress indicator

3. **Disease Prediction Engine (Gemini AI)**
   - **Primary**: Google Gemini AI via `gemini-symptom-check` Edge Function
   - Patient context (age, gender) sent with symptoms for personalized analysis
   - Multi-modal support: text symptoms + attached images (medical reports, lab results)
   - Structured response: conditions with confidence %, risk level, recommended specialties
   - Overall risk assessment (LOW / MODERATE / HIGH / CRITICAL)
   - Risk-level color coding in UI
   - **Fallback**: Rule-based prediction via `predict-disease` Edge Function (weighted symptom matching)

4. **Doctor Recommendation**
   - Specialty-based doctor filtering from AI prediction results
   - `RecommendedDoctors` component shows top-rated specialists after analysis
   - Doctor profiles (name, specialty, hospital, experience, rating, fee)
   - Doctor detail screen with full profile and reviews
   - Featured card + compact card layouts
   - Mock data fallback for UI development/demos

5. **Appointment Booking**
   - Select doctor → pick date (next 7 days) → pick time slot → add symptoms → confirm
   - Booking creation via Supabase `appointments.insert()`
   - Booking history & status tracking (Pending / Confirmed / Completed / Cancelled)
   - Appointment detail screen
   - My Bookings list

### Phase 2 — Enhanced Experience

6. **Health Profile & Medical History**
   - Persistent medical record (chronic conditions, medications, allergies)
   - Past diagnosis history within the app
   - Profile settings screen with full edit capability

7. **Settings & Preferences**
   - Settings hub with profile card, navigation to sub-screens
   - Profile Settings sub-screen (edit all profile fields, avatar picker)
   - Notifications sub-screen (push toggles, email/SMS alert toggles)
   - Security sub-screen (change password, 2FA toggle, biometric login toggle)
   - Sign Out with confirmation

8. **Ratings & Reviews**
   - Rate doctors after appointment completion (1-5 stars)
   - Written reviews with anonymous option
   - Average rating auto-calculation via `update_doctor_rating()` trigger
   - Review display on doctor detail screen

### Phase 3 — Advanced Features

9. **AI-Enhanced Prediction** (Partially Implemented)
    - ✅ Gemini AI integration via Edge Function (multi-modal: text + images)
    - NLP-based symptom input ("I have headache and fever") — future
    - Continuous model improvement from feedback — future

10. **Telemedicine / Video Consultation** — Future
11. **Health Articles & Awareness** — Future

---

## Folder Structure

```
Mobile-Computing/
├── .AI/                          # AI-assisted development docs
│   ├── PROJECT_OVERVIEW.md       # This file
│   ├── DATABASE_SCHEMA.md        # Supabase tables, RLS policies & relationships
│   └── FUTURE_FEATURES.md        # Roadmap & feature backlog
│
├── Frontend/
│   ├── UI/                       # UI mockup images
│   │   ├── Home_screen.png
│   │   ├── Healthcare_Prediction_screen.png
│   │   ├── Book_a_Doctor_screen.png
│   │   ├── Profile_screen.png
│   │   ├── Settings_screen.png
│   │   ├── Sign_In_screen.png
│   │   ├── Sign_Up_screen.png
│   │   └── MediGuide Mobile App Icon.png
│   ├── app/                      # Expo Router (file-based routing)
│   │   ├── _layout.tsx           # Root layout (AuthProvider → HealthProvider → Stack)
│   │   ├── index.tsx             # Entry redirect
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx      # Full registration with profile image, health data
│   │   │   └── forgot-password.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx       # Bottom tab bar layout (5 tabs: Home, Doctors, Check, History, Settings)
│   │   │   ├── home.tsx          # Dashboard with greeting, search, Disease Prediction & Book a Doctor cards, FAB
│   │   │   ├── check.tsx         # Full symptom checker with 4-step progress, Gemini AI analysis, image attachments
│   │   │   ├── doctors.tsx       # Browse doctors with specialty filter chips, featured + compact card layouts
│   │   │   ├── history.tsx       # Past appointments & diagnosis history with tab filters
│   │   │   └── settings.tsx      # Settings hub (profile card, general settings, preferences, sign out)
│   │   ├── symptoms/
│   │   │   ├── _layout.tsx
│   │   │   ├── select.tsx        # Symptom selection screen
│   │   │   └── results.tsx       # Disease prediction results
│   │   ├── doctors/
│   │   │   ├── _layout.tsx
│   │   │   ├── [id].tsx          # Doctor detail screen with reviews
│   │   │   └── book.tsx          # Booking screen (date/time picker, symptom input)
│   │   ├── appointments/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # All appointments
│   │   │   └── [id].tsx          # Appointment detail
│   │   └── settings/
│   │       ├── profile.tsx       # Edit profile (avatar, name, health data, BMI calc)
│   │       ├── notifications.tsx # Notification preferences (push, email, SMS toggles)
│   │       └── security.tsx      # Security settings (password, 2FA, biometrics)
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── TopBar.tsx            # Unified top navigation bar (← arrow, "MediGuide" title, profile avatar)
│   │   ├── RecommendedDoctors.tsx # Post-analysis doctor recommendations (fetches by specialty, paginated)
│   │   ├── SymptomCard.tsx
│   │   ├── DiseaseCard.tsx
│   │   ├── DoctorCard.tsx
│   │   ├── AppointmentCard.tsx
│   │   ├── BodySelector.tsx      # Interactive body-part picker
│   │   └── RatingStars.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Wraps Supabase Auth state (signIn, signUp with metadata, signOut, refreshProfile)
│   │   └── HealthContext.tsx
│   ├── lib/
│   │   └── supabase.ts           # Supabase client initialization
│   ├── services/
│   │   ├── authService.ts        # Supabase Auth wrappers
│   │   ├── geminiService.ts      # Gemini AI symptom analysis (calls gemini-symptom-check Edge Function)
│   │   ├── symptomService.ts     # Symptom queries (search)
│   │   ├── diseaseService.ts     # Disease queries & prediction
│   │   ├── doctorService.ts      # Doctor queries (list, detail, reviews, recommended)
│   │   ├── appointmentService.ts # Appointment CRUD
│   │   └── storageService.ts     # Supabase Storage wrappers
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSymptoms.ts
│   │   ├── useDoctors.ts
│   │   └── useRealtime.ts        # Supabase Realtime subscription hook
│   ├── types/
│   │   ├── database.types.ts     # Auto-generated Supabase DB types
│   │   └── index.ts              # App-level type definitions
│   ├── constants/
│   │   ├── theme.ts              # Colors, fonts, spacing, radius, shadows
│   │   ├── globalStyles.ts       # Shared StyleSheet (1400+ lines of reusable styles)
│   │   └── config.ts             # Supabase URL & anon key
│   ├── utils/
│   │   └── helpers.ts            # Utility functions
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/                     # Supabase local development config
│   ├── config.toml               # Supabase CLI project config
│   ├── doctors.db                # Sri Lankan mock doctor data (SQL insert file)
│   ├── migrations/               # SQL migration files
│   │   ├── 00001_create_profiles.sql
│   │   ├── 00002_create_symptoms.sql
│   │   ├── 00003_create_diseases.sql
│   │   ├── 00004_create_disease_symptoms.sql
│   │   ├── 00005_create_doctors.sql
│   │   ├── 00006_create_doctor_specialties.sql
│   │   ├── 00007_create_appointments.sql
│   │   ├── 00008_create_reviews.sql
│   │   ├── 00009_create_medical_history.sql
│   │   ├── 00010_create_diagnosis_history.sql
│   │   └── 00011_enable_rls_policies.sql
│   ├── seed.sql                  # Seed data (symptoms, diseases, doctors)
│   └── functions/                # Supabase Edge Functions
│       ├── gemini-symptom-check/
│       │   └── index.ts          # Gemini AI symptom analysis (primary prediction engine)
│       ├── predict-disease/
│       │   └── index.ts          # Rule-based disease prediction (fallback)
│       └── send-notification/
│           └── index.ts          # Push notification dispatcher
│
└── README.md
```

---

## Supabase Client Data Access Patterns

> **Note**: With Supabase, the mobile app queries the database **directly** through the Supabase JS client using PostgREST. There is no separate Express.js backend. Row Level Security (RLS) policies enforce access control at the database level.

### Authentication (Supabase Auth)

| Operation                | Supabase Client Method                                     |
| :----------------------- | :--------------------------------------------------------- |
| Register new user        | `supabase.auth.signUp({ email, password })`                |
| Login                    | `supabase.auth.signInWithPassword({ email, password })`    |
| Forgot password          | `supabase.auth.resetPasswordForEmail(email)`               |
| Get current session      | `supabase.auth.getSession()`                               |
| Listen to auth changes   | `supabase.auth.onAuthStateChange(callback)`                |
| Logout                   | `supabase.auth.signOut()`                                  |

### Data Queries (PostgREST via Supabase Client)

| Operation                             | Supabase Client Call                                                       |
| :------------------------------------ | :------------------------------------------------------------------------- |
| List all symptoms                     | `supabase.from('symptoms').select('*')`                                    |
| Search symptoms                       | `supabase.from('symptoms').select('*').ilike('name', '%query%')`           |
| Symptoms by body part                 | `supabase.from('symptoms').select('*').eq('body_part', part)`              |
| Get disease details                   | `supabase.from('diseases').select('*').eq('id', id).single()`              |
| Get disease-symptom mappings          | `supabase.from('disease_symptoms').select('*, diseases(*), symptoms(*)')` |
| List doctors (verified, by specialty) | `supabase.from('doctors').select('*, profiles(...)').eq('is_verified', true).ilike('specialty', name)` |
| Get recommended doctors (by specialties) | `supabase.from('doctors').select('*, profiles(...)').eq('is_verified', true).in('specialty', specialties)` |
| Get doctor detail                     | `supabase.from('doctors').select('*, profiles(...)').eq('id', id).single()` |
| Get doctor reviews                    | `supabase.from('reviews').select('*, profiles(first_name, last_name)').eq('doctor_id', doctorId)` |
| Submit review                         | `supabase.from('reviews').insert({ ... })`                                |
| Create appointment                    | `supabase.from('appointments').insert({ ... })`                           |
| Get user's appointments               | `supabase.from('appointments').select('*, doctors(*, profiles(*))').eq('patient_id', userId)` |
| Update appointment status             | `supabase.from('appointments').update({ status }).eq('id', id)`           |
| Get user profile                      | `supabase.from('profiles').select('*').eq('id', userId).single()`         |
| Update user profile                   | `supabase.from('profiles').update({ ... }).eq('id', userId)`              |
| Get medical history                   | `supabase.from('medical_history').select('*').eq('user_id', userId)`      |
| Upload profile image                  | `supabase.storage.from('patients').upload(path, file, { upsert: true })`  |
| Get profile image URL                 | `supabase.storage.from('patients').getPublicUrl(path)`                    |

### Edge Functions

| Function               | Endpoint                                 | Description                           |
| :---------------------- | :--------------------------------------- | :------------------------------------ |
| `gemini-symptom-check`  | `supabase.functions.invoke('gemini-symptom-check', { body: { symptoms, duration, additional_notes, images } })` | **Primary**: Gemini AI symptom analysis with multi-modal support (text + images). Returns structured predictions with confidence %, risk levels, and recommended specialties. |
| `predict-disease`       | `supabase.functions.invoke('predict-disease', { body: { symptom_ids } })` | **Fallback**: Rule-based prediction using weighted symptom matching |
| `send-notification`     | `supabase.functions.invoke('send-notification', { body: { ... } })`       | Dispatch push notifications       |

### Realtime Subscriptions

```typescript
// Subscribe to appointment status changes
supabase
  .channel('appointments')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'appointments',
    filter: `patient_id=eq.${userId}`,
  }, (payload) => {
    // Handle real-time update
  })
  .subscribe();
```

---

## Environment Variables / Configuration

### Supabase Project Config (`Frontend/constants/config.ts`)

```typescript
// ⚠️ Never expose the service_role key in the mobile app.
// Only the anon key is safe to include client-side.
export const SUPABASE_URL = 'https://wacebhnvymggciqpebsd.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ...';
```

### Supabase Client Init (`Frontend/lib/supabase.ts`)

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Supabase Edge Function Environment (set via Supabase Dashboard or CLI)

```env
# Set via: supabase secrets set KEY=VALUE
GEMINI_API_KEY=your_gemini_api_key          # Required for gemini-symptom-check
EXPO_PUSH_ACCESS_TOKEN=your_expo_push_token # Required for send-notification
```

---

## Development Setup

### Prerequisites
- Node.js v18+
- Supabase CLI (`npm install -g supabase`)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for emulators)
- Supabase account & project (https://supabase.com)
- Google Gemini API key (for symptom analysis)

### Supabase Setup

```bash
# Login to Supabase CLI
supabase login

# Link to your remote project
supabase link --project-ref your-project-ref

# Run migrations against remote database
supabase db push

# Or run locally with Docker
supabase start

# Seed the database
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql

# Load mock doctor data (Sri Lankan doctors)
# Run supabase/doctors.db in the Supabase SQL Editor

# Generate TypeScript types from your database schema
supabase gen types typescript --linked > Frontend/types/database.types.ts

# Deploy Edge Functions
supabase functions deploy gemini-symptom-check
supabase functions deploy predict-disease
supabase functions deploy send-notification

# Set Edge Function secrets
supabase secrets set GEMINI_API_KEY=your_key_here
```

### Frontend Setup

```bash
cd Frontend
npm install
npx expo start
```

---

## User Roles

| Role        | Description                                                              |
| :---------- | :----------------------------------------------------------------------- |
| **Patient** | Default role. Can check symptoms, view predictions, book doctors          |
| **Doctor**  | Can manage profile, view/manage appointments, see patient summaries       |
| **Admin**   | Can manage all users, doctors, symptoms, diseases (via Supabase Dashboard or admin RLS policies) |

> **Role enforcement**: User roles are stored in the `profiles.role` column and enforced via Supabase RLS policies. The `auth.uid()` function maps authenticated users to their profile row. Admin operations can also be done directly in the Supabase Dashboard.

---

## Design System

### Color Palette

| Token                | Value                         | Usage                                    |
| :------------------- | :---------------------------- | :--------------------------------------- |
| `primary`            | `#4A90D9`                     | Primary actions, headers                 |
| `primaryDark`        | `#2E6DB4`                     | Active/pressed states                    |
| `secondary`          | `#34C759`                     | Success, health positive                 |
| `accent`             | `#FF6B6B`                     | Alerts, emergency flags                  |
| `background`         | `#F5F7FA`                     | App background                           |
| `surface`            | `#FFFFFF`                     | Screen/card surfaces                     |
| `surfaceAlt`         | `#F3F4F6`                     | Alternate surface                        |
| `authCardBg`         | `#CDE7FA`                     | Auth/tab bar background, alt cards       |
| `black`              | `#1A1A1A`                     | Strong text, headings                    |
| `textPrimary`        | `#1A1A2E`                     | Body text                                |
| `textSecondary`      | `#6B7280`                     | Captions, hints                          |
| `textTertiary`       | `#4A5B69`                     | Muted subtitles, descriptions            |
| `border`             | `#E5E7EB`                     | Dividers, card borders                   |
| `cardLight`          | `#C8E8FE`                     | Light blue card backgrounds              |
| `buttonDark`         | `#111827`                     | Primary dark buttons, active filter chips|
| `iconDark`           | `#2E4A62`                     | Primary icons                            |
| `iconLight`          | `#88B0C8`                     | Secondary icons (chevrons, placeholders) |
| `searchBg`           | `#E6F4FE`                     | Search input background                  |
| `successBg/Text`     | `#E8F9EE` / `#34C759`        | Success state                            |
| `errorBg/Text`       | `#FFF0F0` / `#CC0000`        | Error state                              |
| `warningText`        | `#7A5F00`                     | Warning/disclaimer text                  |
| `dangerText`         | `#D32F2F`                     | Destructive actions                      |
| `starColor`          | `#F5A623`                     | Star rating gold                         |
| `fabBg`              | `#385F85`                     | FAB button background                    |
| `summaryBg/Text`     | `#E8F5E9` / `#2E7D32`        | Summary/confirmation cards               |

#### Opacity / Glass Helpers
| Token                  | Value                         | Usage                          |
| :--------------------- | :---------------------------- | :----------------------------- |
| `overlay`              | `rgba(0,0,0,0.5)`            | Modal overlays                 |
| `glassWhite`           | `rgba(255,255,255,0.6)`       | Glass-like white overlay       |
| `glassWhiteLight`      | `rgba(255,255,255,0.5)`       | Lighter glass effect           |
| `glassWhiteBright`     | `rgba(255,255,255,0.8)`       | Brighter glass effect          |
| `subtleBorder`         | `rgba(0,0,0,0.05)`           | Very subtle borders/dividers   |
| `subtleBorderMed`      | `rgba(0,0,0,0.1)`            | Slightly visible borders       |
| `chipBorder`           | `rgba(0,0,0,0.15)`           | Chip borders                   |

### Typography
- **Headings**: System Bold / Serif Bold (28–40px)
- **Body**: System Regular (15px, lineHeight 22)
- **Captions**: System Regular (12px, lineHeight 16)
- **h1Serif**: Serif font (36px, for greeting titles)

### Spacing
| Token | Value |
|:------|:------|
| `xs`  | 4     |
| `sm`  | 8     |
| `md`  | 16    |
| `lg`  | 24    |
| `xl`  | 32    |
| `xxl` | 48    |

### Border Radius
| Token  | Value |
|:-------|:------|
| `sm`   | 8     |
| `md`   | 12    |
| `lg`   | 16    |
| `xl`   | 24    |
| `full` | 9999  |

### Shadow Presets
- `card`: Subtle (elevation 2, opacity 0.05)
- `fab`: Strong (elevation 8, opacity 0.3)
- `elevated`: Medium (elevation 5, opacity 0.25)

### UI Components

| Component                | Description                                                                    |
| :----------------------- | :----------------------------------------------------------------------------- |
| **Bottom Tabs**          | 5-tab layout: Home, Doctors, Check (center brain FAB), History, Settings       |
| **TopBar**               | Unified top bar (← arrow, centered "MediGuide" title, profile avatar)          |
| **Cards**                | Light-blue (`#C8E8FE`) rounded cards with semi-transparent white inner elements|
| **Filter Chips**         | Pill-shaped specialty filters (dark active, light-blue inactive)               |
| **Featured Card**        | Large doctor card with image, rating badge, specialty, bio, stats, book button  |
| **Compact Card**         | Row-style card with circular avatar, details, and small action button           |
| **RecommendedDoctors**   | Post-analysis doctor list fetched by specialty, with "Load More" pagination     |
| **Global Styles**        | 1400+ line shared `StyleSheet` in `constants/globalStyles.ts`                  |

---

## Key Development Patterns

1. **Direct DB Queries + RLS**: The app queries Supabase directly using the JS client. RLS policies enforce authorization — no custom backend middleware needed.
2. **Supabase Auth Integration**: `AuthContext` wraps the app with `onAuthStateChange` listener. Auth state automatically manages session tokens, refresh, and persistence via AsyncStorage. The `on_auth_user_created` trigger auto-creates a profile row on signup. The `signUp` function supports full profile metadata (name, phone, DOB, gender, blood group, height, weight, BMI, profile image) in a single registration flow.
3. **Gemini AI Integration**: The symptom checker uses `geminiService.ts` → `gemini-symptom-check` Edge Function → Google Gemini API. The API key stays server-side (never exposed in the mobile app). The Edge Function verifies the user's JWT, fetches their profile for context (age, gender), and sends a structured prompt to Gemini. Supports multi-modal input (text symptoms + base64-encoded images). Returns structured JSON with conditions, confidence %, risk levels, and recommended specialties.
4. **Idempotent Triggers**: All `CREATE TRIGGER` statements are preceded by `DROP TRIGGER IF EXISTS` to prevent "already exists" errors when migrations are re-run.
5. **Service Layer**: Each domain (symptoms, doctors, appointments, AI) has a dedicated service file that wraps Supabase client calls, keeping components clean.
6. **TypeScript Types from DB**: Run `supabase gen types typescript` to auto-generate type-safe database types. All service functions use these types.
7. **Edge Functions for Business Logic**: Complex logic (Gemini AI analysis, rule-based prediction, notification dispatch) lives in Supabase Edge Functions (Deno/TypeScript), keeping the client lightweight.
8. **Realtime for Live Updates**: Appointment status changes use Supabase Realtime Postgres Changes subscriptions.
9. **Storage for Files**: Profile images stored in Supabase Storage `patients` bucket with appropriate access policies. Upload uses `upsert: true` for idempotent overwrites.
10. **Error Handling**: Supabase client returns `{ data, error }` — all service functions check and handle errors consistently. Gemini service includes try/catch with descriptive error messages.
11. **Context Providers**: `AuthContext` for auth state (signIn, signUp, signOut, refreshProfile); `HealthContext` for symptom/prediction state.
12. **Unified TopBar Component**: All screens use a shared `TopBar` component (`components/TopBar.tsx`) for consistent header styling — back arrow, centered "MediGuide" title, and profile avatar.
13. **Global Styles System**: `constants/globalStyles.ts` is a massive shared StyleSheet (1400+ lines) providing reusable styles across all screens — layouts, cards, rows, buttons, form elements, avatars, etc. Screens import `globalStyles` instead of defining local styles.
14. **Mock Data Fallback**: The `doctors.tsx` and `history.tsx` screens include hardcoded mock data arrays that are displayed when no real data is returned from Supabase, enabling UI development and demos without a live backend.
15. **Settings Sub-Routes**: Settings is a dedicated route group (`app/settings/`) with sub-screens for profile editing, notification preferences, and security settings. Each uses the shared `TopBar` and `globalStyles`.
16. **Post-Analysis Doctor Recommendations**: After Gemini AI returns predictions with `recommended_specialties`, the `RecommendedDoctors` component fetches matching verified doctors and displays them with "Load More" pagination.
