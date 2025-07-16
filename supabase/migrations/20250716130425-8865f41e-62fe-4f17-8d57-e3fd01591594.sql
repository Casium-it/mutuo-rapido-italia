-- Remove the leads table and related objects
DROP TABLE IF EXISTS public.leads CASCADE;

-- Remove the lead_source_type enum
DROP TYPE IF EXISTS public.lead_source_type CASCADE;

-- Remove the saved_simulation_id column from form_responses
ALTER TABLE public.form_responses 
DROP COLUMN IF EXISTS saved_simulation_id CASCADE;