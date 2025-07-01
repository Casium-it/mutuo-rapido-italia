
-- Step 1: Create the trigger function that handles admin notifications
CREATE OR REPLACE FUNCTION public.notify_admins_on_contact_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  form_data JSONB;
  age_value TEXT;
  province_value TEXT;
  consultation_text TEXT;
BEGIN
  -- Only proceed if phone_number was added (updated from NULL to a value)
  -- This indicates the user has provided contact details
  IF OLD.phone_number IS NULL AND NEW.phone_number IS NOT NULL THEN
    
    -- Extract age and province from form responses
    SELECT 
      COALESCE(
        (SELECT response_value->>'value' 
         FROM form_responses 
         WHERE submission_id = NEW.id 
           AND question_id = 'age' 
         LIMIT 1), 
        'Non specificato'
      ) AS age,
      COALESCE(
        (SELECT response_value->>'value' 
         FROM form_responses 
         WHERE submission_id = NEW.id 
           AND question_id = 'province' 
         LIMIT 1), 
        'Non specificato'
      ) AS province
    INTO age_value, province_value;
    
    -- Format consultation request
    consultation_text := CASE 
      WHEN NEW.consulting = true THEN 'Si ✅'
      ELSE 'No ❌'
    END;
    
    -- Loop through enabled admin notification settings
    FOR admin_record IN 
      SELECT admin_name, phone_number 
      FROM admin_notification_settings 
      WHERE notifications_enabled = true
      ORDER BY created_at ASC
    LOOP
      -- Prepare the payload for the edge function
      form_data := jsonb_build_object(
        'campaignName', 'avvisoadmin1',
        'destination', admin_record.phone_number,
        'userName', admin_record.admin_name,
        'source', 'admin-notification',
        'templateParams', jsonb_build_array(
          COALESCE(NEW.first_name, 'Sconosciuto'),
          age_value,
          province_value,
          consultation_text,
          NEW.phone_number
        )
      );
      
      -- Call the edge function via pg_net (non-blocking)
      PERFORM net.http_post(
        url := 'https://jegdbtznkwzpqntzzlvf.supabase.co/functions/v1/send-aisensy-message',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
        ),
        body := form_data
      );
      
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 2: Create the trigger on form_submissions table
DROP TRIGGER IF EXISTS trigger_notify_admins_on_contact ON public.form_submissions;

CREATE TRIGGER trigger_notify_admins_on_contact
  AFTER UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_contact_submission();

-- Step 3: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_admins_on_contact_submission() TO service_role;

-- Step 4: Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
