
-- Create linked_forms table
CREATE TABLE public.linked_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  form_slug TEXT NOT NULL DEFAULT 'simulazione-mutuo',
  link TEXT, -- Will store the full resume URL
  state TEXT NOT NULL DEFAULT 'active',
  percentage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update saved_simulations to properly link to linked_forms
-- First, drop the existing linked_form column
ALTER TABLE public.saved_simulations DROP COLUMN IF EXISTS linked_form;

-- Add the new linked_form_id column with proper foreign key
ALTER TABLE public.saved_simulations 
ADD COLUMN linked_form_id UUID REFERENCES public.linked_forms(id) ON DELETE SET NULL;

-- Add RLS policies for linked_forms table
ALTER TABLE public.linked_forms ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage linked_forms
CREATE POLICY "Admins can manage linked_forms" 
  ON public.linked_forms 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- Policy for service role to access linked_forms
CREATE POLICY "Service role can manage linked_forms" 
  ON public.linked_forms 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Add trigger for updated_at on linked_forms
CREATE TRIGGER update_linked_forms_updated_at
  BEFORE UPDATE ON public.linked_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_linked_forms_form_slug ON public.linked_forms(form_slug);
CREATE INDEX idx_saved_simulations_linked_form_id ON public.saved_simulations(linked_form_id);
