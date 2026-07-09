import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageAttachment {
  base64: string;
  mime_type: string;
}

interface SymptomCheckRequest {
  symptoms: string[];
  duration: string;
  additional_notes?: string;
  images?: ImageAttachment[];
  language?: string;
}

interface PredictionCondition {
  name: string;
  possibility_percent: number;
  icon_name: string;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
}

interface PredictionResponse {
  conditions: PredictionCondition[];
  recommendation: string;
  overall_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommended_specialist: string;
  recommended_specialties: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('[GeminiCheck] GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify auth and get user profile
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Decode JWT to get user ID
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[GeminiCheck] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[GeminiCheck] Authenticated user:', user.id);

    // Fetch user profile for context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, date_of_birth, gender, blood_group, height_cm, weight_kg, bmi')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[GeminiCheck] Profile fetch error:', profileError.message);
    }

    // Fetch user medical history
    const { data: medicalHistory, error: historyError } = await supabase
      .from('medical_history')
      .select('condition, status, medications, allergies')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (historyError) {
      console.error('[GeminiCheck] Medical history fetch error:', historyError.message);
    }

    // ─── Fetch available doctor specialties from DB ──────────────
    const { data: specialtyRows } = await supabase
      .from('doctors')
      .select('specialty')
      .eq('is_verified', true);

    const availableSpecialties = [
      ...new Set((specialtyRows ?? []).map((r: any) => r.specialty).filter(Boolean)),
    ];
    console.log('[GeminiCheck] Available specialties:', availableSpecialties.join(', '));

    // Parse request body
    const { symptoms, duration, additional_notes, images, language }: SymptomCheckRequest = await req.json();

