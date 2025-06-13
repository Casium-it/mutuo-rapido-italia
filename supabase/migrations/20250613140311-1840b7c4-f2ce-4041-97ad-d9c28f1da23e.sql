
-- Drop the overly permissive existing policies
DROP POLICY IF EXISTS "Allow public read access to saved_simulations" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow public update to saved_simulations" ON public.saved_simulations;

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
    -- Log failed access attempt
    INSERT INTO public.security_logs (event_type, details, ip_address, created_at)
    VALUES ('invalid_resume_code_format', 
            jsonb_build_object('attempted_code', p_resume_code),
            inet_client_addr(),
            now());
    
    RETURN;
  END IF;

  -- Check rate limiting (max 5 attempts per minute per IP)
  IF (
    SELECT COUNT(*) 
    FROM public.security_logs 
    WHERE event_type IN ('resume_code_access', 'invalid_resume_code_format', 'resume_code_not_found')
      AND ip_address = inet_client_addr()
      AND created_at > now() - interval '1 minute'
  ) >= 5 THEN
    -- Log rate limit exceeded
    INSERT INTO public.security_logs (event_type, details, ip_address, created_at)
    VALUES ('rate_limit_exceeded', 
            jsonb_build_object('attempted_code', p_resume_code),
            inet_client_addr(),
            now());
    
    RETURN;
  END IF;

  -- Try to find the simulation
  IF EXISTS (
    SELECT 1 FROM public.saved_simulations 
    WHERE saved_simulations.resume_code = p_resume_code 
      AND expires_at > now()
  ) THEN
    -- Log successful access
    INSERT INTO public.security_logs (event_type, details, ip_address, created_at)
    VALUES ('resume_code_access', 
            jsonb_build_object('resume_code', p_resume_code),
            inet_client_addr(),
            now());

    -- Return the simulation data
    RETURN QUERY
    SELECT s.id, s.resume_code, s.name, s.phone, s.email, 
           s.form_state, s.form_type, s.expires_at, s.created_at, s.updated_at
    FROM public.saved_simulations s
    WHERE s.resume_code = p_resume_code 
      AND s.expires_at > now();
  ELSE
    -- Log failed access attempt
    INSERT INTO public.security_logs (event_type, details, ip_address, created_at)
    VALUES ('resume_code_not_found', 
            jsonb_build_object('attempted_code', p_resume_code),
            inet_client_addr(),
            now());
  END IF;
END;
$$;

-- Create security logs table for monitoring
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security logs table
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for security logs (admin access only - for now just allow reading for monitoring)
CREATE POLICY "Allow read access to security logs" 
  ON public.security_logs 
  FOR SELECT 
  USING (true);

-- Create new secure SELECT policy that uses our security definer function
CREATE POLICY "Secure access to saved simulations by resume code" 
  ON public.saved_simulations 
  FOR SELECT 
  USING (false); -- This policy will be bypassed by our security definer function

-- Add index for better performance on security logs
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_ip_address ON public.security_logs(ip_address);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at);

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
