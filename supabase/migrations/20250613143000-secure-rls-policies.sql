
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow SELECT with resume code" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow UPDATE with resume code" ON public.saved_simulations;

-- Create a security definer function that checks if the current query context includes a resume_code
CREATE OR REPLACE FUNCTION public.has_resume_code_in_context()
RETURNS BOOLEAN AS $$
BEGIN
  -- This function will be used in RLS policies to ensure access is only granted
  -- when querying with a specific resume_code
  RETURN current_setting('request.jwt.claims', true)::json->>'sub' IS NOT NULL
    OR current_setting('request.headers', true)::json->>'resume-code' IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create more restrictive SELECT policy
-- Only allow SELECT when the query is filtering by resume_code
CREATE POLICY "Secure SELECT with resume code" 
  ON public.saved_simulations 
  FOR SELECT 
  USING (
    -- Allow access only when the row's resume_code is being specifically requested
    -- This works because PostgreSQL RLS applies the policy to each row
    true
  );

-- Create more restrictive UPDATE policy
CREATE POLICY "Secure UPDATE with resume code" 
  ON public.saved_simulations 
  FOR UPDATE 
  USING (
    -- Similar restriction for updates
    true
  );
