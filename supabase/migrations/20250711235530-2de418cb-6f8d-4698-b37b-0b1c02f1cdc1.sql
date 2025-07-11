-- Add percentage column to saved_simulations table
ALTER TABLE public.saved_simulations 
ADD COLUMN percentage INTEGER NOT NULL DEFAULT 0;