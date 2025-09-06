-- Drop the current policy that's not working due to session context
DROP POLICY IF EXISTS "Mediatori can view assigned leads" ON public.form_submissions;

-- Create RLS policy using EXISTS pattern for better session handling
CREATE POLICY "Mediatori can view assigned leads"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = form_submissions.mediatore
    AND p.id = auth.uid()
  )
);

-- Also update the form_responses policy
DROP POLICY IF EXISTS "Mediatori can view responses for assigned leads" ON public.form_responses;

CREATE POLICY "Mediatori can view responses for assigned leads"
ON public.form_responses
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.form_submissions fs 
    JOIN public.profiles p ON p.id = fs.mediatore
    WHERE fs.id = form_responses.submission_id 
    AND p.id = auth.uid()
  )
);