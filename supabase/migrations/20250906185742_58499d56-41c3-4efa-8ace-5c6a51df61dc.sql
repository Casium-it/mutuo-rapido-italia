-- Drop the existing RLS policy that's not working
DROP POLICY IF EXISTS "Mediatori can view their assigned leads" ON public.form_submissions;

-- Create a simplified RLS policy - just check if mediatore column matches auth user
CREATE POLICY "Mediatori can view assigned leads"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (form_submissions.mediatore = auth.uid());

-- Also need to fix form_responses policy for mediatori
DROP POLICY IF EXISTS "Mediatori can view responses for assigned leads" ON public.form_responses;

CREATE POLICY "Mediatori can view responses for assigned leads"
ON public.form_responses
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.form_submissions fs 
    WHERE fs.id = form_responses.submission_id 
    AND fs.mediatore = auth.uid()
  )
);