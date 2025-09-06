-- Drop the existing table if it exists
DROP TABLE IF EXISTS public.ai_prompts;

-- Create ai_prompts table with proper message structure
CREATE TABLE public.ai_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {role: 'system'|'user'|'assistant', content: string}
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  variables TEXT[] DEFAULT '{}', -- Array of variable names that can be replaced in messages
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage AI prompts" 
ON public.ai_prompts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_prompts_updated_at
  BEFORE UPDATE ON public.ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default AI Notes Generation prompt
INSERT INTO public.ai_prompts (name, description, messages, variables) VALUES (
  'AI Notes Generation',
  'Generate structured notes from form submission data',
  '[
    {
      "role": "system",
      "content": "You are an AI assistant that helps mortgage brokers by analyzing form submission data and generating structured, human-readable notes. Your task is to process raw form data and create concise, professional notes that highlight key information about the lead."
    },
    {
      "role": "user", 
      "content": "Please analyze this form submission and generate structured notes:\n\nLead Info: {{leadInfo}}\nForm Data: {{formData}}\nExisting Notes: {{existingNotes}}\n\nGenerate comprehensive notes in Italian that summarize the key information."
    }
  ]'::jsonb,
  ARRAY['leadInfo', 'formData', 'existingNotes']
);