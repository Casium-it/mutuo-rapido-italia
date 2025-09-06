-- Remove metadata column from form_submissions table
ALTER TABLE public.form_submissions DROP COLUMN IF EXISTS metadata;