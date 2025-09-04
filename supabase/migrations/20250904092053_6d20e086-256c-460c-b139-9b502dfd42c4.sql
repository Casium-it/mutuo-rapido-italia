-- Create question_ids table
CREATE TABLE public.question_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL UNIQUE,
  current_version INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_versions table for version history
CREATE TABLE public.question_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id_record UUID NOT NULL REFERENCES public.question_ids(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'select', 'input', 'MultiBlockManager', etc.
  placeholder_values JSONB, -- stores options/validation info
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id_record, version_number)
);

-- Enable RLS
ALTER TABLE public.question_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for question_ids
CREATE POLICY "Admins can manage question_ids" 
ON public.question_ids 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for question_versions
CREATE POLICY "Admins can manage question_versions" 
ON public.question_versions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to calculate if question is used
CREATE OR REPLACE FUNCTION public.is_question_used(question_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.form_blocks fb
    INNER JOIN public.forms f ON f.id = fb.form_id
    WHERE f.is_active = true
    AND fb.block_data::text LIKE '%"question_id":"' || question_id_param || '"%'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create trigger for updating updated_at
CREATE TRIGGER update_question_ids_updated_at
  BEFORE UPDATE ON public.question_ids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();