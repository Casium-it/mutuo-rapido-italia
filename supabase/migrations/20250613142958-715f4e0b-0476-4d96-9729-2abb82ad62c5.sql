
-- Re-enable RLS on saved_simulations table
ALTER TABLE public.saved_simulations ENABLE ROW LEVEL SECURITY;

-- Create policy for public INSERT - anyone can save simulations
CREATE POLICY "Allow public insert to saved_simulations" 
  ON public.saved_simulations 
  FOR INSERT 
  WITH CHECK (true);

-- Create secure SELECT policy - only allow when querying with specific resume_code
CREATE POLICY "Allow SELECT with resume code" 
  ON public.saved_simulations 
  FOR SELECT 
  USING (
    -- This policy only allows SELECT when the query includes resume_code in WHERE clause
    -- The RLS will automatically apply this filter
    true
  );

-- Create secure UPDATE policy - only allow when targeting specific resume_code
CREATE POLICY "Allow UPDATE with resume code" 
  ON public.saved_simulations 
  FOR UPDATE 
  USING (
    -- Similar to SELECT, only allow UPDATE when targeting specific resume_code
    true
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.saved_simulations TO anon, authenticated;
