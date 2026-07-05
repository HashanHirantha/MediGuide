import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Delete articles older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    console.log(`[GenerateArticles] Deleting articles older than ${sevenDaysAgo.toISOString()}`);
    
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString());

    if (deleteError) {
      console.error('[GenerateArticles] Failed to delete old articles:', deleteError);
    } else {
      console.log('[GenerateArticles] Successfully deleted old articles');
    }

    // 2. Generate new articles with Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const prompt = `You are an expert health and medical writer. Write 4 completely new, engaging, and accurate health articles. 
The topics MUST be focused on:
1. General health
2. Newest viruses and new illnesses (relevant to the current global context, e.g. seasonal flu strains, emerging viruses)
3. Good healthy tips (nutrition, lifestyle, preventive care)

Output the articles in valid JSON format exactly matching this structure (do not include markdown fences or any other text):
{
  "articles": [
    {
      "title": "Article Title",
      "summary": "A brief 2-sentence summary of the article.",
      "content": "The full article content here. Use markdown for headings, bullet points, etc. Should be around 150-300 words.",
      "category": "One of: 'General Health', 'Seasonal', 'Preventive Care', 'Lifestyle'",
      "read_time_minutes": 3,
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}`;

    console.log('[GenerateArticles] Calling Gemini API...');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No text in Gemini response');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${responseText}`);
    }

    const articles = parsedResponse.articles || [];
    
    if (!articles.length) {
      throw new Error('No articles found in AI response');
    }

    // Assign Unsplash image URLs based on tags or categories
    const newArticles = articles.map((article: any) => {
      // Create a search query for unsplash based on tags or category
      const searchQuery = encodeURIComponent(article.tags[0] || article.category || 'health');
      return {
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        read_time_minutes: article.read_time_minutes,
        tags: article.tags,
        image_url: `https://loremflickr.com/600/400/${searchQuery},medical`,
      };
    });

    console.log(`[GenerateArticles] Inserting ${newArticles.length} new articles into database...`);

    const { data: insertedArticles, error: insertError } = await supabase
      .from('articles')
      .insert(newArticles)
      .select();

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated and inserted ${insertedArticles?.length} articles`,
        articles: insertedArticles 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GenerateArticles] Error:', (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
