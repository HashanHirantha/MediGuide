-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the generate-articles function to run every 2 days at midnight UTC.
-- NOTE: For local development, 'http://kong:8000/functions/v1/generate-articles' works.
-- For production (remote Supabase), you MUST update this URL to your actual project URL:
-- 'https://[PROJECT_REF].supabase.co/functions/v1/generate-articles'
-- AND replace 'YOUR_SERVICE_ROLE_KEY' with your actual Supabase Service Role Key.

SELECT cron.schedule(
  'generate-articles-every-2-days',
  '0 0 */2 * *',
  $$
    SELECT net.http_post(
        url := 'http://kong:8000/functions/v1/generate-articles',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
  $$
);
