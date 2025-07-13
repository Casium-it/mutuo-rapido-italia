-- Step 1: Create enum type for save method
CREATE TYPE save_method_type AS ENUM ('auto-save', 'manual-save', 'completed-save');

-- Step 2: Add the new save_method column
ALTER TABLE saved_simulations 
ADD COLUMN save_method save_method_type;

-- Step 3: Migrate existing data based on business logic
-- Auto-saves: is_auto_save = true → 'auto-save'
-- Manual saves with contact info: is_auto_save = false AND (name IS NOT NULL OR phone IS NOT NULL OR email IS NOT NULL) → 'manual-save'
-- Completed saves: is_auto_save = false AND name IS NOT NULL AND phone IS NOT NULL AND email IS NOT NULL AND percentage = 100 → 'completed-save'
UPDATE saved_simulations 
SET save_method = CASE 
  WHEN is_auto_save = true THEN 'auto-save'::save_method_type
  WHEN is_auto_save = false AND name IS NOT NULL AND phone IS NOT NULL AND email IS NOT NULL AND percentage = 100 THEN 'completed-save'::save_method_type
  WHEN is_auto_save = false THEN 'manual-save'::save_method_type
  ELSE 'auto-save'::save_method_type  -- Default fallback
END;

-- Step 4: Make the column NOT NULL after data migration
ALTER TABLE saved_simulations 
ALTER COLUMN save_method SET NOT NULL;

-- Step 5: Update the existing index to use save_method instead of is_auto_save
DROP INDEX IF EXISTS idx_saved_simulations_auto_save;
CREATE INDEX idx_saved_simulations_save_method 
ON saved_simulations(simulation_id, save_method, expires_at);

-- Step 6: Add index for save_method filtering (for admin queries)
CREATE INDEX idx_saved_simulations_save_method_created 
ON saved_simulations(save_method, created_at DESC);

-- Step 7: Drop the old is_auto_save column
ALTER TABLE saved_simulations 
DROP COLUMN is_auto_save;