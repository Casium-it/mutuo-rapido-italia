import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  FileText, 
  Image, 
  FileX,
  Eye,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface PraticaDocument {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface DocumentManagerProps {
  submissionId: string;
}

export function DocumentManager({ submissionId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<PraticaDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [praticaId, setPraticaId] = useState<string | null>(null);

  useEffect(() => {
    fetchPraticaId();
  }, [submissionId]);

  useEffect(() => {
    if (praticaId) {
      fetchDocuments();
    }
  }, [praticaId]);

  const fetchPraticaId = async () => {
    try {
      console.log('Fetching pratica ID for submission:', submissionId);
      const { data, error } = await supabase
        .from('pratiche')
        .select('id')
        .eq('submission_id', submissionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching pratica ID:', error);
        throw error;
      }
      
      if (data) {
        console.log('Found pratica ID:', data.id);
        setPraticaId(data.id);
      } else {
        console.log('No pratica found for this submission');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching pratica ID:', error);
      toast.error('Errore nel caricamento della pratica');
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!praticaId) return;
    
    try {
      console.log('Fetching documents for pratica:', praticaId);
      const { data, error } = await supabase
        .from('pratica_documents')
        .select('*')
        .eq('pratica_id', praticaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('Documents found:', data?.length || 0);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Errore nel caricamento dei documenti');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Il file è troppo grande. Dimensione massima: 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !praticaId) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${praticaId}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('pratica-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Save document record to database
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { error: dbError } = await supabase
        .from('pratica_documents')
        .insert({
          pratica_id: praticaId,
          filename: selectedFile.name,
          file_path: fileName,
          file_size: selectedFile.size,
          content_type: selectedFile.type,
          uploaded_by: user.user.id
        });

      if (dbError) throw dbError;

      toast.success('Documento caricato con successo');
      setSelectedFile(null);
      fetchDocuments();
      
      // Reset file input
      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Errore nel caricamento del documento');
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (doc: PraticaDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('pratica-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Errore nel download del documento');
    }
  };

  const deleteDocument = async (doc: PraticaDocument) => {
    if (!confirm(`Sei sicuro di voler eliminare "${doc.filename}"?`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pratica-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('pratica_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast.success('Documento eliminato con successo');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Errore nell\'eliminazione del documento');
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return Image;
    if (contentType.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!praticaId) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <FileX className="h-4 w-4" />
            <AlertDescription>
              Nessuna pratica associata a questo lead. Crea prima una pratica nella sezione "Pratica".
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Documenti ({documents.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Carica un nuovo documento
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="document-upload"
                  type="file"
                  onChange={handleFileSelect}
                  className="flex-1"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
                />
                <Button 
                  onClick={uploadDocument} 
                  disabled={!selectedFile || uploading}
                  className="min-w-[100px]"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Caricando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Carica
                    </div>
                  )}
                </Button>
              </div>
              {selectedFile && (
                <p className="text-xs text-gray-500 mt-2">
                  File selezionato: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Formati supportati: PDF, DOC, DOCX, TXT, JPG, PNG, XLS, XLSX (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        {documents.length === 0 ? (
          <Alert>
            <FileX className="h-4 w-4" />
            <AlertDescription>
              Nessun documento caricato per questa pratica.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.content_type);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {doc.content_type.split('/')[1].toUpperCase()}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                        className="h-8 w-8 p-0"
                        title="Scarica documento"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(doc)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Elimina documento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}