-- Add assigned_to and reminder fields to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN assigned_to uuid REFERENCES public.admin_notification_settings(id),
ADD COLUMN reminder boolean NOT NULL DEFAULT false;