-- First, let's check what save_method_type values are allowed
-- and create the generate_simulation_id function if needed

-- Create generate_simulation_id function (if it doesn't exist)
CREATE OR REPLACE FUNCTION generate_simulation_id(created_date timestamp with time zone DEFAULT now())
RETURNS text AS $$
BEGIN
  RETURN 'SIM_' || to_char(created_date, 'YYYYMMDD') || '_' || upper(substring(md5(random()::text) from 1 for 8));
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