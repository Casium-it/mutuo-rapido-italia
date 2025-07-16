-- Drop the existing cron job if it exists
SELECT cron.unschedule('auto-reminder-check');

-- Enable the pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the cron job to run autoRun5minutes at exact 5-minute intervals (00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
SELECT cron.schedule(
  'auto-reminder-check',
  '0,5,10,15,20,25,30,35,40,45,50,55 * * * *', -- at exact 5-minute marks
  $$
  SELECT
    net.http_post(
        url:='https://jegdbtznkwzpqntzzlvf.supabase.co/functions/v1/autoRun5minutes',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2RidHpua3d6cHFudHp6bHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjExNzksImV4cCI6MjA2MzMzNzE3OX0.KS7wtHU2jRggJ06JKu_4YbVOvn8Bvz04wfE0qLpQPwU'
        ),
        body:=jsonb_build_object('source', 'cron')
    ) as request_id;
  $$
);