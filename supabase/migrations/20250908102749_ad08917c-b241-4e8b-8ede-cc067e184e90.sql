-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.pratica_documents;
DROP POLICY IF EXISTS "Mediatori can manage documents for their pratiche" ON public.pratica_documents;

-- Create corrected RLS policies for pratica_documents
CREATE POLICY "Admins can manage all documents" 
ON public.pratica_documents 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mediatori can manage documents for their pratiche" 
ON public.pratica_documents 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pratiche p 
    WHERE p.id = pratica_documents.pratica_id 
    AND p.mediatore_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pratiche p 
    WHERE p.id = pratica_documents.pratica_id 
    AND p.mediatore_id = auth.uid()
  )
);

-- Also fix storage policies
DROP POLICY IF EXISTS "Admins can access all pratica documents" ON storage.objects;
DROP POLICY IF EXISTS "Mediatori can access documents for their pratiche" ON storage.objects;

CREATE POLICY "Admins can access all pratica documents" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (bucket_id = 'pratica-documents' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'pratica-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mediatori can access documents for their pratiche" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (
  bucket_id = 'pratica-documents' AND
  EXISTS (
    SELECT 1 FROM public.pratica_documents pd
    JOIN public.pratiche p ON p.id = pd.pratica_id
    WHERE pd.file_path = storage.objects.name 
    AND p.mediatore_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'pratica-documents' AND
  EXISTS (
    SELECT 1 FROM public.pratiche p
    WHERE p.mediatore_id = auth.uid()
  )
);