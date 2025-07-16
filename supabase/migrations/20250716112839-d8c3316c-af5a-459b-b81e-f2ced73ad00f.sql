
-- Create ENUM for lead source type
CREATE TYPE public.lead_source_type AS ENUM (
  'form_submission',
  'saved_simulation'
);

-- Create the leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone_number TEXT,
  lead_status public.lead_status DEFAULT 'not_contacted',
  consulting BOOLEAN,
  notes TEXT,
  mediatore TEXT,
  source_type public.lead_source_type NOT NULL,
  source_id UUID NOT NULL,
  form_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all leads" 
  ON public.leads 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role'::text);

-- Create indexes for performance
CREATE INDEX idx_leads_source_type_id ON public.leads (source_type, source_id);
CREATE INDEX idx_leads_email ON public.leads (email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_phone ON public.leads (phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX idx_leads_status ON public.leads (lead_status);
CREATE INDEX idx_leads_created_at ON public.leads (created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 1: Migrate from form_submissions
INSERT INTO public.leads (
  first_name,
  last_name,
  email,
  phone_number,
  lead_status,
  consulting,
  notes,
  mediatore,
  source_type,
  source_id,
  form_id,
  created_at,
  updated_at
)
SELECT 
  fs.first_name,
  fs.last_name,
  fs.email,
  fs.phone_number,
  COALESCE(fs.lead_status, 'not_contacted'::public.lead_status),
  fs.consulting,
  fs.notes,
  fs.mediatore,
  'form_submission'::public.lead_source_type,
  fs.id,
  fs.form_id,
  fs.created_at,
  fs.created_at
FROM public.form_submissions fs;

-- Phase 2: Migrate from saved_simulations (only those with contact info and not already covered by form_submissions)
INSERT INTO public.leads (
  first_name,
  last_name,
  email,
  phone_number,
  lead_status,
  consulting,
  notes,
  mediatore,
  source_type,
  source_id,
  form_id,
  created_at,
  updated_at
)
SELECT 
  ss.name AS first_name,
  NULL AS last_name,
  ss.email,
  ss.phone,
  'not_contacted'::public.lead_status,
  NULL AS consulting,
  NULL AS notes,
  NULL AS mediatore,
  'saved_simulation'::public.lead_source_type,
  ss.id,
  NULL AS form_id,
  ss.created_at,
  ss.created_at
FROM public.saved_simulations ss
WHERE (ss.email IS NOT NULL OR ss.phone IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM public.leads l 
    WHERE l.source_type = 'form_submission' 
    AND (
      (ss.email IS NOT NULL AND l.email = ss.email) OR
      (ss.phone IS NOT NULL AND l.phone_number = ss.phone)
    )
  );
