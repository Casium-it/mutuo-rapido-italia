
-- Create forms table to store form metadata
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_blocks table to store block definitions as JSON
CREATE TABLE public.form_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  block_data JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_versions table for versioning and rollback
CREATE TABLE public.form_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  form_snapshot JSONB NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id, version_number)
);

-- Add RLS policies
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active forms (needed for form rendering)
CREATE POLICY "Allow public read access to active forms" 
  ON public.forms 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Allow public read access to form blocks" 
  ON public.form_blocks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = form_blocks.form_id 
    AND forms.is_active = true
  ));

CREATE POLICY "Allow public read access to published form versions" 
  ON public.form_versions 
  FOR SELECT 
  USING (published_at IS NOT NULL);

-- Admin policies (if admin system exists)
CREATE POLICY "Admins can manage forms" 
  ON public.forms 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage form blocks" 
  ON public.form_blocks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage form versions" 
  ON public.form_versions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
  );

-- Create indexes for performance
CREATE INDEX idx_forms_slug ON public.forms(slug);
CREATE INDEX idx_forms_active ON public.forms(is_active);
CREATE INDEX idx_form_blocks_form_id ON public.form_blocks(form_id);
CREATE INDEX idx_form_blocks_sort_order ON public.form_blocks(form_id, sort_order);
CREATE INDEX idx_form_versions_form_id ON public.form_versions(form_id);
CREATE INDEX idx_form_versions_published ON public.form_versions(form_id, published_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_forms_updated_at 
  BEFORE UPDATE ON public.forms 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_blocks_updated_at 
  BEFORE UPDATE ON public.form_blocks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
