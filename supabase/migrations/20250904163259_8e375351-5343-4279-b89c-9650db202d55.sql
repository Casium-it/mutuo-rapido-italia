-- Create storage bucket for temporary PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-pdfs', 
  'temp-pdfs', 
  true, 
  10485760, -- 10MB limit
  ARRAY['application/pdf']
);

-- Create RLS policies for temp-pdfs bucket
CREATE POLICY "Public read access for temp-pdfs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'temp-pdfs');

CREATE POLICY "Service role can upload temp-pdfs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'temp-pdfs' AND auth.role() = 'service_role');

CREATE POLICY "Service role can delete temp-pdfs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'temp-pdfs' AND auth.role() = 'service_role');