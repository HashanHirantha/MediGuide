/**
 * ==========================================================
 * MediGuide Admin Dashboard Service
 * ==========================================================
 * Temporary service using mock data.
 * Replace these implementations with Supabase queries later.
 * ==========================================================
 */

import {
  DashboardStats,
  DashboardCardData,
  QuickAction,
  RecentActivity,
  Patient,
  Doctor,
  Appointment,
  Symptom,
  Disease,
} from "@/types/admin";

/* ==========================================================
   Dashboard
========================================================== */

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return {
    totalUsers: 5421,
    totalDoctors: 184,
    totalAppointments: 156,
    totalPredictions: 6842,

    activeUsers: 5210,
    pendingDoctors: 12,
    todayAppointments: 48,
    cancelledAppointments: 5,
  };
};

export const getDashboardCards = async (): Promise<
  DashboardCardData[]
> => {
  return [
    {
      title: "Total Users",
      value: 5421,
      subtitle: "Registered Patients",
      icon: "people",
      trend: 12,
      backgroundColor: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      title: "Doctors",
      value: 184,
      subtitle: "Verified Doctors",
      icon: "medkit",
      trend: 8,
      backgroundColor: "#CCFBF1",
      iconColor: "#14B8A6",
    },
    {
      title: "Appointments",
      value: 156,
      subtitle: "Today's Bookings",
      icon: "calendar",
      trend: 6,
      backgroundColor: "#FEF3C7",
      iconColor: "#F59E0B",
    },
    {
      title: "Predictions",
      value: 6842,
      subtitle: "AI Predictions",
      icon: "pulse",
      trend: 15,
      backgroundColor: "#F3E8FF",
      iconColor: "#8B5CF6",
    },
  ];
};

export const getQuickActions = async (): Promise<
  QuickAction[]
> => {
  return [
    {
      id: "1",
      title: "Verify Doctors",
      description: "Approve pending registrations",
      icon: "shield-checkmark",
      badge: "12",
    },
    {
      id: "2",
      title: "Manage Users",
      description: "Patient accounts",
      icon: "people",
    },
    {
      id: "3",
      title: "Manage Diseases",
      description: "Disease database",
      icon: "fitness",
    },
    {
      id: "4",
      title: "Manage Symptoms",
      description: "Symptoms database",
      icon: "body",
    },
  ];
};

export const getRecentActivities = async (): Promise<
  RecentActivity[]
> => {
  return [
    {
      id: "1",
      title: "Doctor Approved",
      description:
        "Dr. Nimal Perera was approved successfully.",
      time: "2 min ago",
      type: "success",
      unread: true,
    },
    {
      id: "2",
      title: "New Patient",
      description:
        "A new patient registered.",
      time: "10 min ago",
      type: "info",
      unread: false,
    },
    {
      id: "3",
      title: "Appointment Cancelled",
      description:
        "Patient cancelled today's appointment.",
      time: "22 min ago",
      type: "warning",
      unread: false,
    },
    {
      id: "4",
      title: "User Blocked",
      description:
        "Administrator blocked a patient account.",
      time: "1 hour ago",
      type: "danger",
      unread: false,
    },
  ];
};

/* ==========================================================
   Users
========================================================== */

export const getUsers = async (): Promise<Patient[]> => {
  return [];
};

/* ==========================================================
   Doctors
========================================================== */

export const getDoctors = async (): Promise<Doctor[]> => {
  return [];
};

/* ==========================================================
   Appointments
========================================================== */

export const getAppointments = async (): Promise<
  Appointment[]
> => {
  return [];
};

/* ==========================================================
   Symptoms
========================================================== */

export const getSymptoms = async (): Promise<Symptom[]> => {
  return [];
};

/* ==========================================================
   Diseases
========================================================== */

export const getDiseases = async (): Promise<Disease[]> => {
  return [];
};

/* ==========================================================
   CRUD Methods
========================================================== */

export const addDisease = async (
  disease: Disease
): Promise<boolean> => {
  console.log("Add Disease", disease);
  return true;
};

export const updateDisease = async (
  disease: Disease
): Promise<boolean> => {
  console.log("Update Disease", disease);
  return true;
};

export const deleteDisease = async (
  id: string
): Promise<boolean> => {
  console.log("Delete Disease", id);
  return true;
};

export const addSymptom = async (
  symptom: Symptom
): Promise<boolean> => {
  console.log("Add Symptom", symptom);
  return true;
};

export const updateSymptom = async (
  symptom: Symptom
): Promise<boolean> => {
  console.log("Update Symptom", symptom);
  return true;
};

export const deleteSymptom = async (
  id: string
): Promise<boolean> => {
  console.log("Delete Symptom", id);
  return true;
};

export const approveDoctor = async (
  doctorId: string
): Promise<boolean> => {
  console.log("Approve Doctor", doctorId);
  return true;
};

export const rejectDoctor = async (
  doctorId: string
): Promise<boolean> => {
  console.log("Reject Doctor", doctorId);
  return true;
};

export const blockUser = async (
  userId: string
): Promise<boolean> => {
  console.log("Block User", userId);
  return true;
};

export const deleteUser = async (
  userId: string
): Promise<boolean> => {
  console.log("Delete User", userId);
  return true;
};
