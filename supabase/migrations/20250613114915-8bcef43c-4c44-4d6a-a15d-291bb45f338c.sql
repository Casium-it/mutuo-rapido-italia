
-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT,
  form_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  phone_number TEXT,
  consulting BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_responses table
CREATE TABLE public.form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  block_id TEXT NOT NULL,
  response_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create simulations table
CREATE TABLE public.simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads table (public access for lead generation)
CREATE POLICY "Allow public read access to leads" 
  ON public.leads 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (true);

-- Create RLS policies for form_submissions table (public access for form submissions)
CREATE POLICY "Allow public read access to form_submissions" 
  ON public.form_submissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to form_submissions" 
  ON public.form_submissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to form_submissions" 
  ON public.form_submissions 
  FOR UPDATE 
  USING (true);

-- Create RLS policies for form_responses table (public access)
CREATE POLICY "Allow public read access to form_responses" 
  ON public.form_responses 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to form_responses" 
  ON public.form_responses 
  FOR INSERT 
  WITH CHECK (true);

-- Create RLS policies for simulations table (public access)
CREATE POLICY "Allow public read access to simulations" 
  ON public.simulations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to simulations" 
  ON public.simulations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to simulations" 
  ON public.simulations 
  FOR UPDATE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_leads_slug ON public.leads(slug);
CREATE INDEX idx_form_submissions_user_identifier ON public.form_submissions(user_identifier);
CREATE INDEX idx_form_submissions_expires_at ON public.form_submissions(expires_at);
CREATE INDEX idx_form_responses_submission_id ON public.form_responses(submission_id);
CREATE INDEX idx_form_responses_question_id ON public.form_responses(question_id);
CREATE INDEX idx_simulations_slug ON public.simulations(slug);
