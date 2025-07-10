
-- First, we need to add the new enum values to the existing lead_status enum
-- Since PostgreSQL doesn't allow direct modification of enums with existing data,
-- we'll add the new values first, then we can update existing data if needed

-- Add new enum values to the existing lead_status enum
ALTER TYPE public.lead_status ADD VALUE 'non_risponde_x1';
ALTER TYPE public.lead_status ADD VALUE 'non_risponde_x2';
ALTER TYPE public.lead_status ADD VALUE 'non_risponde_x3';
ALTER TYPE public.lead_status ADD VALUE 'non_interessato';
ALTER TYPE public.lead_status ADD VALUE 'da_risentire';
ALTER TYPE public.lead_status ADD VALUE 'prenotata_consulenza';
ALTER TYPE public.lead_status ADD VALUE 'pratica_bocciata';

-- Note: We already have 'not_contacted' (non contattato) and 'converted' (convertito)
-- We'll map the existing values in the UI components

-- Update the default value for new submissions to use the Italian equivalent
ALTER TABLE public.form_submissions ALTER COLUMN lead_status SET DEFAULT 'not_contacted';
