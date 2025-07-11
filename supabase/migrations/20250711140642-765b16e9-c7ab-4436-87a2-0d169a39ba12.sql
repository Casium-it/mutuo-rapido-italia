
-- Create the linked_forms table
CREATE TABLE public.linked_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  form_slug TEXT NOT NULL DEFAULT 'simulazione-mutuo',
  link TEXT,
  state TEXT NOT NULL DEFAULT 'active',
  percentage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on linked_forms table
ALTER TABLE public.linked_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for linked_forms
CREATE POLICY "Admins can manage linked forms" 
  ON public.linked_forms 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  ));

-- Service role can manage linked forms (for edge functions)
CREATE POLICY "Service role can manage linked forms" 
  ON public.linked_forms 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Add trigger to update updated_at column
CREATE TRIGGER update_linked_forms_updated_at 
  BEFORE UPDATE ON public.linked_forms 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to saved_simulations.linked_form
ALTER TABLE public.saved_simulations 
ADD CONSTRAINT fk_saved_simulations_linked_form 
FOREIGN KEY (linked_form) REFERENCES public.linked_forms(id);
