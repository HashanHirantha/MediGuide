/**
 * ==========================================================
 * MediGuide Admin Dashboard - Shared Types
 * ==========================================================
 * Shared interfaces used throughout the Admin Dashboard.
 * These can later be extended to match the Supabase schema.
 * ==========================================================
 */

/* ===========================================
   Common Types
=========================================== */

export type UserRole =
  | "admin"
  | "patient"
  | "doctor";

export type AccountStatus =
  | "active"
  | "inactive"
  | "blocked"
  | "pending";

export type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected";

export type Gender =
  | "Male"
  | "Female"
  | "Other";

export type RiskLevel =
  | "Low"
  | "Moderate"
  | "High"
  | "Critical";

/* ===========================================
   Dashboard Statistics
=========================================== */

export interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  totalPredictions: number;

  activeUsers: number;
  pendingDoctors: number;
  todayAppointments: number;
  cancelledAppointments: number;
}

/* ===========================================
   Admin User
=========================================== */

export interface AdminUser {
  id: string;

  fullName: string;

  email: string;

  profileImage?: string;

  role: UserRole;

  status: AccountStatus;

  createdAt: string;
}

/* ===========================================
   Patient
=========================================== */

export interface Patient {
  id: string;

  fullName: string;

  email: string;

  phone?: string;

  age: number;

  gender: Gender;

  bloodGroup?: string;

  bmi?: number;

  profileImage?: string;

  status: AccountStatus;

  joinedDate: string;
}

/* ===========================================
   Doctor
=========================================== */

export interface Doctor {
  id: string;

  fullName: string;

  email: string;

  phone?: string;

  specialty: string;

  hospital: string;

  qualification: string;

  experience: number;

  consultationFee: number;

  rating: number;

  totalPatients: number;

  availableDays: string[];

  availableFrom: string;

  availableTo: string;

  profileImage?: string;

  verificationStatus: VerificationStatus;

  accountStatus: AccountStatus;

  createdAt: string;
}

/* ===========================================
   Appointment
=========================================== */

export interface Appointment {
  id: string;

  patientName: string;

  doctorName: string;

  specialty: string;

  appointmentDate: string;

  appointmentTime: string;

  status:
    | "Pending"
    | "Confirmed"
    | "Completed"
    | "Cancelled";

  createdAt: string;
}

/* ===========================================
   Symptom
=========================================== */

export interface Symptom {
  id: string;

  name: string;

  category: string;

  severity: number;

  description?: string;

  createdAt: string;
}

/* ===========================================
   Disease
=========================================== */

export interface Disease {
  id: string;

  name: string;

  description: string;

  riskLevel: RiskLevel;

  recommendedSpecialist: string;

  symptoms: string[];

  createdAt: string;
}

/* ===========================================
   Reviews
=========================================== */

export interface DoctorReview {
  id: string;

  patientName: string;

  doctorName: string;

  rating: number;

  comment: string;

  createdAt: string;
}

/* ===========================================
   Dashboard Activity
=========================================== */

export interface RecentActivity {
  id: string;

  title: string;

  description: string;

  time: string;

  type:
    | "success"
    | "warning"
    | "danger"
    | "info";

  avatar?: string;

  unread: boolean;
}

/* ===========================================
   Quick Action
=========================================== */

export interface QuickAction {
  id: string;

  title: string;

  description?: string;

  icon: string;

  badge?: string;
}

/* ===========================================
   Dashboard Card
=========================================== */

export interface DashboardCardData {
  title: string;

  value: number | string;

  subtitle?: string;

  icon: string;

  trend?: number;

  backgroundColor?: string;

  iconColor?: string;
}

/* ===========================================
   Analytics
=========================================== */

export interface MonthlyAnalytics {
  month: string;

  users: number;

  doctors: number;

  appointments: number;

  predictions: number;
}

export interface DiseaseAnalytics {
  disease: string;

  count: number;
}

export interface DoctorAnalytics {
  doctorName: string;

  patients: number;

  rating: number;
}

/* ===========================================
   Notification
=========================================== */

export interface NotificationItem {
  id: string;

  title: string;

  message: string;

  isRead: boolean;

  createdAt: string;
}

/* ===========================================
   Table Pagination
=========================================== */

export interface Pagination {
  page: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;
}

/* ===========================================
   API Response
=========================================== */

export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

/* ===========================================
   Filters
=========================================== */

export interface UserFilter {
  role?: UserRole;

  status?: AccountStatus;

  search?: string;
}

export interface DoctorFilter {
  specialty?: string;

  verificationStatus?: VerificationStatus;

  accountStatus?: AccountStatus;

  search?: string;
}
