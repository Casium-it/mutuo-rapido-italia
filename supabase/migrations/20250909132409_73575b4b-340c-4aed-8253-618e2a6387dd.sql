-- Update existing form_submissions with gomutuo_service = 'consulenza' 
-- for submissions that have the gomutuo_service question answered as 'consulenza'

UPDATE public.form_submissions 
SET gomutuo_service = 'consulenza'
WHERE id IN (
  SELECT DISTINCT fr.submission_id 
  FROM public.form_responses fr
  WHERE fr.question_id = 'gomutuo_service'
  AND (
    fr.response_value->>'default' = 'consulenza' OR
    fr.response_value->>'placeholder1' = 'consulenza' OR
    fr.response_value::text ILIKE '%consulenza%'
  )
);

-- Update existing form_submissions with gomutuo_service = 'simple_simulation'
-- for submissions that have the gomutuo_service question answered as 'simple_simulation'

UPDATE public.form_submissions 
SET gomutuo_service = 'simple_simulation'
WHERE id IN (
  SELECT DISTINCT fr.submission_id 
  FROM public.form_responses fr
  WHERE fr.question_id = 'gomutuo_service'
  AND (
    fr.response_value->>'default' = 'simple_simulation' OR
    fr.response_value->>'placeholder1' = 'simple_simulation' OR
    fr.response_value::text ILIKE '%simple_simulation%'
  )
);