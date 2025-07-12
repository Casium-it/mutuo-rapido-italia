-- Phase 1: Add simulation_id column to saved_simulations table
ALTER TABLE public.saved_simulations 
ADD COLUMN simulation_id TEXT UNIQUE;

-- Create unique index for performance
CREATE UNIQUE INDEX idx_saved_simulations_simulation_id 
ON public.saved_simulations(simulation_id) 
WHERE simulation_id IS NOT NULL;

-- Generate simulation IDs for existing records (migration)
UPDATE public.saved_simulations 
SET simulation_id = 'SIM-' || EXTRACT(EPOCH FROM created_at)::bigint || '-' || SUBSTRING(MD5(id::text), 1, 8)
WHERE simulation_id IS NULL;