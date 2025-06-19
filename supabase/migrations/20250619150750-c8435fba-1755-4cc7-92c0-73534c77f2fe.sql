
-- Create ENUM for lead status
CREATE TYPE public.lead_status AS ENUM (
  'not_contacted',
  'first_contact', 
  'advanced_conversations',
  'converted',
  'rejected'
);

-- Add lead management columns to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN notes TEXT,
ADD COLUMN lead_status public.lead_status DEFAULT 'not_contacted';
