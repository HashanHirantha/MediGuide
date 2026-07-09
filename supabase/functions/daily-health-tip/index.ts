import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    
    let supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    if (host && host.includes('localhost')) {
        supabaseUrl = `http://${host.split(':')[0]}:54321`;
    }
    
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';

    if (!geminiApiKey) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // 1. Fetch users opted-in to health tips
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('id, expo_push_token')
      .eq('notify_health_tips', true)
      .not('expo_push_token', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users opted in for health tips.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Generate a random health tip using Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
      You are a medical advisor. Give me one short, practical, and highly engaging daily health tip.
      The tip should be no longer than 150 characters. It will be sent as a push notification.
      Do not include any intro or outro, just the tip itself.
      Make it actionable. Focus on general wellness, nutrition, mental health, or exercise.
    `;

    const aiResult = await model.generateContent(prompt);
    const response = await aiResult.response;
    const healthTip = response.text().trim();

    const results = [];

    // 3. Send notification to all opted-in users
    for (const user of users) {
      const pushPayload = {
        expo_push_token: user.expo_push_token,
        title: 'Daily Health Tip 💡',
        body: healthTip,
        data: { type: 'health_tip' }
      };

      try {
        const { error: invokeError } = await supabase.functions.invoke('send-notification', {
          body: pushPayload
        });
        if (invokeError) throw invokeError;
        results.push({ id: user.id, status: 'sent' });
      } catch (e) {
        console.error(`Failed to send to ${user.expo_push_token}`, e);
        results.push({ id: user.id, status: 'error', error: e });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Processed daily health tips', 
        tip: healthTip,
        processed: results.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
