
-- Drop indexes first
DROP INDEX IF EXISTS public.idx_linked_forms_token;
DROP INDEX IF EXISTS public.idx_linked_forms_external_service;
DROP INDEX IF EXISTS public.idx_form_submissions_linked_form;

-- Drop RLS policies for linked_forms
DROP POLICY IF EXISTS "Allow public read access to active linked forms" ON public.linked_forms;
DROP POLICY IF EXISTS "Allow public update to linked forms" ON public.linked_forms;
DROP POLICY IF EXISTS "Allow insert to linked forms" ON public.linked_forms;
DROP POLICY IF EXISTS "Admins can manage linked forms" ON public.linked_forms;

-- Remove columns from form_submissions table
ALTER TABLE public.form_submissions 
DROP COLUMN IF EXISTS linked_form_id,
DROP COLUMN IF EXISTS completion_behavior,
DROP COLUMN IF EXISTS redirect_url;

-- Drop the linked_forms table
DROP TABLE IF EXISTS public.linked_forms;

-- Drop the generate_link_token function
DROP FUNCTION IF EXISTS public.generate_link_token();
