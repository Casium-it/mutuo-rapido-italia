-- Add foreign key relationship for form_id
ALTER TABLE public.leads 
ADD CONSTRAINT fk_leads_form_id 
FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE SET NULL;

-- Remove all leads without phone number
DELETE FROM public.leads WHERE phone_number IS NULL OR phone_number = '';

-- Add indexes for better performance after cleanup
CREATE INDEX idx_leads_phone_number_not_null ON public.leads (phone_number);

-- Report: Check phone number matches between form_submissions and leads
-- This query will show the matching analysis
WITH submission_phone_analysis AS (
  SELECT 
    fs.id as submission_id,
    fs.phone_number as submission_phone,
    l.id as lead_id,
    l.phone_number as lead_phone,
    CASE 
      WHEN l.phone_number = fs.phone_number THEN 'MATCH'
      WHEN l.phone_number IS NULL THEN 'LEAD_NO_PHONE'
      WHEN fs.phone_number IS NULL THEN 'SUBMISSION_NO_PHONE'
      ELSE 'NO_MATCH'
    END as match_status
  FROM public.form_submissions fs
  LEFT JOIN public.leads l ON l.source_type = 'form_submission' AND l.source_id = fs.id
),
match_summary AS (
  SELECT 
    match_status,
    COUNT(*) as count
  FROM submission_phone_analysis
  GROUP BY match_status
)
SELECT 
  match_status as "Stato Match",
  count as "Numero",
  ROUND((count * 100.0 / (SELECT SUM(count) FROM match_summary)), 2) as "Percentuale"
FROM match_summary
ORDER BY count DESC;