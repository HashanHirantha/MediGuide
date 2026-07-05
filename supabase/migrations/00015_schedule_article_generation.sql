-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the generate-articles function to run every 2 days at midnight UTC.
-- NOTE: For local development, 'http://kong:8000/functions/v1/generate-articles' works.
-- For production (remote Supabase), you MUST update this URL to your actual project URL:
-- 'https://wacebhnvymggciqpebsd.supabase.co/functions/v1/generate-articles'
-- AND replace 'YOUR_SERVICE_ROLE_KEY' with your actual Supabase Service Role Key.

SELECT cron.schedule(
  'generate-articles-every-2-days',
  '0 0 */2 * *',
  $$
    SELECT net.http_post(
        url := 'https://wacebhnvymggciqpebsd.supabase.co/functions/v1/generate-articles',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU1NjEwOSwiZXhwIjoyMDk1MTMyMTA5fQ.E5pcuR6d2Z82xdD-rxoRWIwWlyE5H3C7MIFVDqwrYe4"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
  $$
);
