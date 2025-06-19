
-- Drop the leads table and its dependencies
DROP TABLE IF EXISTS public.leads CASCADE;

-- Drop the simulations table and its dependencies  
DROP TABLE IF EXISTS public.simulations CASCADE;

-- Drop any indexes that might have been created for these tables
DROP INDEX IF EXISTS idx_leads_slug;
DROP INDEX IF EXISTS idx_simulations_slug;
