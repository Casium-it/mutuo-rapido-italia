-- Add form_id column to form_submissions with foreign key constraint
ALTER TABLE public.form_submissions 
ADD COLUMN form_id UUID REFERENCES public.forms(id);

-- Update existing records to link to the correct form
-- Match form_type in submissions to slug in forms
UPDATE public.form_submissions 
SET form_id = forms.id 
FROM public.forms 
WHERE forms.slug = form_submissions.form_type;

-- For any submissions that don't match, link them to the simulazione-mutuo form as fallback
UPDATE public.form_submissions 
SET form_id = (SELECT id FROM public.forms WHERE slug = 'simulazione-mutuo' LIMIT 1)
WHERE form_id IS NULL;