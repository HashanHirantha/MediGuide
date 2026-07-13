-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the appointment-reminders function to run every day at midnight UTC (00:00).
-- This will process and send reminders for all appointments scheduled for the following day.
SELECT cron.schedule(
  'appointment-reminders-daily',
  '0 0 * * *',
  $$
    SELECT net.http_post(
        url := 'https://wacebhnvymggciqpebsd.supabase.co/functions/v1/appointment-reminders',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU1NjEwOSwiZXhwIjoyMDk1MTMyMTA5fQ.E5pcuR6d2Z82xdD-rxoRWIwWlyE5H3C7MIFVDqwrYe4"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule the daily-health-tip function to run every day at 09:00 UTC.
-- This will send a randomly selected health tip to users who opted in.
SELECT cron.schedule(
  'daily-health-tip-daily',
  '0 9 * * *',
  $$
    SELECT net.http_post(
        url := 'https://wacebhnvymggciqpebsd.supabase.co/functions/v1/daily-health-tip',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2ViaG52eW1nZ2NpcXBlYnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU1NjEwOSwiZXhwIjoyMDk1MTMyMTA5fQ.E5pcuR6d2Z82xdD-rxoRWIwWlyE5H3C7MIFVDqwrYe4"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
  $$
);
