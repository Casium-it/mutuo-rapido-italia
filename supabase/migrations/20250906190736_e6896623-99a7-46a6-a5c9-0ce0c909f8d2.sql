-- Add RLS policy for mediatori to view saved simulations for their assigned leads
CREATE POLICY "Mediatori can view saved simulations for assigned leads"
ON public.saved_simulations
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.form_submissions fs 
    JOIN public.profiles p ON p.id = fs.mediatore
    WHERE fs.saved_simulation_id = saved_simulations.id 
    AND p.id = auth.uid()
  )
);