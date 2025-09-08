-- Add compenso_lead column to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN compenso_lead TEXT CHECK (compenso_lead IN ('50+15%', '30%'));