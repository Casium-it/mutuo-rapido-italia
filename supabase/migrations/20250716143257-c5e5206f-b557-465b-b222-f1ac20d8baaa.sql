-- Add ultimo_contatto and prossimo_contatto fields to form_submissions
ALTER TABLE public.form_submissions 
ADD COLUMN ultimo_contatto TIMESTAMP WITH TIME ZONE,
ADD COLUMN prossimo_contatto TIMESTAMP WITH TIME ZONE;