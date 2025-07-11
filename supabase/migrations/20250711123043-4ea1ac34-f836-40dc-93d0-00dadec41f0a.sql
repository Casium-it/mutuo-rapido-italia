
-- Phase 1: Database Schema Updates

-- Add linked_form column to saved_simulations table
ALTER TABLE public.saved_simulations 
ADD COLUMN linked_form text DEFAULT NULL;

-- Remove all existing RLS policies from saved_simulations table
DROP POLICY IF EXISTS "Allow public insert to saved_simulations" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow SELECT with resume code" ON public.saved_simulations;
DROP POLICY IF EXISTS "Allow UPDATE with resume code" ON public.saved_simulations;

-- Disable Row Level Security entirely
ALTER TABLE public.saved_simulations DISABLE ROW LEVEL SECURITY;

-- Create new policies that only allow service role access
CREATE POLICY "Service role can manage saved_simulations" 
  ON public.saved_simulations 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Re-enable RLS with service role only access
ALTER TABLE public.saved_simulations ENABLE ROW LEVEL SECURITY;

-- Add index for linked_form column for future use
CREATE INDEX IF NOT EXISTS idx_saved_simulations_linked_form 
ON public.saved_simulations(linked_form);
