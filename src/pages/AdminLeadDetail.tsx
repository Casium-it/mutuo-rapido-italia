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

interface Lead {
  id: string;
  created_at: string;
  form_submission_id: string | null;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  notes: string | null;
  lead_status: LeadStatus;
  mediatore: string | null;
  source: string | null;
  priority: number | null;
  next_contact_date: string | null;
  last_contact_date: string | null;
  updated_at: string;
  form_submissions?: {
    consulting: boolean | null;
    user_identifier: string | null;
    metadata: any;
    created_at: string;
    forms?: {
      title: string;
      slug: string;
    };
  };
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
  const [lead, setLead] = useState<Lead | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      // Fetch lead with form submission data
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select(`
          *,
          form_submissions (
            consulting,
            user_identifier,
            metadata,
            created_at,
            forms (
              title,
              slug
            )
          )
        `)
        .eq('id', leadId)
        .single();

      if (leadError) {
        console.error('Error fetching lead:', leadError);
        toast({
          title: "Errore",
          description: "Lead non trovato",
          variant: "destructive"
        });
        navigate('/admin/leads');
        return;
      }

      // Fetch responses using form_submission_id
      let responsesData = [];
      if (leadData.form_submission_id) {
        const { data: responseResults, error: responsesError } = await supabase
          .from('form_responses')
          .select('*')
          .eq('submission_id', leadData.form_submission_id)
          .order('created_at', { ascending: true });

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
          toast({
            title: "Errore",
            description: "Errore nel caricamento delle risposte",
            variant: "destructive"
          });
        } else {
          responsesData = responseResults || [];
        }
      }

      setLead(leadData);
      setResponses(responsesData);
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
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: value })
        .eq('id', lead.id);

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
      setLead(prev => prev ? { ...prev, [field]: value } : null);
      
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
    if (!lead || !responses) {
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
        id: lead.form_submission_id || lead.id,
        created_at: lead.form_submissions?.created_at || lead.created_at,
        form_title: lead.form_submissions?.forms?.title || 'Form sconosciuto',
        phone_number: lead.phone_number,
        consulting: lead.form_submissions?.consulting,
        user_identifier: lead.form_submissions?.user_identifier,
        metadata: lead.form_submissions?.metadata,
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        notes: lead.notes,
        lead_status: lead.lead_status,
        mediatore: lead.mediatore,
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

  if (!lead) {
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
            <p className="text-gray-600">ID: {lead.id}</p>
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
                  {lead.form_submissions?.forms?.title || 'Form sconosciuto'}
                </Badge>
                {lead.form_submissions?.consulting && (
                  <Badge className="bg-green-100 text-green-800">
                    Consulenza richiesta
                  </Badge>
                )}
                {lead.source && (
                  <Badge variant="outline">
                    {lead.source}
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
                  <p className="font-medium">{formatDate(lead.created_at)}</p>
                </div>
              </div>
              
              {lead.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Telefono</p>
                    <p className="font-medium">{lead.phone_number}</p>
                  </div>
                </div>
              )}
              
              {lead.form_submissions?.user_identifier && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">ID Utente</p>
                    <p className="font-medium">{lead.form_submissions.user_identifier}</p>
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
            
            {lead.form_submissions?.metadata && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Metadata Form</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Blocchi attivi:</span> {lead.form_submissions.metadata.blocks?.length || 0}
                  </div>
                  <div>
                    <span className="text-gray-600">Blocchi completati:</span> {lead.form_submissions.metadata.completedBlocks?.length || 0}
                  </div>
                  <div>
                    <span className="text-gray-600">Blocchi dinamici:</span> {lead.form_submissions.metadata.dynamicBlocks || 0}
                  </div>
                  {lead.form_submissions.metadata.slug && (
                    <div className="col-span-full">
                      <span className="text-gray-600">Slug:</span> {lead.form_submissions.metadata.slug}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lead specific metadata */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Informazioni Lead</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {lead.priority && (
                  <div>
                    <span className="text-gray-600">Priorità:</span> {lead.priority}
                  </div>
                )}
                {lead.source && (
                  <div>
                    <span className="text-gray-600">Fonte:</span> {lead.source}
                  </div>
                )}
                {lead.next_contact_date && (
                  <div>
                    <span className="text-gray-600">Prossimo contatto:</span> {formatDate(lead.next_contact_date)}
                  </div>
                )}
                {lead.last_contact_date && (
                  <div>
                    <span className="text-gray-600">Ultimo contatto:</span> {formatDate(lead.last_contact_date)}
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Ultimo aggiornamento:</span> {formatDate(lead.updated_at)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <LeadManagementCard
            submission={lead}
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