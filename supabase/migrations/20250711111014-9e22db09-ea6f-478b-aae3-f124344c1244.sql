
-- Remove the current public update policy
DROP POLICY IF EXISTS "Allow public update to form_submissions" ON public.form_submissions;

-- Remove the overly permissive contact update policy if it exists
DROP POLICY IF EXISTS "Allow contact updates with valid session" ON public.form_submissions;

-- Create a restrictive policy that only allows service role (Edge Functions) to update
CREATE POLICY "Only service role can update form submissions" 
  ON public.form_submissions 
  FOR UPDATE 
  USING (auth.role() = 'service_role');

-- Keep the existing public read and insert policies for form creation
-- Users can still read submissions (needed for form completion page)
-- Users can still create new submissions (needed for form submission)
-- But users can NO LONGER update submissions directly
