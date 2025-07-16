-- Add reminder_sent field to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN reminder_sent boolean NOT NULL DEFAULT false;