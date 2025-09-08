-- Create trigger to automatically add note when mediatore is assigned
CREATE OR REPLACE FUNCTION public.create_assignment_note()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if mediatore was just assigned (either new assignment or changed)
  IF (OLD.mediatore IS NULL OR OLD.mediatore != NEW.mediatore) AND NEW.mediatore IS NOT NULL THEN
    -- Create automatic note for assignment
    INSERT INTO public.lead_notes (
      submission_id,
      mediatore_id,
      titolo,
      contenuto,
      tipo,
      is_private
    ) VALUES (
      NEW.id,
      NEW.mediatore,
      'Mediatore Assegnato',
      'Mediatore assegnato automaticamente al lead.',
      'sistema',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic note creation on mediatore assignment
CREATE TRIGGER create_assignment_note_trigger
AFTER UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.create_assignment_note();