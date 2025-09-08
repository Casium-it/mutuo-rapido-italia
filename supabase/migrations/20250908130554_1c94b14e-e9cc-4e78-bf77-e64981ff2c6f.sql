-- Drop the trigger that creates automatic assignment notes
DROP TRIGGER IF EXISTS create_assignment_note_trigger ON form_submissions;

-- Drop the function that creates automatic assignment notes
DROP FUNCTION IF EXISTS public.create_assignment_note();