-- Add RLS policy for mediatori to see only their assigned leads
CREATE POLICY "Mediatori can view their assigned leads"
ON public.form_submissions
FOR SELECT
USING (
  -- Check if the current user has mediatore role and is assigned to this lead
  EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'mediatore'
    AND form_submissions.mediatore = auth.uid()
  )
);