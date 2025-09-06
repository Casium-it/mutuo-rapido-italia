-- Update the AI prompts to ensure they have the correct variables
UPDATE ai_prompts 
SET variables = ARRAY['today_iso', 'lead_metadata', 'form_raw', 'notes_text']
WHERE name = 'Genera Note';

UPDATE ai_prompts 
SET variables = ARRAY['today_iso', 'lead_metadata', 'form_raw', 'notes_text', 'existing_notes']
WHERE name = 'Migliora Note';