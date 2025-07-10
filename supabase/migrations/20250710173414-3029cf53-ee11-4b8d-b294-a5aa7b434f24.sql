
-- Phase 1: Add new form_slug column and migrate data
ALTER TABLE public.saved_simulations 
ADD COLUMN form_slug TEXT;

-- Phase 2: Migrate existing data - map all values to 'simulazione-mutuo'
-- since all current form_type values appear to be related to the mortgage simulation
UPDATE public.saved_simulations 
SET form_slug = 'simulazione-mutuo';

-- Phase 3: Make form_slug NOT NULL and set default
ALTER TABLE public.saved_simulations 
ALTER COLUMN form_slug SET NOT NULL,
ALTER COLUMN form_slug SET DEFAULT 'simulazione-mutuo';

-- Phase 4: Drop the old form_type column
ALTER TABLE public.saved_simulations 
DROP COLUMN form_type;

-- Phase 5: Add index for better performance on resume code lookups
CREATE INDEX IF NOT EXISTS idx_saved_simulations_form_slug 
ON public.saved_simulations(form_slug);
