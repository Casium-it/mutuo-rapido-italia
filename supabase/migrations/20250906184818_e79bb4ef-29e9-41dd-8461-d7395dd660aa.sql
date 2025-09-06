-- Drop the existing problematic RLS policy
DROP POLICY IF EXISTS "Mediatori can view their assigned leads" ON public.form_submissions;

-- Create the corrected RLS policy for mediatori
CREATE POLICY "Mediatori can view their assigned leads"
ON public.form_submissions
FOR SELECT
USING (
  -- User must have mediatore role AND the lead must be assigned to them
  has_role(auth.uid(), 'mediatore'::app_role) 
  AND form_submissions.mediatore = auth.uid()
);