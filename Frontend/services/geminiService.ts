import { supabase } from '../lib/supabase';

// ─── Types ──────────────────────────────────────────────────

export interface PredictionCondition {
  name: string;
  possibility_percent: number;
  icon_name: string;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
}

export interface PredictionResponse {
  conditions: PredictionCondition[];
  recommendation: string;
  overall_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommended_specialist: string;
}

export interface SymptomCheckResult {
  prediction: PredictionResponse;
  patient_context: {
    age: string;
    gender: string | null;
    symptoms_count: number;
  };
}

// ─── Service ────────────────────────────────────────────────

/**
 * Analyze symptoms using the Gemini AI via secure Edge Function.
 * The API key stays server-side — only the JWT is sent from the client.
 *
 * @param symptoms - Array of symptom names (e.g., ["Headache", "Fatigue"])
 * @param duration - How long symptoms have lasted (e.g., "3-5 days")
 * @param additionalNotes - Optional extra context from the user
 * @returns Structured prediction result or error
 */
export async function analyzeSymptoms(
  symptoms: string[],
  duration: string,
  additionalNotes?: string
): Promise<{ data: SymptomCheckResult | null; error: string | null }> {
  console.log('[GeminiService] Calling gemini-symptom-check with', symptoms.length, 'symptoms');
  console.log('[GeminiService] Symptoms:', symptoms.join(', '));
  console.log('[GeminiService] Duration:', duration);

  try {
    const { data, error } = await supabase.functions.invoke('gemini-symptom-check', {
      body: {
        symptoms,
        duration,
        additional_notes: additionalNotes,
      },
    });

    if (error) {
      console.error('[GeminiService] Edge function invocation error:', error.message);
      return { data: null, error: `AI analysis failed: ${error.message}` };
    }

    if (data?.error) {
      console.error('[GeminiService] Server returned error:', data.error);
      return { data: null, error: data.error };
    }

    if (!data?.prediction) {
      console.error('[GeminiService] No prediction in response:', data);
      return { data: null, error: 'No prediction received from AI' };
    }

    console.log('[GeminiService] Prediction received:', data.prediction.conditions.length, 'conditions');
    console.log('[GeminiService] Overall risk:', data.prediction.overall_risk);

    return { data: data as SymptomCheckResult, error: null };
  } catch (e: any) {
    console.error('[GeminiService] Exception:', e?.message || e);
    return { data: null, error: `Network error: ${e?.message || 'Unable to reach AI service'}` };
  }
}

/**
 * Get risk level color for UI rendering.
 */
export function getRiskColor(risk: string): string {
  switch (risk?.toUpperCase()) {
    case 'LOW': return '#34C759';
    case 'MODERATE': return '#FF9500';
    case 'HIGH': return '#FF6B6B';
    case 'CRITICAL': return '#FF3B30';
    default: return '#6B7280';
  }
}

/**
 * Get risk level background color (softer, for badges).
 */
export function getRiskBgColor(risk: string): string {
  switch (risk?.toUpperCase()) {
    case 'LOW': return '#E8F9EE';
    case 'MODERATE': return '#FFF3E0';
    case 'HIGH': return '#FFE8E8';
    case 'CRITICAL': return '#FFE0E0';
    default: return '#F3F4F6';
  }
}
