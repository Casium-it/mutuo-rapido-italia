
-- Updated migration to include ALL old form submissions, not just complete ones
-- This will migrate all 150 legacy submissions regardless of contact data completeness

-- Function to generate simulation IDs in the correct format
CREATE OR REPLACE FUNCTION generate_simulation_id(created_timestamp timestamptz)
RETURNS text AS $$
DECLARE
  timestamp_ms bigint;
  random_suffix text;
BEGIN
  -- Convert timestamp to milliseconds since epoch
  timestamp_ms := EXTRACT(EPOCH FROM created_timestamp) * 1000;
  
  -- Generate 8-character random alphanumeric suffix
  random_suffix := upper(substring(md5(random()::text || random()::text) from 1 for 8));
  
  -- Return in format SIM-{timestamp}-{random}
  RETURN 'SIM-' || timestamp_ms::text || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- Function to reconstruct form_state from form_responses
CREATE OR REPLACE FUNCTION reconstruct_form_state(submission_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  responses_json jsonb := '{}';
  active_blocks text[];
  answered_questions text[];
  simulation_id_val text;
  form_state jsonb;
BEGIN
  -- Generate simulation ID for this submission
  SELECT generate_simulation_id(fs.created_at)
  INTO simulation_id_val
  FROM form_submissions fs
  WHERE fs.id = submission_id_param;
  
  -- Build responses object from form_responses
  SELECT jsonb_object_agg(
    fr.question_id,
    jsonb_build_object(
      CASE 
        WHEN fr.response_value ? 'placeholder_key' THEN fr.response_value->>'placeholder_key'
        ELSE 'default'
      END,
      CASE 
        WHEN fr.response_value ? 'value' THEN fr.response_value->'value'
        ELSE fr.response_value
      END
    )
  )
  INTO responses_json
  FROM form_responses fr
  WHERE fr.submission_id = submission_id_param;
  
  -- Get unique block_ids for activeBlocks
  SELECT array_agg(DISTINCT fr.block_id ORDER BY fr.block_id)
  INTO active_blocks
  FROM form_responses fr
  WHERE fr.submission_id = submission_id_param;
  
  -- Get all question_ids for answeredQuestions
  SELECT array_agg(fr.question_id ORDER BY fr.created_at)
  INTO answered_questions
  FROM form_responses fr
  WHERE fr.submission_id = submission_id_param;
  
  -- Build complete form_state
  form_state := jsonb_build_object(
    'simulationId', simulation_id_val,
    'sessionType', 'new',
    'formSlug', 'simulazione-mutuo',
    'activeBlocks', to_jsonb(active_blocks),
    'activeQuestion', jsonb_build_object(
      'block_id', 'conclusione',
      'question_id', 'conclusione_finale'
    ),
    'responses', COALESCE(responses_json, '{}'),
    'answeredQuestions', to_jsonb(answered_questions),
    'isNavigating', false,
    'navigationHistory', '[]',
    'dynamicBlocks', '[]',
    'blockActivations', '{}',
    'completedBlocks', to_jsonb(active_blocks),
    'pendingRemovals', '[]'
  );
  
  RETURN form_state;
END;
$$ LANGUAGE plpgsql;

-- Updated migration function to include ALL submissions
CREATE OR REPLACE FUNCTION migrate_all_old_submissions()
RETURNS void AS $$
DECLARE
  submission_record RECORD;
  form_state_json jsonb;
  new_simulation_id text;
  new_resume_code text;
  expires_date timestamptz;
  submission_name text;
BEGIN
  -- Process ALL form_submissions that don't have corresponding saved_simulations
  -- Remove the strict matching and name/email filters
  FOR submission_record IN
    SELECT fs.*
    FROM form_submissions fs
    WHERE NOT EXISTS (
      SELECT 1 FROM saved_simulations ss 
      WHERE ss.form_state->>'simulationId' LIKE 'SIM-' || EXTRACT(EPOCH FROM fs.created_at)::bigint * 1000 || '-%'
    )
    ORDER BY fs.created_at
  LOOP
    -- Reconstruct form_state from form_responses
    SELECT reconstruct_form_state(submission_record.id) INTO form_state_json;
    
    -- Extract simulation_id from the reconstructed form_state
    new_simulation_id := form_state_json->>'simulationId';
    
    -- Generate resume code
    SELECT generate_resume_code() INTO new_resume_code;
    
    -- Set expiration date (90 days from creation)
    expires_date := submission_record.created_at + INTERVAL '90 days';
    
    -- Build name from available data, fallback to submission ID
    submission_name := COALESCE(
      NULLIF(TRIM(CONCAT(COALESCE(submission_record.first_name, ''), ' ', COALESCE(submission_record.last_name, ''))), ''),
      'Submission ' || LEFT(submission_record.id::text, 8)
    );
    
    -- Insert into saved_simulations
    INSERT INTO saved_simulations (
      simulation_id,
      name,
      phone,
      email,
      form_state,
      form_slug,
      percentage,
      expires_at,
      created_at,
      updated_at,
      save_method,
      resume_code,
      linked_form_id
    ) VALUES (
      new_simulation_id,
      submission_name,
      submission_record.phone_number,
      submission_record.email,
      form_state_json,
      'simulazione-mutuo',
      CASE 
        WHEN jsonb_array_length(form_state_json->'completedBlocks') > 0 THEN 100
        ELSE GREATEST(jsonb_array_length(form_state_json->'answeredQuestions') * 10, 10)
      END, -- Calculate percentage based on progress
      expires_date,
      submission_record.created_at,
      submission_record.created_at,
      'completed-save',
      new_resume_code,
      NULL
    );
    
    RAISE NOTICE 'Migrated submission % (%) to simulation %', submission_record.id, submission_name, new_simulation_id;
  END LOOP;
  
  RAISE NOTICE 'Migration of all submissions completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the updated migration
SELECT migrate_all_old_submissions();

-- Clean up helper functions
DROP FUNCTION IF EXISTS generate_simulation_id(timestamptz);
DROP FUNCTION IF EXISTS reconstruct_form_state(uuid);
DROP FUNCTION IF EXISTS migrate_all_old_submissions();
