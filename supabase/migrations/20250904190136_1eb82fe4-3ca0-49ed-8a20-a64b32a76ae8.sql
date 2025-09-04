-- Add ai_notes column to form_submissions table to store AI analysis results
ALTER TABLE public.form_submissions 
ADD COLUMN ai_notes text;