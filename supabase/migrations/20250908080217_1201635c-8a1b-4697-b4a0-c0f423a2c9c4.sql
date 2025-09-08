-- Create enums for better data consistency
CREATE TYPE pratica_status AS ENUM (
  'bozza',
  'in_lavorazione', 
  'documenti_richiesti',
  'valutazione_banca',
  'approvata',
  'rifiutata',
  'erogata',
  'sospesa'
);

CREATE TYPE interest_type AS ENUM (
  'fisso',
  'variabile',
  'misto'
);

CREATE TYPE note_type AS ENUM (
  'generale',
  'telefonata',
  'incontro',
  'documentazione',
  'banca',
  'cliente',
  'urgente'
);

CREATE TYPE activity_type AS ENUM (
  'status_change',
  'note_added',
  'note_updated',
  'note_deleted',
  'pratica_created',
  'pratica_updated',
  'field_updated',
  'document_added',
  'document_removed',
  'reminder_set',
  'contact_made'
);

-- Create pratiche table for mortgage details
CREATE TABLE public.pratiche (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  mediatore_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Mortgage details
  importo_richiesto DECIMAL(12,2),
  durata_anni INTEGER,
  tasso_interesse_atteso DECIMAL(5,4),
  tipo_tasso interest_type DEFAULT 'fisso',
  anticipo DECIMAL(12,2),
  
  -- Property details
  valore_immobile DECIMAL(12,2),
  tipo_immobile TEXT,
  destinazione_uso TEXT, -- prima casa, seconda casa, investimento
  
  -- Client details
  reddito_mensile_netto DECIMAL(10,2),
  spese_mensili DECIMAL(10,2),
  altri_finanziamenti DECIMAL(12,2),
  
  -- Process details
  banca_preferita TEXT,
  consulente_banca TEXT,
  data_richiesta DATE,
  data_prevista_erogazione DATE,
  
  -- Status and tracking
  status pratica_status DEFAULT 'bozza',
  priorita INTEGER DEFAULT 1 CHECK (priorita BETWEEN 1 AND 5),
  note_interne TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(submission_id)
);

