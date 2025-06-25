
-- First, let's check if there are existing RLS policies on form_submissions and form_responses
-- If RLS is enabled but no admin policies exist, we need to add them

-- Add RLS policies for form_submissions table to allow admins to delete
CREATE POLICY "Admins can delete form submissions" 
  ON public.form_submissions 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for form_responses table to allow admins to delete
CREATE POLICY "Admins can delete form responses" 
  ON public.form_responses 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Also add update policies if they don't exist
CREATE POLICY "Admins can update form submissions" 
  ON public.form_submissions 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update form responses" 
  ON public.form_responses 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));
