-- Make contact fields optional for auto-saves in saved_simulations table
ALTER TABLE saved_simulations 
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL, 
ALTER COLUMN email DROP NOT NULL;

-- Add auto-save flag to distinguish save types
ALTER TABLE saved_simulations 
ADD COLUMN is_auto_save BOOLEAN DEFAULT false;

-- Add composite index for efficient auto-save queries
CREATE INDEX idx_saved_simulations_auto_save 
ON saved_simulations(simulation_id, is_auto_save, expires_at);