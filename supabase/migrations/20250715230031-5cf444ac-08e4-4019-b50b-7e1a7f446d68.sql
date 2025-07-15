
-- Drop the migration function
DROP FUNCTION IF EXISTS public.migrate_leads_from_submissions();

-- Drop triggers
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;

-- Drop indexes
DROP INDEX IF EXISTS idx_leads_form_submission_id;
DROP INDEX IF EXISTS idx_leads_lead_status;
DROP INDEX IF EXISTS idx_leads_next_contact_date;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_lead_interactions_lead_id;
DROP INDEX IF EXISTS idx_lead_interactions_type;
DROP INDEX IF EXISTS idx_lead_interactions_scheduled_at;

-- Drop RLS policies for lead_interactions
DROP POLICY IF EXISTS "Admins can manage all lead interactions" ON public.lead_interactions;
DROP POLICY IF EXISTS "Service role can manage lead interactions" ON public.lead_interactions;

-- Drop RLS policies for leads
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Service role can manage leads" ON public.leads;

-- Drop tables (lead_interactions first due to foreign key constraint)
DROP TABLE IF EXISTS public.lead_interactions;
DROP TABLE IF EXISTS public.leads;
