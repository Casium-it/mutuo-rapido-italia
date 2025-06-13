
-- Create saved_simulations table to store form state for resume functionality
CREATE TABLE public.saved_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  form_state JSONB NOT NULL,
  form_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_simulations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since this is for lead generation)
CREATE POLICY "Allow public read access to saved_simulations" 
  ON public.saved_simulations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to saved_simulations" 
  ON public.saved_simulations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to saved_simulations" 
  ON public.saved_simulations 
  FOR UPDATE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_saved_simulations_resume_code ON public.saved_simulations(resume_code);
CREATE INDEX idx_saved_simulations_email ON public.saved_simulations(email);
CREATE INDEX idx_saved_simulations_expires_at ON public.saved_simulations(expires_at);

-- Function to generate unique resume codes
CREATE OR REPLACE FUNCTION generate_resume_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate a 8-character alphanumeric code
  code := upper(substring(md5(random()::text) from 1 for 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.saved_simulations WHERE resume_code = code) LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Set default value for resume_code
ALTER TABLE public.saved_simulations ALTER COLUMN resume_code SET DEFAULT generate_resume_code();
