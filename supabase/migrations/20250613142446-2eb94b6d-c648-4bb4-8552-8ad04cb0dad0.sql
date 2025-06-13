
-- Remove the security logs table and all related objects
DROP TABLE IF EXISTS public.security_logs CASCADE;

-- Update the security definer function to remove security logging
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
