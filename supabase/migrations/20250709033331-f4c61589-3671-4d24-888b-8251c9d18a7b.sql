
-- Create linked_forms table
CREATE TABLE public.linked_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_service_id TEXT NOT NULL,
  form_id UUID NOT NULL REFERENCES public.forms(id),
  link_token TEXT NOT NULL UNIQUE,
  webhook_url TEXT,
  redirect_url TEXT,
  completion_behavior TEXT NOT NULL CHECK (completion_behavior IN ('funnel', 'redirect', 'api_only')) DEFAULT 'funnel',
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'expired')) DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER NOT NULL DEFAULT 0
);

-- Add columns to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN linked_form_id UUID REFERENCES public.linked_forms(id),
ADD COLUMN completion_behavior TEXT CHECK (completion_behavior IN ('funnel', 'redirect', 'api_only')),
ADD COLUMN redirect_url TEXT;

-- Add RLS policies for linked_forms
ALTER TABLE public.linked_forms ENABLE ROW LEVEL SECURITY;

-- Allow public access to active linked forms by token
CREATE POLICY "Allow public read access to active linked forms" 
  ON public.linked_forms 
  FOR SELECT 
  USING (status = 'active' AND expires_at > now());

-- Allow public updates to linked forms (for progress tracking)
CREATE POLICY "Allow public update to linked forms" 
  ON public.linked_forms 
  FOR UPDATE 
  USING (status = 'active' AND expires_at > now());

-- Allow API service to create linked forms
CREATE POLICY "Allow insert to linked forms" 
  ON public.linked_forms 
  FOR INSERT 
  WITH CHECK (true);

-- Admins can manage all linked forms
CREATE POLICY "Admins can manage linked forms" 
  ON public.linked_forms 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Generate secure tokens function
CREATE OR REPLACE FUNCTION public.generate_link_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a 32-character secure token
  token := encode(gen_random_bytes(24), 'base64');
  -- Replace URL-unsafe characters
  token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.linked_forms WHERE link_token = token) LOOP
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
  END LOOP;
  
  RETURN token;
END;
$$;

-- Set default for link_token
ALTER TABLE public.linked_forms 
ALTER COLUMN link_token SET DEFAULT generate_link_token();

-- Create index for performance
CREATE INDEX idx_linked_forms_token ON public.linked_forms(link_token);
CREATE INDEX idx_linked_forms_external_service ON public.linked_forms(external_service_id);
CREATE INDEX idx_form_submissions_linked_form ON public.form_submissions(linked_form_id);
