import { supabase } from '../lib/supabase';

/**
 * Run disease prediction based on selected symptom IDs.
 * Attempts Edge Function first; falls back to client-side rule-based logic.
 */
export async function predictDisease(symptomIds: number[]): Promise<{
  data: Array<{ disease_id: number; disease_name: string; confidence: number; specialty: string }> | null;
  error: string | null;
}> {
  // Try Edge Function first
  const { data: fnData, error: fnError } = await supabase.functions.invoke('predict-disease', {
    body: { symptom_ids: symptomIds },
  });

  if (!fnError && fnData) {
    return { data: fnData.predictions, error: null };
  }

  // Fallback: client-side rule-based prediction
  return clientSidePrediction(symptomIds);
}

/**
 * Client-side fallback prediction using disease_symptoms weights.
 */
async function clientSidePrediction(symptomIds: number[]) {
  if (symptomIds.length === 0) return { data: [], error: null };

  // Fetch disease-symptom mappings for the given symptoms
  const { data: mappings, error } = await supabase
    .from('disease_symptoms')
    .select('disease_id, weight, is_primary, diseases(id, name, specialty, symptoms_required)')
    .in('symptom_id', symptomIds);

  if (error) return { data: null, error: error.message };

  // Calculate confidence scores
  const scores: Record<number, { name: string; specialty: string; score: number; total: number; required: number }> = {};

  for (const m of mappings ?? []) {
    const disease = (m as any).diseases;
    if (!disease) continue;
    const id = m.disease_id;
    if (!scores[id]) {
      scores[id] = { name: disease.name, specialty: disease.specialty, score: 0, total: 0, required: disease.symptoms_required ?? 1 };
    }
    scores[id].score += m.weight * (m.is_primary ? 1.5 : 1);
    scores[id].total += 1;
  }

  // Normalise to percentage and filter
  const predictions = Object.entries(scores)
    .filter(([, v]) => v.total >= v.required)
    .map(([id, v]) => ({
      disease_id: Number(id),
      disease_name: v.name,
      specialty: v.specialty,
      confidence: Math.min(Math.round((v.score / (symptomIds.length * 5)) * 100), 99),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return { data: predictions, error: null };
}

/**
 * Get full disease details by ID.
 */
export async function getDiseaseById(id: number) {
  const { data, error } = await supabase
    .from('diseases')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * Save a diagnosis session to history.
 */
export async function saveDiagnosisHistory(
  userId: string,
  symptomIds: number[],
  predictions: any[]
) {
  const top = predictions[0];
  const { error } = await supabase.from('diagnosis_history').insert({
    user_id: userId,
    symptoms: symptomIds,
    predicted_disease_id: top?.disease_id ?? null,
    confidence_score: top?.confidence ?? 0,
    all_predictions: predictions,
  });
  return { error };
}

/* ==========================================================
   Admin CRUD Operations
========================================================== */

export async function getDiseases() {
  return supabase.from('diseases').select('*').order('name');
}

export async function addDisease(
  name: string,
  description: string,
  specialty: string,
  severityLevel: string = 'low',
  symptomsRequired: number = 1
) {
  return supabase
    .from('diseases')
    .insert({ 
      name, 
      description, 
      specialty, 
      severity: severityLevel, 
      symptoms_required: symptomsRequired 
    })
    .select();
}

export async function updateDisease(
  id: number,
  name: string,
  description: string,
  specialty: string,
  severityLevel: string,
  symptomsRequired: number
) {
  return supabase
    .from('diseases')
    .update({ 
      name, 
      description, 
      specialty, 
      severity: severityLevel, 
      symptoms_required: symptomsRequired 
    })
    .eq('id', id);
}

export async function deleteDisease(id: number) {
  return supabase.from('diseases').delete().eq('id', id);
}
