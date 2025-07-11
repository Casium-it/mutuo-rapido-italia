
-- Remove the overly permissive public read policy that allows anyone to read all form submissions
DROP POLICY IF EXISTS "Allow public read access to form_submissions" ON public.form_submissions;

-- The remaining policies are secure and appropriate:
-- - "Allow public insert to form_submissions" - needed for form submissions
-- - "Admins can view all form submissions" - secure admin access
-- - "Admins can delete form submissions" - secure admin access  
-- - "Admins can update form submissions" - secure admin access
-- - "Only service role can update form submissions" - secure edge function access
