
-- Simplified Phase 1: Database Security Enhancement (without duplicate prevention)

-- Remove public INSERT policies from form_submissions and form_responses
DROP POLICY IF EXISTS "Allow public insert to form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow public insert to form_responses" ON public.form_responses;

-- Add service role policies for Edge Function access
CREATE POLICY "Service role can insert form submissions" 
  ON public.form_submissions 
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert form responses" 
  ON public.form_responses 
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update form submissions" 
  ON public.form_submissions 
  FOR UPDATE 
  USING (auth.role() = 'service_role');
