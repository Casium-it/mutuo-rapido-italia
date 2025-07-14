-- Phase 2: Complete the migration by dropping form_type column
-- Now that we have form_id foreign key and all existing data is linked, we can safely drop form_type
ALTER TABLE public.form_submissions 
DROP COLUMN form_type;