    if (!symptoms || symptoms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one symptom is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[GeminiCheck] Symptoms:', symptoms.join(', '));
    console.log('[GeminiCheck] Duration:', duration);
    console.log('[GeminiCheck] Images attached:', images?.length ?? 0);

    // Calculate age from date_of_birth
    let age = 'Unknown';
    if (profile?.date_of_birth) {
      const dob = new Date(profile.date_of_birth);
      const now = new Date();
      const years = Math.floor((now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      age = `${years} years old`;
    }

    // Build medical history string
    let medicalHistoryContext = 'No active medical history provided.';
    if (medicalHistory && medicalHistory.length > 0) {
      medicalHistoryContext = medicalHistory.map((mh: any) => {
        let entry = `- ${mh.condition}`;
        if (mh.medications && mh.medications.length > 0) entry += ` (Meds: ${mh.medications.join(', ')})`;
        if (mh.allergies && mh.allergies.length > 0) entry += ` (Allergies: ${mh.allergies.join(', ')})`;
        return entry;
      }).join('\n');
    }

    // Build the patient context string
    const patientContext = [
      `Age: ${age}`,
      `Gender: ${profile?.gender || 'Not specified'}`,
      `Blood Group: ${profile?.blood_group || 'Not specified'}`,
      profile?.height_cm ? `Height: ${profile.height_cm} cm` : null,
      profile?.weight_kg ? `Weight: ${profile.weight_kg} kg` : null,
      profile?.bmi ? `BMI: ${profile.bmi}` : null,
      `\nMEDICAL HISTORY:\n${medicalHistoryContext}`,
    ].filter(Boolean).join('\n');

    // ─── Build the specialty constraint ──────────────────────────
    const specialtyConstraint = availableSpecialties.length > 0
      ? `\nAVAILABLE DOCTOR SPECIALTIES IN OUR SYSTEM:\n${availableSpecialties.join(', ')}\n\nIMPORTANT: "recommended_specialties" array MUST ONLY contain values from the above list. Pick 1-3 most relevant specialties.`
      : '';

    // ─── Build image context for prompt ──────────────────────────
    const imageContext = images && images.length > 0
      ? `\nATTACHED MEDICAL REPORTS/IMAGES:\nThe patient has attached ${images.length} image(s) of medical reports, lab results, prescriptions, or related documents. Carefully analyze any visible medical data (blood test values, diagnostic findings, medication names, X-ray observations, etc.) and incorporate the findings into your assessment. Mention key findings from the reports in your recommendation.`
      : '';

    // Construct the Gemini prompt
    const prompt = `You are MediGuide AI, a medical symptom analysis assistant. Analyze the following patient's symptoms and provide a preliminary assessment.

IMPORTANT DISCLAIMERS:
- This is NOT a medical diagnosis
- Always recommend consulting a healthcare professional
- Be conservative with risk assessments
- If the user input contains completely irrelevant text (like a math problem, casual chat, etc.) and no medical symptoms, return exactly this JSON: { "error": "NOT_A_SYMPTOM", "message": "Please input your symptom" }

PATIENT PROFILE:
${patientContext}

REPORTED SYMPTOMS:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

DURATION: ${duration}
${additional_notes ? `ADDITIONAL NOTES: ${additional_notes}` : ''}
${imageContext}
${specialtyConstraint}
${language ? `\nCRITICAL LANGUAGE REQUIREMENT:\nYou MUST output the 'name', 'recommendation', 'recommended_specialist', and 'recommended_specialties' fields in ${language} language. The JSON keys themselves and the risk level enumerations ("low", "HIGH", etc.) MUST remain in English.` : ''}

Respond ONLY with valid JSON in exactly this format (no markdown, no code fences, no extra text):
{
  "conditions": [
    {
      "name": "Condition Name",
      "possibility_percent": 65,
      "icon_name": "activity",
      "risk_level": "low"
    }
  ],
  "recommendation": "A brief, helpful recommendation for the patient including when to see a doctor.",
  "overall_risk": "LOW",
  "recommended_specialist": "General Practitioner",
  "recommended_specialties": ["General Medicine"]
}

RULES:
- List 2-4 possible conditions, ordered by likelihood
- possibility_percent should be realistic (don't exceed 85% without very strong evidence)
- icon_name must be one of: "activity", "heart", "thermometer", "brain", "eye", "wind", "zap", "shield", "alert-triangle", "clipboard" (these are Feather icon names)
- risk_level must be one of: "low", "moderate", "high", "critical"  
- overall_risk must be one of: "LOW", "MODERATE", "HIGH", "CRITICAL"
- recommended_specialist should be a readable specialist title for display
- recommended_specialties must be an array of 1-3 specialty names${availableSpecialties.length > 0 ? ' chosen ONLY from the AVAILABLE DOCTOR SPECIALTIES list above' : ''}
- Keep recommendation under 200 characters
- If medical report images are attached, reference key findings from them
- Explicitly consider comorbidities between the patient's existing medical history and the current reported symptoms.
- Carefully calibrate possibility_percent. If symptoms align closely with known conditions from the medical history or likely comorbidities, adjust confidence appropriately.
- Be medically responsible and conservative`;

    console.log('[GeminiCheck] Calling Gemini API...');

    // ─── Build multimodal parts array ────────────────────────────
    const parts: any[] = [{ text: prompt }];

    // Add images as inline data for multimodal analysis
    if (images && images.length > 0) {
      for (const img of images.slice(0, 3)) {
        parts.push({
          inlineData: {
            mimeType: img.mime_type,
            data: img.base64,
          },
        });
      }
      console.log('[GeminiCheck] Added', Math.min(images.length, 3), 'images to Gemini request');
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[GeminiCheck] Gemini API error:', geminiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${geminiResponse.status}`, details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    console.log('[GeminiCheck] Gemini finishReason:', geminiData?.candidates?.[0]?.finishReason);
    console.log('[GeminiCheck] Gemini response received');

    // Extract text from Gemini response
    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error('[GeminiCheck] No text in Gemini response:', JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({ error: 'No response from Gemini AI' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response (strip markdown fences if present)
    let prediction: PredictionResponse;
    try {
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      prediction = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[GeminiCheck] JSON parse error:', parseError, 'Raw text:', responseText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle NOT_A_SYMPTOM case
    if ((prediction as any).error === 'NOT_A_SYMPTOM') {
      return new Response(
        JSON.stringify({ error: 'NOT_A_SYMPTOM', message: (prediction as any).message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (!prediction.conditions || !Array.isArray(prediction.conditions)) {
      console.error('[GeminiCheck] Invalid response structure:', prediction);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response structure' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure recommended_specialties is always an array
    if (!Array.isArray(prediction.recommended_specialties)) {
      prediction.recommended_specialties = prediction.recommended_specialist
        ? [prediction.recommended_specialist]
        : [];
    }

    console.log('[GeminiCheck] Successfully parsed prediction with', prediction.conditions.length, 'conditions');
    console.log('[GeminiCheck] Overall risk:', prediction.overall_risk);
    console.log('[GeminiCheck] Recommended specialties:', prediction.recommended_specialties.join(', '));

    return new Response(
      JSON.stringify({
        prediction,
        patient_context: {
          age,
          gender: profile?.gender || null,
          symptoms_count: symptoms.length,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GeminiCheck] Unhandled error:', (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
