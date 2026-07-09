import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscribeRequest {
  audioBase64: string;
  mimeType: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('[Transcribe] GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify auth
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

    // Decode JWT to verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { audioBase64, mimeType }: TranscribeRequest = await req.json();

    if (!audioBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: 'audioBase64 and mimeType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Transcribe] Received audio format: ${mimeType}`);

    const prompt = `You are a medical symptom extraction AI. Listen to the provided audio clip and extract any medical symptoms mentioned by the patient. 

RULES:
- Return EXACTLY a JSON array of strings representing the symptoms. 
- Example: ["Headache", "Fever", "Stomach ache"]
- Keep symptoms concise (1-3 words each).
- Ignore casual conversation, filler words, or non-medical context.
- If no symptoms are found, it is unintelligible, or it's just background noise, return an empty array [].
- DO NOT wrap the output in markdown blocks or backticks. Only output valid JSON array syntax.`;

    // ─── Build multimodal parts array ────────────────────────────
    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: audioBase64,
        },
      }
    ];

    // Call Gemini API (1.5 Pro or Flash can do audio)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('[Transcribe] Gemini API error:', geminiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${geminiResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error('[Transcribe] No candidates in Gemini response:', JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({ error: 'AI returned an empty response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const textContent = geminiData.candidates[0].content?.parts?.[0]?.text;
    
    if (!textContent) {
      console.error('[Transcribe] No text content found in Gemini response');
      return new Response(
        JSON.stringify({ symptoms: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedSymptoms: string[] = [];
    try {
      // Clean up the response just in case
      let cleanText = textContent.trim();
      if (cleanText.startsWith('\`\`\`json')) {
        cleanText = cleanText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      }
      extractedSymptoms = JSON.parse(cleanText);
      
      if (!Array.isArray(extractedSymptoms)) {
        throw new Error('Response is not an array');
      }
    } catch (e: any) {
      console.error('[Transcribe] Failed to parse JSON from AI:', textContent, e);
      // Fallback
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI output' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Transcribe] Extracted symptoms:', extractedSymptoms.join(', '));

    return new Response(
      JSON.stringify({ symptoms: extractedSymptoms }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('[Transcribe] Internal error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
