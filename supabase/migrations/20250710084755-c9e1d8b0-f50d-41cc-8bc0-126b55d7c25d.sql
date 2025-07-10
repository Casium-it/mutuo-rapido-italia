
-- Add mediatore column to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN mediatore text DEFAULT NULL;
