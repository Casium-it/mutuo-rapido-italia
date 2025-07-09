
-- Create linked_forms table for CRM-generated tokens
CREATE TABLE public.linked_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  form_slug TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  webhook_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for token lookups
CREATE INDEX idx_linked_forms_token ON public.linked_forms(token);
CREATE INDEX idx_linked_forms_expires_at ON public.linked_forms(expires_at);

-- Create webhook_logs table for tracking webhook delivery
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  linked_token TEXT NOT NULL REFERENCES public.linked_forms(token),
  event_type TEXT NOT NULL CHECK (event_type IN ('form_started', 'form_saved', 'form_completed')),
  payload JSONB NOT NULL,
  http_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for webhook logs
CREATE INDEX idx_webhook_logs_token ON public.webhook_logs(linked_token);
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);

-- Add linked_token column to form_submissions
ALTER TABLE public.form_submissions 
ADD COLUMN linked_token TEXT REFERENCES public.linked_forms(token);

-- Add index for linked submissions
CREATE INDEX idx_form_submissions_linked_token ON public.form_submissions(linked_token);

-- Add RLS policies for linked_forms (public access needed for form validation)
ALTER TABLE public.linked_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to valid linked forms" 
  ON public.linked_forms 
  FOR SELECT 
  USING (expires_at > now() AND NOT is_used);

CREATE POLICY "Allow public update for marking forms as used" 
  ON public.linked_forms 
  FOR UPDATE 
  USING (expires_at > now());

-- Add RLS policies for webhook_logs (admin access only)
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all webhook logs" 
  ON public.webhook_logs 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow public insert for webhook logs" 
  ON public.webhook_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Function to generate secure tokens
CREATE OR REPLACE FUNCTION public.generate_linked_form_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a 32-character secure token
  token := encode(gen_random_bytes(24), 'base64');
  -- Remove characters that might cause URL issues
  token := replace(replace(replace(token, '+', ''), '/', ''), '=', '');
  -- Ensure it's exactly 32 characters
  token := left(token || encode(gen_random_bytes(24), 'base64'), 32);
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.linked_forms WHERE token = token) LOOP
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '+', ''), '/', ''), '=', '');
    token := left(token || encode(gen_random_bytes(24), 'base64'), 32);
  END LOOP;
  
  RETURN token;
END;
$$;
