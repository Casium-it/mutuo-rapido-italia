
-- Remove foreign key constraints first
ALTER TABLE public.form_submissions DROP COLUMN IF EXISTS linked_token;

-- Drop indexes
DROP INDEX IF EXISTS idx_form_submissions_linked_token;
DROP INDEX IF EXISTS idx_webhook_logs_token;
DROP INDEX IF EXISTS idx_webhook_logs_event_type;
DROP INDEX IF EXISTS idx_linked_forms_token;
DROP INDEX IF EXISTS idx_linked_forms_expires_at;

-- Drop tables (this will cascade and remove related policies)
DROP TABLE IF EXISTS public.webhook_logs CASCADE;
DROP TABLE IF EXISTS public.linked_forms CASCADE;

-- Drop the token generation function
DROP FUNCTION IF EXISTS public.generate_linked_form_token();
