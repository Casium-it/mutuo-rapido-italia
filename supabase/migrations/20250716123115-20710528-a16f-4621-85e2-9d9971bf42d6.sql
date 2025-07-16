-- Add saved_simulation_id column to form_responses table
ALTER TABLE public.form_responses 
ADD COLUMN saved_simulation_id UUID REFERENCES public.saved_simulations(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_form_responses_saved_simulation_id ON public.form_responses(saved_simulation_id);

-- Update the previous migration to also populate the relationship
-- This will link form_responses to the saved_simulations we're about to create
UPDATE public.form_responses 
SET saved_simulation_id = ss.id
FROM public.saved_simulations ss
INNER JOIN public.form_submissions fs ON fs.phone_number = ss.phone 
WHERE form_responses.submission_id = fs.id
AND ss.save_method = 'auto_migration';