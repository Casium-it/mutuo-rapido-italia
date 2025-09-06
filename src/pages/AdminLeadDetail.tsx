import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Phone, FileText, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getQuestionTextWithStyledResponses } from '@/utils/formUtils';
import { LeadManagementCard } from '@/components/admin/LeadManagementCard';
import { LeadStatus } from '@/types/leadStatus';
import { useFormCache } from '@/hooks/useFormCache';
import { FormState, Block } from '@/types/form';
import { sortBlocksByPriority, sortQuestionsByArrayOrder } from '@/lib/utils';

interface FormSubmission {
  id: string;
  created_at: string;
  form_id: string | null;
  phone_number: string | null;
  consulting: boolean | null;
  user_identifier: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  notes: string | null;
  ai_notes: string | null;
  lead_status: LeadStatus;
  mediatore: string | null;
  ultimo_contatto: string | null;
  prossimo_contatto: string | null;
  assigned_to: string | null;
  reminder: boolean;
  form_title?: string;
  saved_simulation_id: string | null;
}

export default function AdminLeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { getFormBySlug } = useFormCache();

  useEffect(() => {
    if (leadId) {
      fetchSubmissionDetails();
    }
  }, [leadId]);

  const fetchSubmissionDetails = async () => {
    try {
      // Fetch submission with form title and saved_simulation_id
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

      // Add form title to submission
      const submissionWithTitle = {
        ...submissionData,
        form_title: submissionData.forms?.title || 'Form sconosciuto'
      };

      setSubmission(submissionWithTitle);

      // If we have a saved_simulation_id, fetch the form_state
      if (submissionData.saved_simulation_id) {
        const { data: simulationData, error: simulationError } = await supabase
          .from('saved_simulations')
          .select('form_state, form_slug')
          .eq('id', submissionData.saved_simulation_id)
          .single();

        if (!simulationError && simulationData) {
          setFormState(simulationData.form_state as unknown as FormState);
          
          // Get form structure from cache
          const formCache = await getFormBySlug(simulationData.form_slug);
          if (formCache) {
            setBlocks(formCache.blocks);
          }
        }
      }
      
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

  const handleLeadUpdate = async (field: string, value: string | boolean) => {
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
    if (!submission) {
      toast({
        title: "Errore",
        description: "Dati del lead non disponibili",
        variant: "destructive"
      });
      return;
    }

    setPdfLoading(true);
    try {
      // Call the edge function to generate PDF
      const { data, error } = await supabase.functions.invoke('generate-lead-pdf', {
        body: { submissionId: submission.id }
      });

      if (error) {
        console.error('PDF generation error:', error);
        throw new Error(error.message || 'Errore nella generazione del PDF');
      }

      if (!data.pdfUrl) {
        throw new Error('URL del PDF non ricevuto');
      }

      // Download the PDF as blob to force download
      const response = await fetch(data.pdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create filename with name and surname
      const firstName = submission.first_name || 'lead';
      const lastName = submission.last_name || submission.id.slice(0, 8);
      const filename = `${firstName}_${lastName}.pdf`;
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "PDF generato",
        description: "Il PDF è stato scaricato con successo",
        variant: "default"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione del PDF",
        variant: "destructive"
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const StyledQuestionText = ({ questionText, questionId, responseValue, question }: {
    questionText: string;
    questionId: string;
    responseValue: any;
    question?: any;
  }) => {
    const { parts } = getQuestionTextWithStyledResponses(questionText, questionId, responseValue, question?.placeholders);
    
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

  // Process responses from form_state using blocks structure (same as AdminSimulationDetail)
  const processedResponses = React.useMemo(() => {
    if (!formState || !formState.responses || !blocks.length) return [];

    const responses: Array<{
      id: string;
      question_id: string;
      question_text: string;
      block_id: string;
      response_value: any;
    }> = [];

    // Create a map of questions for quick lookup (same as AdminSimulationDetail)
    const questionMap = new Map();
    blocks.forEach(block => {
      block.questions.forEach(question => {
        questionMap.set(question.question_id, { question, block_id: block.block_id });
      });
    });

    // Process responses from form_state (exactly like AdminSimulationDetail)
    Object.entries(formState.responses).forEach(([questionId, placeholderResponses]: [string, any]) => {
      const questionInfo = questionMap.get(questionId);
      if (!questionInfo) return;

      // Create ONE entry per question with the complete placeholder responses
      responses.push({
        id: questionId,
        question_id: questionId,
        question_text: questionInfo.question.question_text,
        block_id: questionInfo.block_id,
        response_value: placeholderResponses // Pass the complete object with all placeholder values
      });
    });

    return responses;
  }, [formState, blocks]);

  // Create question map for StyledQuestionText (same as AdminSimulationDetail)
  const questionMap = React.useMemo(() => {
    const map = new Map();
    blocks.forEach(block => {
      block.questions.forEach(question => {
        map.set(question.question_id, { question, block_id: block.block_id });
      });
    });
    return map;
  }, [blocks]);

  // Group processed responses by block
  const responsesByBlock = React.useMemo(() => {
    const grouped: Record<string, Array<{
      id: string;
      question_id: string;
      question_text: string;
      block_id: string;
      response_value: any;
    }>> = {};

    processedResponses.forEach(response => {
      if (!grouped[response.block_id]) {
        grouped[response.block_id] = [];
      }
      grouped[response.block_id].push(response);
    });

    return grouped;
  }, [processedResponses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento dettagli...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Lead non trovato</h1>
          <Button onClick={() => navigate('/admin/leads')}>Torna ai Lead</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
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
            Risposte Fornite ({processedResponses.length} totali)
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
            sortBlocksByPriority(responsesByBlock, blocks).map(([blockId, blockResponses]) => {
              const blockInfo = blocks.find(b => b.block_id === blockId);
              const sortedResponses = sortQuestionsByArrayOrder(blockResponses, blocks, blockId);
              
              return (
                <Card key={blockId}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Blocco: {blockInfo?.title || blockId}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({sortedResponses.length} risposte)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sortedResponses.map((response) => {
                        const questionInfo = questionMap.get(response.question_id);
                        return (
                          <div key={response.id} className="border-l-4 border-[#245C4F] pl-4">
                            <div className="mb-2">
                              <StyledQuestionText 
                                questionText={response.question_text}
                                questionId={response.question_id}
                                responseValue={response.response_value}
                                question={questionInfo?.question}
                              />
                              <p className="text-xs text-gray-500">ID: {response.question_id}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}