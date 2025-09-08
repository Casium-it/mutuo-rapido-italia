-- Create documents table for pratiche
CREATE TABLE public.pratica_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pratica_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.pratica_documents 
ADD CONSTRAINT fk_pratica_documents_pratica 
FOREIGN KEY (pratica_id) REFERENCES public.pratiche(id) ON DELETE CASCADE;

ALTER TABLE public.pratica_documents 
ADD CONSTRAINT fk_pratica_documents_user 
FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

-- Enable RLS
ALTER TABLE public.pratica_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pratica_documents
CREATE POLICY "Admins can manage all documents" 
ON public.pratica_documents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mediatori can manage documents for their pratiche" 
ON public.pratica_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.pratiche p 
    WHERE p.id = pratica_documents.pratica_id 
    AND p.mediatore_id = auth.uid()
  )
);

-- Update activity_type enum to include document operations
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'document_added';
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'document_removed';

-- Create trigger function for document activity logging
CREATE OR REPLACE FUNCTION public.log_document_activities()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_id_val UUID;
  mediatore_id_val UUID;
BEGIN
  -- Get submission_id and mediatore_id from the related pratica
  SELECT p.submission_id, p.mediatore_id 
  INTO submission_id_val, mediatore_id_val
  FROM public.pratiche p 
  WHERE p.id = COALESCE(NEW.pratica_id, OLD.pratica_id);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      new_value, metadata
    ) VALUES (
      submission_id_val, NEW.uploaded_by, 'document_added',
      'Documento aggiunto: ' || NEW.filename,
      to_jsonb(NEW), 
      jsonb_build_object('pratica_id', NEW.pratica_id, 'file_size', NEW.file_size)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.lead_activity_log (
      submission_id, mediatore_id, activity_type, description,
      old_value, metadata
    ) VALUES (
      submission_id_val, OLD.uploaded_by, 'document_removed',
      'Documento rimosso: ' || OLD.filename,
      to_jsonb(OLD),
      jsonb_build_object('pratica_id', OLD.pratica_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for document activity logging
CREATE TRIGGER document_activity_log_trigger
  AFTER INSERT OR DELETE ON public.pratica_documents
  FOR EACH ROW EXECUTE FUNCTION public.log_document_activities();

-- Create updated_at trigger for pratica_documents
CREATE TRIGGER update_pratica_documents_updated_at
  BEFORE UPDATE ON public.pratica_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for pratica documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pratica-documents', 'pratica-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for pratica documents
CREATE POLICY "Admins can access all pratica documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'pratica-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mediatori can access documents for their pratiche" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'pratica-documents' AND
  EXISTS (
    SELECT 1 FROM public.pratica_documents pd
    JOIN public.pratiche p ON p.id = pd.pratica_id
    WHERE pd.file_path = storage.objects.name 
    AND p.mediatore_id = auth.uid()
  )
);