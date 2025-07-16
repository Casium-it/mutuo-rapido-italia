-- Add saved_simulation_id column to form_responses table
ALTER TABLE public.form_responses 
ADD COLUMN saved_simulation_id UUID REFERENCES public.saved_simulations(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_form_responses_saved_simulation_id ON public.form_responses(saved_simulation_id);