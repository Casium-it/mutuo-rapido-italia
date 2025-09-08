-- Remove the trigger and function that creates pratica automatically on assignment
DROP TRIGGER IF EXISTS create_pratica_on_assignment_trigger ON form_submissions;
DROP FUNCTION IF EXISTS public.create_pratica_on_assignment();

-- Create function to generate assignment note
CREATE OR REPLACE FUNCTION public.create_assignment_note()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if mediatore was just assigned (either new assignment or changed)
  IF (OLD.mediatore IS NULL OR OLD.mediatore != NEW.mediatore) AND NEW.mediatore IS NOT NULL THEN
    -- Create assignment note
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
      'Lead assegnato automaticamente al mediatore',
      'sistema',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for assignment note creation
CREATE TRIGGER create_assignment_note_trigger
  AFTER UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_assignment_note();