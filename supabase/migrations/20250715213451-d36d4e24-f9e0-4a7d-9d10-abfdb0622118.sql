-- Create leads table for proper lead management
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_submission_id UUID REFERENCES public.form_submissions(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone_number TEXT,
  lead_status lead_status NOT NULL DEFAULT 'not_contacted',
  notes TEXT,
  mediatore TEXT,
  next_contact_date TIMESTAMP WITH TIME ZONE,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  source TEXT DEFAULT 'form_submission',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_interactions table for interaction history
CREATE TABLE public.lead_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('call', 'email', 'whatsapp', 'meeting', 'note', 'status_change')),
  description TEXT NOT NULL,
  outcome TEXT,
  next_action TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads table
CREATE POLICY "Admins can manage all leads" 
ON public.leads 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage leads" 
ON public.leads 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create RLS policies for lead_interactions table
CREATE POLICY "Admins can manage all lead interactions" 
ON public.lead_interactions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage lead interactions" 
ON public.lead_interactions 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_leads_form_submission_id ON public.leads(form_submission_id);
CREATE INDEX idx_leads_lead_status ON public.leads(lead_status);
CREATE INDEX idx_leads_next_contact_date ON public.leads(next_contact_date);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX idx_lead_interactions_type ON public.lead_interactions(interaction_type);
CREATE INDEX idx_lead_interactions_scheduled_at ON public.lead_interactions(scheduled_at);

-- Create trigger for updating updated_at timestamp on leads
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to migrate existing lead data from form_submissions
CREATE OR REPLACE FUNCTION public.migrate_leads_from_submissions()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
  submission_record RECORD;
BEGIN
  -- Migrate lead data from form_submissions to leads table
  FOR submission_record IN 
    SELECT id, first_name, last_name, email, phone_number, lead_status, notes, mediatore, created_at
    FROM public.form_submissions 
    WHERE first_name IS NOT NULL OR last_name IS NOT NULL OR email IS NOT NULL OR phone_number IS NOT NULL
  LOOP
    INSERT INTO public.leads (
      form_submission_id,
      first_name,
      last_name,
      email,
      phone_number,
      lead_status,
      notes,
      mediatore,
      source,
      created_at,
      updated_at
    ) VALUES (
      submission_record.id,
      submission_record.first_name,
      submission_record.last_name,
      submission_record.email,
      submission_record.phone_number,
      COALESCE(submission_record.lead_status, 'not_contacted'),
      submission_record.notes,
      submission_record.mediatore,
      'form_submission',
      submission_record.created_at,
      submission_record.created_at
    );
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;