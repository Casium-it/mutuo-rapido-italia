-- Update the log_pratica_updates function to log ALL field changes
CREATE OR REPLACE FUNCTION public.log_pratica_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Status pratica modificato',
      to_jsonb(OLD.status), to_jsonb(NEW.status), NEW.id
    );
  END IF;
  
  -- Log importo_richiesto changes
  IF OLD.importo_richiesto IS DISTINCT FROM NEW.importo_richiesto THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Importo richiesto modificato',
      to_jsonb(OLD.importo_richiesto), to_jsonb(NEW.importo_richiesto), NEW.id
    );
  END IF;

  -- Log durata_anni changes
  IF OLD.durata_anni IS DISTINCT FROM NEW.durata_anni THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Durata anni modificata',
      to_jsonb(OLD.durata_anni), to_jsonb(NEW.durata_anni), NEW.id
    );
  END IF;

  -- Log tasso_interesse_atteso changes
  IF OLD.tasso_interesse_atteso IS DISTINCT FROM NEW.tasso_interesse_atteso THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Tasso interesse atteso modificato',
      to_jsonb(OLD.tasso_interesse_atteso), to_jsonb(NEW.tasso_interesse_atteso), NEW.id
    );
  END IF;

  -- Log tipo_tasso changes
  IF OLD.tipo_tasso IS DISTINCT FROM NEW.tipo_tasso THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Tipo tasso modificato',
      to_jsonb(OLD.tipo_tasso), to_jsonb(NEW.tipo_tasso), NEW.id
    );
  END IF;

  -- Log anticipo changes
  IF OLD.anticipo IS DISTINCT FROM NEW.anticipo THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Anticipo modificato',
      to_jsonb(OLD.anticipo), to_jsonb(NEW.anticipo), NEW.id
    );
  END IF;

  -- Log valore_immobile changes
  IF OLD.valore_immobile IS DISTINCT FROM NEW.valore_immobile THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Valore immobile modificato',
      to_jsonb(OLD.valore_immobile), to_jsonb(NEW.valore_immobile), NEW.id
    );
  END IF;

  -- Log tipo_immobile changes
  IF OLD.tipo_immobile IS DISTINCT FROM NEW.tipo_immobile THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Tipo immobile modificato',
      to_jsonb(OLD.tipo_immobile), to_jsonb(NEW.tipo_immobile), NEW.id
    );
  END IF;

  -- Log destinazione_uso changes
  IF OLD.destinazione_uso IS DISTINCT FROM NEW.destinazione_uso THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Destinazione uso modificata',
      to_jsonb(OLD.destinazione_uso), to_jsonb(NEW.destinazione_uso), NEW.id
    );
  END IF;

  -- Log reddito_mensile_netto changes
  IF OLD.reddito_mensile_netto IS DISTINCT FROM NEW.reddito_mensile_netto THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Reddito mensile netto modificato',
      to_jsonb(OLD.reddito_mensile_netto), to_jsonb(NEW.reddito_mensile_netto), NEW.id
    );
  END IF;

  -- Log spese_mensili changes
  IF OLD.spese_mensili IS DISTINCT FROM NEW.spese_mensili THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Spese mensili modificate',
      to_jsonb(OLD.spese_mensili), to_jsonb(NEW.spese_mensili), NEW.id
    );
  END IF;

  -- Log altri_finanziamenti changes
  IF OLD.altri_finanziamenti IS DISTINCT FROM NEW.altri_finanziamenti THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Altri finanziamenti modificati',
      to_jsonb(OLD.altri_finanziamenti), to_jsonb(NEW.altri_finanziamenti), NEW.id
    );
  END IF;

  -- Log banca_preferita changes
  IF OLD.banca_preferita IS DISTINCT FROM NEW.banca_preferita THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Banca preferita modificata',
      to_jsonb(OLD.banca_preferita), to_jsonb(NEW.banca_preferita), NEW.id
    );
  END IF;

  -- Log consulente_banca changes
  IF OLD.consulente_banca IS DISTINCT FROM NEW.consulente_banca THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Consulente banca modificato',
      to_jsonb(OLD.consulente_banca), to_jsonb(NEW.consulente_banca), NEW.id
    );
  END IF;

  -- Log data_richiesta changes
  IF OLD.data_richiesta IS DISTINCT FROM NEW.data_richiesta THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Data richiesta modificata',
      to_jsonb(OLD.data_richiesta), to_jsonb(NEW.data_richiesta), NEW.id
    );
  END IF;

  -- Log data_prevista_erogazione changes
  IF OLD.data_prevista_erogazione IS DISTINCT FROM NEW.data_prevista_erogazione THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Data prevista erogazione modificata',
      to_jsonb(OLD.data_prevista_erogazione), to_jsonb(NEW.data_prevista_erogazione), NEW.id
    );
  END IF;

  -- Log priorita changes
  IF OLD.priorita IS DISTINCT FROM NEW.priorita THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Priorità modificata',
      to_jsonb(OLD.priorita), to_jsonb(NEW.priorita), NEW.id
    );
  END IF;

  -- Log note_interne changes
  IF OLD.note_interne IS DISTINCT FROM NEW.note_interne THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_pratica_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'field_updated', 
      'Note interne modificate',
      to_jsonb(OLD.note_interne), to_jsonb(NEW.note_interne), NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$function$