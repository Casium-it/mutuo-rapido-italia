-- Add saved_simulation_id column to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN saved_simulation_id UUID REFERENCES public.saved_simulations(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_form_submissions_saved_simulation_id ON public.form_submissions(saved_simulation_id);