-- Safe migration to clean up mediatore columns
-- First drop the old text-based mediatore column since we've migrated all data
ALTER TABLE public.form_submissions 
DROP COLUMN IF EXISTS mediatore;

-- Then rename the new UUID foreign key column from mediatore_assegnato to mediatore
ALTER TABLE public.form_submissions 
RENAME COLUMN mediatore_assegnato TO mediatore;