import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Phone, FileText, User, MapPin, Euro, Clock, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getQuestionTextWithStyledResponses } from '@/utils/formUtils';
import { LeadStatus } from '@/types/leadStatus';
import { useFormCache } from '@/hooks/useFormCache';
import { FormState, Block } from '@/types/form';
import { sortBlocksByPriority, sortQuestionsByArrayOrder } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ExpandableNotes } from '@/components/admin/ExpandableNotes';
import { PraticaManager } from '@/components/mediatore/PraticaManager';
import { StructuredNotes } from '@/components/mediatore/StructuredNotes';
import { ActivityTimeline } from '@/components/mediatore/ActivityTimeline';
import { DocumentManager } from '@/components/mediatore/DocumentManager';

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
  gomutuo_service: string | null;
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
  provincia?: string | null;
}

export default function MediatoreLeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFormBySlug } = useFormCache();

  useEffect(() => {
    if (leadId && user?.id) {
      fetchSubmissionDetails();
    }
  }, [leadId, user?.id]);

  const fetchSubmissionDetails = async () => {
    try {
      if (!user?.id) {
        console.error('No authenticated user found');
        return;
      }
      
      // Fetch submission with form title and check if it's assigned to this mediatore
      const { data: submissionData, error: submissionError } = await supabase
        .from('form_submissions')
        .select(`
          *,
          forms!inner(
            title,
            slug
          ),
          saved_simulations (
            form_state,
            form_slug
          )
        `)
        .eq('id', leadId)
        .eq('mediatore', user.id) // Only leads assigned to this mediatore
        .single();

      if (submissionError) {
        console.error('Error fetching submission:', submissionError);
        toast({
          title: "Errore",
          description: "Lead non trovato o non autorizzato",
          variant: "destructive"
        });
        navigate('/mediatore/leads');
        return;
      }

      // Extract provincia from saved simulation form state (same logic as MediatoreLeads)
      let provincia = null;
      if (submissionData.saved_simulations?.form_state) {
        try {
          const formStateData = submissionData.saved_simulations.form_state as any;
          const responses = formStateData?.responses || {};
          
          const possibleKeys = Object.keys(responses).filter(key => 
            key.includes('provincia') || 
            key.includes('citta') || 
            key.includes('zona') ||
            key.includes('dove_')
          );
          
          if (possibleKeys.length > 0) {
            const provinciaResponse = responses[possibleKeys[0]];
            if (provinciaResponse && typeof provinciaResponse === 'object') {
              const placeholderKeys = Object.keys(provinciaResponse).filter(key => key.startsWith('placeholder'));
              if (placeholderKeys.length > 0) {
                provincia = provinciaResponse[placeholderKeys[0]] as string;
              }
            } else if (typeof provinciaResponse === 'string') {
              provincia = provinciaResponse;
            }
          }
        } catch (e) {
          console.warn('Error parsing form state for provincia:', e);
        }
      }

      // Add form title and provincia to submission
      const submissionWithExtras = {
        ...submissionData,
        form_title: submissionData.forms?.title || 'Form sconosciuto',
        provincia
      };

      setSubmission(submissionWithExtras);

      // If we have saved_simulations, set form state and get blocks
      if (submissionData.saved_simulations) {
        setFormState(submissionData.saved_simulations.form_state as unknown as FormState);
        
        // Get form structure from cache
        const formCache = await getFormBySlug(submissionData.saved_simulations.form_slug);
        if (formCache) {
          setBlocks(formCache.blocks);
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
      navigate('/mediatore/leads');
    } finally {
      setLoading(false);
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

  // Process responses from form_state using blocks structure
  const processedResponses = React.useMemo(() => {
    if (!formState || !formState.responses || !blocks.length) return [];

    const responses: Array<{
      id: string;
      question_id: string;
      question_text: string;
      block_id: string;
      response_value: any;
    }> = [];

    // Create a map of questions for quick lookup
    const questionMap = new Map();
    blocks.forEach(block => {
      block.questions.forEach(question => {
        questionMap.set(question.question_id, { question, block_id: block.block_id });
      });
    });

    // Process responses from form_state
    Object.entries(formState.responses).forEach(([questionId, placeholderResponses]: [string, any]) => {
      const questionInfo = questionMap.get(questionId);
      if (!questionInfo) return;

      responses.push({
        id: questionId,
        question_id: questionId,
        question_text: questionInfo.question.question_text,
        block_id: questionInfo.block_id,
        response_value: placeholderResponses
      });
    });

    return responses;
  }, [formState, blocks]);

  // Create question map for StyledQuestionText
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
          <Button onClick={() => navigate('/mediatore/leads')}>Torna ai Lead</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            onClick={() => navigate('/mediatore/leads')}
            variant="ghost"
            className="flex items-center gap-2 text-gray-700 hover:text-[#00853E] hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna ai Lead
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-[#245C4F]">Dettagli Lead</h1>
            <p className="text-gray-600">
              {submission.first_name && submission.last_name 
                ? `${submission.first_name} ${submission.last_name}`
                : submission.first_name || submission.last_name || 'Nome non disponibile'
              }
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* General Information Card */}
        <Card className="mb-6 bg-white border border-[#BEB8AE]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informazioni Generali</span>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Nome Completo</p>
                  <p className="font-medium">
                    {submission.first_name && submission.last_name 
                      ? `${submission.first_name} ${submission.last_name}`
                      : submission.first_name || submission.last_name || 'Non disponibile'
                    }
                  </p>
                </div>
              </div>
              
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
              
              {submission.provincia && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Provincia</p>
                    <p className="font-medium">{submission.provincia}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        {(submission.notes || submission.ai_notes) && (
          <div className="mb-6">
            <ExpandableNotes 
              notes={submission.notes || ''} 
              aiNotes={submission.ai_notes || ''}
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="pratica" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pratica" className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              <span className="hidden sm:inline">Pratica</span>
            </TabsTrigger>
            <TabsTrigger value="note" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
            <TabsTrigger value="documenti" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documenti</span>
            </TabsTrigger>
            <TabsTrigger value="storico" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Storico</span>
            </TabsTrigger>
            <TabsTrigger value="risposte" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Risposte</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pratica" className="space-y-6">
            <PraticaManager submissionId={leadId!} />
          </TabsContent>

          <TabsContent value="note" className="space-y-6">
            <StructuredNotes submissionId={leadId!} />
          </TabsContent>

          <TabsContent value="documenti" className="space-y-6">
            <DocumentManager submissionId={leadId!} />
          </TabsContent>

          <TabsContent value="storico" className="space-y-6">
            <ActivityTimeline submissionId={leadId!} />
          </TabsContent>

          <TabsContent value="risposte" className="space-y-6">
            {/* Form Responses by Block */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Risposte Fornite ({processedResponses.length} totali)
              </h2>
              
              {Object.keys(responsesByBlock).length === 0 ? (
                <Card className="bg-white border border-[#BEB8AE]">
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
                    <Card key={blockId} className="bg-white border border-[#BEB8AE]">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {blockInfo?.title || blockId}
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}