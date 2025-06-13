
-- Fix the INSERT policy to allow public insertion for saved_simulations
DROP POLICY IF EXISTS "Allow public insert to saved_simulations" ON public.saved_simulations;

CREATE POLICY "Allow public insert to saved_simulations" 
  ON public.saved_simulations 
  FOR INSERT 
  WITH CHECK (true);

-- Ensure the security definer function has proper execution rights
GRANT EXECUTE ON FUNCTION public.get_saved_simulation_by_resume_code(TEXT) TO anon, authenticated;

-- Also ensure the function can access the tables it needs
GRANT SELECT ON public.saved_simulations TO postgres;

-- Verify the SELECT policy is properly restrictive (should block direct access)
DROP POLICY IF EXISTS "Secure access to saved simulations by resume code" ON public.saved_simulations;

CREATE POLICY "Secure access to saved simulations by resume code" 
  ON public.saved_simulations 
  FOR SELECT 
  USING (false);
