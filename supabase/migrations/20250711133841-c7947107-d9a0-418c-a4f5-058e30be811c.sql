-- Remove existing RLS policies for saved_simulations table
DROP POLICY IF EXISTS "Allow public read access to saved_simulations" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow public insert to saved_simulations" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow public update to saved_simulations" ON public.saved_simulations;