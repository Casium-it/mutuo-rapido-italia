-- Add temporary column for mediatore assignment
ALTER TABLE public.form_submissions 
ADD COLUMN mediatore_assegnato UUID REFERENCES public.profiles(id);

-- Migrate existing mediatore data by matching names
UPDATE public.form_submissions 
SET mediatore_assegnato = (
  SELECT p.id 
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'mediatore'
  AND (
    LOWER(p.first_name) = LOWER(form_submissions.mediatore) OR
    LOWER(CONCAT(p.first_name, ' ', p.last_name)) = LOWER(form_submissions.mediatore) OR
    LOWER(p.last_name) = LOWER(form_submissions.mediatore)
  )
  LIMIT 1
)
WHERE mediatore IS NOT NULL;