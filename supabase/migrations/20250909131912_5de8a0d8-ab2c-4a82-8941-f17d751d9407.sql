-- Add gomutuo_service column to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN gomutuo_service text DEFAULT NULL;