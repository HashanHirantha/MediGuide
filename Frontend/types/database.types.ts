/**
 * Auto-generated Supabase database types.
 *
 * ⚠️ This file should be regenerated whenever the database schema changes:
 *   supabase gen types typescript --linked > Frontend/types/database.types.ts
 *
 * Do NOT manually edit this file.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          blood_group: string | null;
          profile_image: string | null;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      symptoms: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          body_part: string;
          severity_level: string;
          icon: string | null;
          is_emergency: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['symptoms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['symptoms']['Insert']>;
      };
      diseases: {
        Row: {
          id: number;
          name: string;
          description: string;
          specialty: string;
          severity: string;
          precautions: string[] | null;
          symptoms_required: number;
          is_chronic: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['diseases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['diseases']['Insert']>;
      };
      disease_symptoms: {
        Row: {
          id: number;
          disease_id: number;
          symptom_id: number;
          weight: number;
          is_primary: boolean;
        };
        Insert: Omit<Database['public']['Tables']['disease_symptoms']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['disease_symptoms']['Insert']>;
      };
      doctors: {
        Row: {
          id: string;
          user_id: string;
          registration_no: string;
          specialty: string;
          qualification: string;
          experience_years: number;
          hospital_name: string | null;
          hospital_address: string | null;
          latitude: number | null;
          longitude: number | null;
          consultation_fee: number;
          available_days: string | null;
          available_from: string | null;
          available_to: string | null;
          average_rating: number;
          total_reviews: number;
          is_verified: boolean;
          bio: string | null;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['doctors']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['doctors']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          disease_id: number | null;
          appointment_date: string;
          appointment_time: string;
          status: string;
          symptoms_text: string | null;
          notes: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      reviews: {
        Row: {
          id: number;
          patient_id: string;
          doctor_id: string;
          appointment_id: string | null;
          rating: number;
          comment: string | null;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      medical_history: {
        Row: {
          id: number;
          user_id: string;
          condition: string;
          diagnosed_date: string | null;
          status: string;
          medications: string[] | null;
          allergies: string[] | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medical_history']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['medical_history']['Insert']>;
      };
      diagnosis_history: {
        Row: {
          id: number;
          user_id: string;
          symptoms: number[];
          predicted_disease_id: number | null;
          confidence_score: number;
          all_predictions: any;
          feedback: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['diagnosis_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['diagnosis_history']['Insert']>;
      };
      doctor_specialties: {
        Row: {
          id: number;
          disease_id: number;
          specialty: string;
          priority: number;
        };
        Insert: Omit<Database['public']['Tables']['doctor_specialties']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['doctor_specialties']['Insert']>;
      };
      articles: {
        Row: {
          id: string;
          title: string;
          summary: string;
          content: string;
          category: string;
          image_url: string | null;
          tags: string[];
          read_time_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['articles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['articles']['Insert']>;
      };
      user_article_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_article_bookmarks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_article_bookmarks']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
};
