
-- Step 1: Drop the trigger first
DROP TRIGGER IF EXISTS trigger_notify_admins_on_contact ON public.form_submissions;

-- Step 2: Drop the trigger function
DROP FUNCTION IF EXISTS public.notify_admins_on_contact_submission();

-- Step 3: Revoke permissions (optional, since we're dropping the function anyway)
-- REVOKE EXECUTE ON FUNCTION public.notify_admins_on_contact_submission() FROM service_role;

-- Note: We're not dropping pg_net extension as it might be used by other parts of the system
-- If you want to drop it completely, uncomment the line below:
-- DROP EXTENSION IF EXISTS pg_net;
