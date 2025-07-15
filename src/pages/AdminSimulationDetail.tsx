import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Phone, FileText, Mail, User, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getQuestionTextWithStyledResponses } from '@/utils/formUtils';
import { formCacheService } from '@/services/formCacheService';
import type { Block, Question, FormResponse as FormResponseType } from '@/types/form';

interface SavedSimulation {
  id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  percentage: number;
  form_slug: string;
  resume_code: string;
  save_method: 'auto-save' | 'manual-save' | 'completed-save';
  simulation_id: string | null;
  form_state: any;
}

interface ProcessedResponse {
  id: string;
  question_id: string;
  question_text: string;
  block_id: string;
  response_value: any;
}

interface BlockStatus {
  block_id: string;
  title: string;
  priority: number;
  status: 'completed' | 'partial' | 'not_started';
  answeredQuestions: number;
  totalQuestions: number;
}

export default function AdminSimulationDetail() {
  const { simulationId } = useParams<{ simulationId: string }>();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState<SavedSimulation | null>(null);
  const [processedResponses, setProcessedResponses] = useState<ProcessedResponse[]>([]);
  const [missingBlocks, setMissingBlocks] = useState<BlockStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (simulationId) {
      fetchSimulationDetails();
    }
  }, [simulationId]);

  const fetchSimulationDetails = async () => {
    try {
      const { data: simulationData, error } = await supabase
        .from('saved_simulations')
        .select('*')
        .eq('id', simulationId)
        .single();

      if (error) {
        console.error('Error fetching simulation:', error);
        toast({
          title: "Errore",
          description: "Simulazione non trovata",
          variant: "destructive"
        });
        navigate('/admin/simulations');
        return;
      }

      setSimulation(simulationData);
      await processFormState(simulationData);
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

  const processFormState = async (simulation: SavedSimulation) => {
    try {
      const formState = simulation.form_state;
      if (!formState?.responses) {
        setProcessedResponses([]);
        return;
      }

      // Get cached form and extract blocks
      const cachedForm = await formCacheService.getForm(simulation.form_slug);
      const blocks: Block[] = cachedForm?.blocks || [];

      // Create a map of questions for quick lookup
      const questionMap = new Map<string, { question: Question; block_id: string }>();
      blocks.forEach(block => {
        block.questions.forEach(question => {
          questionMap.set(question.question_id, { question, block_id: block.block_id });
        });
      });

      // Process responses from form_state
      const responses: ProcessedResponse[] = [];
      Object.entries(formState.responses).forEach(([questionId, placeholderResponses]: [string, any]) => {
        const questionInfo = questionMap.get(questionId);
        if (!questionInfo) return;

        // For each placeholder response in this question
        Object.entries(placeholderResponses).forEach(([placeholderKey, responseValue]: [string, any]) => {
          responses.push({
            id: `${questionId}_${placeholderKey}`,
            question_id: questionId,
            question_text: questionInfo.question.question_text,
            block_id: questionInfo.block_id,
            response_value: responseValue
          });
        });
      });

      setProcessedResponses(responses);

      // Calculate block completion status
      const activeBlocks = formState.activeBlocks || [];
      const completedBlocks = formState.completedBlocks || [];
      const answeredQuestions = formState.answeredQuestions || new Set();
      
      // Create block status for all blocks, ordered by priority
      const allBlocksStatus = blocks
        .filter(block => activeBlocks.includes(block.block_id))
        .sort((a, b) => a.priority - b.priority)
        .map(block => {
          const blockQuestions = block.questions || [];
          const answeredInBlock = blockQuestions.filter(q => 
            answeredQuestions.has ? answeredQuestions.has(q.question_id) : 
            Array.from(answeredQuestions).includes(q.question_id)
          ).length;
          
          let status: 'completed' | 'partial' | 'not_started';
          if (completedBlocks.includes(block.block_id)) {
            status = 'completed';
          } else if (answeredInBlock > 0) {
            status = 'partial';
          } else {
            status = 'not_started';
          }

          return {
            block_id: block.block_id,
            title: block.title,
            priority: block.priority,
            status,
            answeredQuestions: answeredInBlock,
            totalQuestions: blockQuestions.length
          };
        });

      setMissingBlocks(allBlocksStatus);

    } catch (error) {
      console.error('Error processing form state:', error);
      setProcessedResponses([]);
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

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getSimulationDisplayName = (simulation: SavedSimulation) => {
    if (simulation.name) return simulation.name;
    if (simulation.phone) return `Simulazione ${simulation.phone}`;
    if (simulation.email) return `Simulazione ${simulation.email}`;
    return `Simulazione ${simulation.resume_code}`;
  };

  const hasContactData = (simulation: SavedSimulation) => {
    return !!(simulation.name || simulation.phone || simulation.email);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento dettagli simulazione...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Simulazione non trovata</h1>
          <Button onClick={() => navigate('/admin/simulations')}>Torna alle Simulazioni</Button>
        </div>
      </div>
    );
  }

  const responsesByBlock = processedResponses.reduce((acc, response) => {
    if (!acc[response.block_id]) {
      acc[response.block_id] = [];
    }
    acc[response.block_id].push(response);
    return acc;
  }, {} as Record<string, ProcessedResponse[]>);

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            onClick={() => navigate('/admin/simulations')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#245C4F]">Dettagli Simulazione</h1>
            <p className="text-gray-600">{getSimulationDisplayName(simulation)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informazioni Simulazione</span>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {simulation.form_slug}
                </Badge>
                <Badge className={`${simulation.percentage === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {simulation.percentage}% completata
                </Badge>
                <Badge className={`${
                  simulation.save_method === 'auto-save' ? 'bg-blue-100 text-blue-800' : 
                  simulation.save_method === 'manual-save' ? 'bg-green-100 text-green-800' : 
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {simulation.save_method === 'auto-save' ? 'Auto-salvata' : 
                   simulation.save_method === 'manual-save' ? 'Manuale' : 'Completata'}
                </Badge>
                {isExpired(simulation.expires_at) && (
                  <Badge className="bg-red-100 text-red-800">
                    Scaduta
                  </Badge>
                )}
                {hasContactData(simulation) ? (
                  <Badge className="bg-green-100 text-green-800">
                    Con contatti
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    Senza contatti
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
                  <p className="text-sm text-gray-600">Data Creazione</p>
                  <p className="font-medium">{formatDate(simulation.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Ultimo Aggiornamento</p>
                  <p className="font-medium">{formatDate(simulation.updated_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Codice Ripresa</p>
                  <p className="font-medium">{simulation.resume_code}</p>
                </div>
              </div>
              
              {simulation.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Telefono</p>
                    <p className="font-medium">{simulation.phone}</p>
                  </div>
                </div>
              )}

              {simulation.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{simulation.email}</p>
                  </div>
                </div>
              )}

              {simulation.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{simulation.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Statistiche Simulazione</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Blocchi attivi:</span> {simulation.form_state?.activeBlocks?.length || 0}
                </div>
                <div>
                  <span className="text-gray-600">Blocchi completati:</span> {simulation.form_state?.completedBlocks?.length || 0}
                </div>
                <div>
                  <span className="text-gray-600">Domande risposte:</span> {processedResponses.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {missingBlocks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blocchi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Stato di completamento dei blocchi attivi (ordinati per priorità):</p>
              <div className="space-y-3">
                {missingBlocks.map((block) => (
                  <div 
                    key={block.block_id} 
                    className={`p-3 rounded-lg border-l-4 ${
                      block.status === 'completed' 
                        ? 'bg-green-50 border-l-green-500' 
                        : block.status === 'partial'
                        ? 'bg-yellow-50 border-l-yellow-500'
                        : 'bg-red-50 border-l-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{block.title}</h4>
                        <p className="text-sm text-gray-600">
                          {block.answeredQuestions} di {block.totalQuestions} domande risposte
                        </p>
                      </div>
                      <Badge 
                        className={`${
                          block.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : block.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {block.status === 'completed' 
                          ? 'Completato' 
                          : block.status === 'partial'
                          ? 'Parziale'
                          : 'Non iniziato'
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <p className="text-gray-600">Questa simulazione non contiene ancora risposte.</p>
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