
-- Create security definer function with specific naming for saved simulation access
CREATE OR REPLACE FUNCTION public.get_saved_simulation_by_resume_code(p_resume_code TEXT)
RETURNS TABLE (
  id UUID,
  resume_code TEXT,
  name TEXT,
  phone TEXT,
  email TEXT,
  form_state JSONB,
  form_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate resume code format (8 alphanumeric characters, uppercase)
  IF p_resume_code !~ '^[A-Z0-9]{8}$' THEN
    RETURN;
  END IF;

  -- Try to find the simulation (removed rate limiting and logging)
  IF EXISTS (
    SELECT 1 FROM public.saved_simulations 
    WHERE saved_simulations.resume_code = p_resume_code 
      AND expires_at > now()
  ) THEN
    -- Return the simulation data
    RETURN QUERY
    SELECT s.id, s.resume_code, s.name, s.phone, s.email, 
           s.form_state, s.form_type, s.expires_at, s.created_at, s.updated_at
    FROM public.saved_simulations s
    WHERE s.resume_code = p_resume_code 
      AND s.expires_at > now();
  END IF;
END;
$$;

-- Create new secure SELECT policy that uses our security definer function
CREATE POLICY "Secure access to saved simulations by resume code" 
  ON public.saved_simulations 
  FOR SELECT 
  USING (false); -- This policy will be bypassed by our security definer function

-- Update the resume code generation function to ensure proper format
CREATE OR REPLACE FUNCTION generate_resume_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate a 8-character alphanumeric code (uppercase only)
  code := upper(substring(md5(random()::text || random()::text) from 1 for 8));
  
  -- Ensure it contains both letters and numbers for better security
  WHILE NOT (code ~ '[A-Z]' AND code ~ '[0-9]') OR EXISTS (SELECT 1 FROM public.saved_simulations WHERE resume_code = code) LOOP
    code := upper(substring(md5(random()::text || random()::text) from 1 for 8));
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;
