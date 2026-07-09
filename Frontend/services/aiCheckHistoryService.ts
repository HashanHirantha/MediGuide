import { supabase } from '../lib/supabase';
import { PredictionResponse } from './geminiService';

export interface AiCheckHistoryEntry {
  id: string;
  user_id: string;
  symptoms: string[];
  duration: string;
  additional_notes?: string;
  overall_risk: string;
  conditions: {
    name: string;
    possibility_percent: number;
    icon_name: string;
    risk_level: string;
  }[];
  recommendation?: string;
  recommended_specialist?: string;
  recommended_specialties: string[];
  created_at: string;
  is_accurate?: boolean;
  user_feedback?: string;
}

/**
 * Save an AI symptom check result to the patient's history.
 */
export async function saveAiCheckHistory(
  userId: string,
  symptoms: string[],
  duration: string,
  prediction: PredictionResponse,
  additionalNotes?: string
): Promise<{ data?: AiCheckHistoryEntry; error: string | null }> {
  const { data, error } = await supabase.from('ai_check_history').insert({
    user_id: userId,
    symptoms,
    duration,
    additional_notes: additionalNotes || null,
    overall_risk: prediction.overall_risk,
    conditions: prediction.conditions,
    recommendation: prediction.recommendation || null,
    recommended_specialist: prediction.recommended_specialist || null,
    recommended_specialties: prediction.recommended_specialties ?? [],
  }).select().single();

  if (error) {
    console.error('[AiCheckHistory] Save error:', error.message);
    return { error: error.message };
  }

  console.log('[AiCheckHistory] Saved successfully for user:', userId);
  return { data: data as AiCheckHistoryEntry, error: null };
}

/**
 * Update user feedback for an AI check.
 */
export async function updateAiCheckFeedback(
  entryId: string,
  isAccurate: boolean,
  userFeedback?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('ai_check_history')
    .update({
      is_accurate: isAccurate,
      user_feedback: userFeedback || null,
    })
    .eq('id', entryId);

  if (error) {
    console.error('[AiCheckHistory] Update feedback error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Fetch all AI check history entries for a user, newest first.
 */
export async function getAiCheckHistory(
  userId: string
): Promise<{ data: AiCheckHistoryEntry[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('ai_check_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[AiCheckHistory] Fetch error:', error.message);
    return { data: null, error: error.message };
  }

  return { data: data as AiCheckHistoryEntry[], error: null };
}

/**
 * Delete a specific AI check history entry.
 */
export async function deleteAiCheckHistory(
  entryId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('ai_check_history')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('[AiCheckHistory] Delete error:', error.message);
    return { error: error.message };
  }

  return { error: null };
}
