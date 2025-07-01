
-- Create the "Surroga al mio mutuo" form
INSERT INTO public.forms (slug, title, description, form_type, is_active, version) 
VALUES (
  'surroga',
  'Surroga al mio mutuo',
  'Form per la surroga del mutuo esistente',
  'surroga',
  true,
  1
);

-- Get the form ID for the surroga form to use in form_blocks
-- Insert the introduzione block for surroga form
INSERT INTO public.form_blocks (form_id, block_data, sort_order)
VALUES (
  (SELECT id FROM public.forms WHERE slug = 'surroga'),
  '{
    "block_number": "1",
    "block_id": "introduzione",
    "title": "Introduzione",
    "priority": 100,
    "default_active": true,
    "questions": [
      {
        "question_number": "1.1",
        "question_id": "tipo_surroga",
        "question_text": "Voglio fare una surroga per {{placeholder1}}",
        "leads_to_placeholder_priority": "placeholder1",
        "placeholders": {
          "placeholder1": {
            "type": "select",
            "options": [
              {
                "id": "risparmio",
                "label": "risparmiare sui costi",
                "leads_to": "finalita_surroga"
              },
              {
                "id": "liquidita",
                "label": "ottenere liquidità aggiuntiva",
                "leads_to": "finalita_surroga"
              },
              {
                "id": "condizioni",
                "label": "migliorare le condizioni",
                "leads_to": "finalita_surroga"
              }
            ]
          }
        }
      },
      {
        "question_number": "1.2",
        "question_id": "finalita_surroga",
        "question_text": "Il mio obiettivo principale è {{placeholder1}}",
        "leads_to_placeholder_priority": "placeholder1",
        "placeholders": {
          "placeholder1": {
            "type": "select",
            "options": [
              {
                "id": "tasso_fisso",
                "label": "passare a tasso fisso",
                "leads_to": "next_block"
              },
              {
                "id": "tasso_variabile", 
                "label": "passare a tasso variabile",
                "leads_to": "next_block"
              },
              {
                "id": "durata_maggiore",
                "label": "aumentare la durata",
                "leads_to": "next_block"
              },
              {
                "id": "durata_minore",
                "label": "diminuire la durata", 
                "leads_to": "next_block"
              }
            ]
          }
        }
      }
    ]
  }',
  0
);

-- Insert the conclusione block for surroga form  
INSERT INTO public.form_blocks (form_id, block_data, sort_order)
VALUES (
  (SELECT id FROM public.forms WHERE slug = 'surroga'),
  '{
    "block_number": "10",
    "block_id": "conclusione",
    "title": "Conclusione",
    "priority": 2500,
    "default_active": true,
    "questions": [
      {
        "question_number": "10.1",
        "question_id": "debito_residuo",
        "question_text": "Il debito residuo del mio mutuo è di {{placeholder1}} euro",
        "leads_to_placeholder_priority": "placeholder1",
        "placeholders": {
          "placeholder1": {
            "type": "input",
            "input_type": "number",
            "placeholder_label": "importo",
            "leads_to": "rata_attuale",
            "input_validation": "euro"
          }
        }
      },
      {
        "question_number": "10.2", 
        "question_id": "rata_attuale",
        "question_text": "Attualmente pago {{placeholder1}} euro al mese",
        "leads_to_placeholder_priority": "placeholder1",
        "placeholders": {
          "placeholder1": {
            "type": "input",
            "input_type": "number",
            "placeholder_label": "rata mensile",
            "leads_to": "form_summary",
            "input_validation": "euro"
          }
        }
      },
      {
        "question_number": "10.3",
        "question_id": "form_summary",
        "question_text": "Riepilogo della surroga",
        "endOfForm": true,
        "leads_to_placeholder_priority": "placeholder1",
        "placeholders": {
          "placeholder1": {
            "type": "input",
            "input_type": "text",
            "placeholder_label": "Questo campo non verrà mostrato",
            "leads_to": "next_block",
            "input_validation": "free_text"
          }
        }
      }
    ]
  }',
  1
);
