-- CRITICAL SECURITY FIX: Remove public read access to sensitive customer data

-- Drop the dangerous public read policy that allows anyone to access form_responses
DROP POLICY IF EXISTS "Allow public read access to form_responses" ON public.form_responses;

-- Verify that admin and service role policies are sufficient:
-- ✅ "Admins can view all form responses" - allows admin dashboard access
-- ✅ "Service role can insert form responses" - allows edge functions to insert
-- ✅ Edge functions run as service_role and can read via service role access

-- Add explicit service role read policy for edge functions that need to read form_responses
CREATE POLICY "Service role can read form responses" 
  ON public.form_responses 
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- The remaining policies now properly secure access:
-- 1. Admins can read/write (for admin dashboard)
-- 2. Service role can read/write (for edge functions) 
-- 3. No public access (blocks unauthorized access)