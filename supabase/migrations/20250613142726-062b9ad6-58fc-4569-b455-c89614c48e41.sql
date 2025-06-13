
-- Remove the complex security definer function
DROP FUNCTION IF EXISTS public.get_saved_simulation_by_resume_code(TEXT);

-- Remove all RLS policies from saved_simulations
DROP POLICY IF EXISTS "Allow public insert to saved_simulations" ON public.saved_simulations;
DROP POLICY IF EXISTS "Secure access to saved simulations by resume code" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow public read access to saved_simulations" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow public update to saved_simulations" ON public.saved_simulations;

-- Disable RLS on the table
ALTER TABLE public.saved_simulations DISABLE ROW LEVEL SECURITY;

-- Grant simple public access
GRANT SELECT, INSERT, UPDATE ON public.saved_simulations TO anon, authenticated;