-- Create lead_notes table for structured notes
CREATE TABLE public.lead_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  mediatore_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  titolo TEXT NOT NULL,
  contenuto TEXT NOT NULL,
  tipo note_type DEFAULT 'generale',
  
  -- Additional metadata
  is_important BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false, -- private to mediatore vs visible to admin
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_activity_log table for comprehensive tracking
CREATE TABLE public.lead_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  mediatore_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  activity_type activity_type NOT NULL,
  description TEXT NOT NULL,
  
  -- Flexible data storage for different activity types
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}',
  
  -- Reference to related objects
  related_note_id UUID REFERENCES public.lead_notes(id) ON DELETE SET NULL,
  related_pratica_id UUID REFERENCES public.pratiche(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pratiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pratiche
CREATE POLICY "Admins can manage all pratiche" 
ON public.pratiche FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Mediatori can manage their own pratiche" 
ON public.pratiche FOR ALL 
USING (mediatore_id = auth.uid());

-- RLS Policies for lead_notes  
CREATE POLICY "Admins can manage all notes" 
ON public.lead_notes FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Mediatori can manage their own notes" 
ON public.lead_notes FOR ALL 
USING (mediatore_id = auth.uid());

CREATE POLICY "Admins can view all notes including private" 
ON public.lead_notes FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Mediatori can view non-private notes from other mediatori" 
ON public.lead_notes FOR SELECT 
USING (
  mediatore_id = auth.uid() OR 
  (has_role(auth.uid(), 'mediatore') AND is_private = false)
);

-- RLS Policies for lead_activity_log
CREATE POLICY "Admins can manage all activity logs" 
ON public.lead_activity_log FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Mediatori can manage their own activity logs" 
ON public.lead_activity_log FOR ALL 
USING (mediatore_id = auth.uid());

CREATE POLICY "Mediatori can view activity logs for their leads" 
ON public.lead_activity_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.form_submissions fs 
    WHERE fs.id = lead_activity_log.submission_id 
    AND fs.mediatore = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_pratiche_submission_id ON public.pratiche(submission_id);
CREATE INDEX idx_pratiche_mediatore_id ON public.pratiche(mediatore_id);
CREATE INDEX idx_pratiche_status ON public.pratiche(status);
CREATE INDEX idx_pratiche_updated_at ON public.pratiche(updated_at);

CREATE INDEX idx_lead_notes_submission_id ON public.lead_notes(submission_id);
CREATE INDEX idx_lead_notes_mediatore_id ON public.lead_notes(mediatore_id);
CREATE INDEX idx_lead_notes_tipo ON public.lead_notes(tipo);
CREATE INDEX idx_lead_notes_created_at ON public.lead_notes(created_at);

CREATE INDEX idx_activity_log_submission_id ON public.lead_activity_log(submission_id);
CREATE INDEX idx_activity_log_mediatore_id ON public.lead_activity_log(mediatore_id);
CREATE INDEX idx_activity_log_activity_type ON public.lead_activity_log(activity_type);
CREATE INDEX idx_activity_log_created_at ON public.lead_activity_log(created_at);

-- Create function to automatically create pratica when form_submission is assigned to mediatore
CREATE OR REPLACE FUNCTION public.create_pratica_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if mediatore was just assigned (either new assignment or changed)
  IF (OLD.mediatore IS NULL OR OLD.mediatore != NEW.mediatore) AND NEW.mediatore IS NOT NULL THEN
    -- Create pratica if it doesn't exist
    INSERT INTO public.pratiche (submission_id, mediatore_id)
    VALUES (NEW.id, NEW.mediatore)
    ON CONFLICT (submission_id) DO NOTHING;
    
    -- Log the activity
    INSERT INTO public.lead_activity_log (
      submission_id, 
      mediatore_id, 
      activity_type, 
      description,
      metadata
    ) VALUES (
      NEW.id,
      NEW.mediatore,
      'pratica_created',
      'Pratica creata automaticamente per assegnazione lead',
      jsonb_build_object('auto_created', true)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic pratica creation
CREATE TRIGGER trigger_create_pratica_on_assignment
  AFTER UPDATE OF mediatore ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_pratica_on_assignment();

-- Create function to log activity automatically
CREATE OR REPLACE FUNCTION public.log_pratica_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status != NEW.status THEN
    INSERT INTO public.lead_activity_log (
      submission_id,
      mediatore_id,
      activity_type,
      description,
      old_value,
      new_value,
      related_pratica_id
    ) VALUES (
      NEW.submission_id,
      NEW.mediatore_id,
      'status_change',
      'Status pratica modificato da ' || OLD.status || ' a ' || NEW.status,
      to_jsonb(OLD.status),
      to_jsonb(NEW.status),
      NEW.id
    );
  END IF;
  
  -- Log other important field changes
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for pratica updates logging
CREATE TRIGGER trigger_log_pratica_updates
  AFTER UPDATE ON public.pratiche
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pratica_updates();

-- Create function to log note activities
CREATE OR REPLACE FUNCTION public.log_note_activities()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      new_value, related_note_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'note_added',
      'Aggiunta nota: ' || NEW.titolo,
      to_jsonb(NEW), NEW.id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, new_value, related_note_id
    ) VALUES (
      NEW.submission_id, NEW.mediatore_id, 'note_updated',
      'Modificata nota: ' || NEW.titolo,
      to_jsonb(OLD), to_jsonb(NEW), NEW.id
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value
    ) VALUES (
      OLD.submission_id, OLD.mediatore_id, 'note_deleted',
      'Eliminata nota: ' || OLD.titolo,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for note activities
CREATE TRIGGER trigger_log_note_activities
  AFTER INSERT OR UPDATE OR DELETE ON public.lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_note_activities();

-- Create function to get activity timeline for a lead
CREATE OR REPLACE FUNCTION public.get_lead_timeline(lead_submission_id UUID)
RETURNS TABLE (
  id UUID,
  activity_type activity_type,
  description TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  mediatore_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.activity_type,
    al.description,
    al.old_value,
    al.new_value,
    al.metadata,
    COALESCE(p.first_name || ' ' || p.last_name, p.email) as mediatore_name,
    al.created_at
  FROM public.lead_activity_log al
  LEFT JOIN public.profiles p ON p.id = al.mediatore_id
  WHERE al.submission_id = lead_submission_id
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamps trigger
CREATE TRIGGER update_pratiche_updated_at
  BEFORE UPDATE ON public.pratiche
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();