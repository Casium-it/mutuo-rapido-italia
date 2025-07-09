
-- Create enum type for completion behavior
CREATE TYPE public.completion_behavior_type AS ENUM ('form-completed', 'form-completed-redirect');

-- Add completion_behavior column to forms table with default value
ALTER TABLE public.forms 
ADD COLUMN completion_behavior completion_behavior_type NOT NULL DEFAULT 'form-completed';

-- Add comment to document the column
COMMENT ON COLUMN public.forms.completion_behavior IS 'Defines how the form should behave upon completion';
