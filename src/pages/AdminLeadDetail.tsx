import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Phone, FileText, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getQuestionTextWithStyledResponses } from '@/utils/formUtils';
import { generateSubmissionPDF, PDFSubmissionData } from '@/utils/pdfUtils';
import { LeadManagementCard } from '@/components/admin/LeadManagementCard';
import { LeadStatus } from '@/types/leadStatus';

interface FormSubmission {
  id: string;
  created_at: string;
  form_id: string | null;
  phone_number: string | null;
  consulting: boolean | null;
  user_identifier: string | null;
  metadata: any;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  notes: string | null;
  lead_status: LeadStatus;
  mediatore: string | null;
  ultimo_contatto: string | null;
  prossimo_contatto: string | null;
  form_title?: string;
}

interface FormResponse {
  id: string;
  question_id: string;
  question_text: string;
  block_id: string;
  response_value: any;
  created_at: string;
}

export default function AdminLeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchSubmissionDetails();
    }
  }, [leadId]);

  const fetchSubmissionDetails = async () => {
    try {
      // Fetch submission with form title
      const { data: submissionData, error: submissionError } = await supabase
        .from('form_submissions')
        .select(`
          *,
          forms!inner(
            title,
            slug
          )
        `)
        .eq('id', leadId)
        .single();

      if (submissionError) {
        console.error('Error fetching submission:', submissionError);
        toast({
          title: "Errore",
          description: "Lead non trovato",
          variant: "destructive"
        });
        navigate('/admin/leads');
        return;
      }

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('submission_id', leadId)
        .order('created_at', { ascending: true });

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle risposte",
          variant: "destructive"
        });
      }

      // Add form title to submission
      const submissionWithTitle = {
        ...submissionData,
        form_title: submissionData.forms?.title || 'Form sconosciuto'
      };

      setSubmission(submissionWithTitle);
      setResponses(responsesData || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeadUpdate = async (field: string, value: string) => {
    if (!submission) return;

    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ [field]: value })
        .eq('id', submission.id);

      if (error) {
        console.error('Error updating lead:', error);
        toast({
          title: "Errore",
          description: "Errore nell'aggiornamento del lead",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setSubmission(prev => prev ? { ...prev, [field]: value } : null);
      
      toast({
        title: "Successo",
        description: "Lead aggiornato con successo",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto nell'aggiornamento",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadPDF = async () => {
    if (!submission || !responses) {
      toast({
        title: "Errore",
        description: "Dati del lead non disponibili",
        variant: "destructive"
      });
      return;
    }

    setPdfLoading(true);
    try {
      const pdfData: PDFSubmissionData = {
        id: submission.id,
        created_at: submission.created_at,
        form_title: submission.form_title || 'Form sconosciuto',
        phone_number: submission.phone_number,
        consulting: submission.consulting,
        user_identifier: submission.user_identifier,
        metadata: submission.metadata,
        first_name: submission.first_name,
        last_name: submission.last_name,
        email: submission.email,
        notes: submission.notes,
        lead_status: submission.lead_status,
        mediatore: submission.mediatore,
        responses: responses
      };

      await generateSubmissionPDF(pdfData);
      
      toast({
        title: "PDF generato",
        description: "Il PDF è stato scaricato con successo",
        variant: "default"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione del PDF",
        variant: "destructive"
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const StyledQuestionText = ({ questionText, questionId, responseValue }: {
    questionText: string;
    questionId: string;
    responseValue: any;
  }) => {
    const { parts } = getQuestionTextWithStyledResponses(questionText, questionId, responseValue);
    
    return (
      <div className="mb-2">
        {parts.map((part, index) => (
          <span key={index}>
            {part.type === 'response' ? (
              <span className="font-bold underline text-[#245C4F]">
                {part.content}
              </span>
            ) : (
              part.content
            )}
          </span>
        ))}
      </div>
    );
  };

  const responsesByBlock = responses.reduce((acc, response) => {
    if (!acc[response.block_id]) {
      acc[response.block_id] = [];
    }
    acc[response.block_id].push(response);
    return acc;
  }, {} as Record<string, FormResponse[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento dettagli...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Lead non trovato</h1>
          <Button onClick={() => navigate('/admin/leads')}>Torna ai Lead</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            onClick={() => navigate('/admin/leads')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#245C4F]">Dettagli Lead</h1>
            <p className="text-gray-600">ID: {submission.id}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informazioni Generali</span>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {submission.form_title}
                </Badge>
                {submission.consulting && (
                  <Badge className="bg-green-100 text-green-800">
                    Consulenza richiesta
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Data Invio</p>
                  <p className="font-medium">{formatDate(submission.created_at)}</p>
                </div>
              </div>
              
              {submission.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Telefono</p>
                    <p className="font-medium">{submission.phone_number}</p>
                  </div>
                </div>
              )}
              
              {submission.user_identifier && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">ID Utente</p>
                    <p className="font-medium">{submission.user_identifier}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-[#245C4F] border-[#245C4F] hover:bg-[#245C4F] hover:text-white"
                  disabled={pdfLoading}
                >
                  <Download className="h-4 w-4" />
                  {pdfLoading ? 'Generando PDF...' : 'Scarica PDF'}
                </Button>
              </div>
            </div>
            
            {submission.metadata && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Metadata</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Blocchi attivi:</span> {submission.metadata.blocks?.length || 0}
                  </div>
                  <div>
                    <span className="text-gray-600">Blocchi completati:</span> {submission.metadata.completedBlocks?.length || 0}
                  </div>
                  <div>
                    <span className="text-gray-600">Blocchi dinamici:</span> {submission.metadata.dynamicBlocks || 0}
                  </div>
                  {submission.metadata.slug && (
                    <div className="col-span-full">
                      <span className="text-gray-600">Slug:</span> {submission.metadata.slug}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6">
          <LeadManagementCard
            submission={submission}
            onUpdate={handleLeadUpdate}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Risposte Fornite ({responses.length} totali)
          </h2>
          
          {Object.keys(responsesByBlock).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna risposta trovata</h3>
                  <p className="text-gray-600">Questo lead non contiene risposte.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(responsesByBlock).map(([blockId, blockResponses]) => (
              <Card key={blockId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Blocco: {blockId}
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({blockResponses.length} risposte)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blockResponses.map((response) => (
                      <div key={response.id} className="border-l-4 border-[#245C4F] pl-4">
                        <div className="mb-2">
                          <StyledQuestionText 
                            questionText={response.question_text}
                            questionId={response.question_id}
                            responseValue={response.response_value}
                          />
                          <p className="text-xs text-gray-500">ID: {response.question_id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}