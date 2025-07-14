import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, ArrowLeft, Phone, Calendar, FileText, Mail, User, StickyNote, Trash2 } from 'lucide-react';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { LeadStatus } from '@/types/leadStatus';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FormSubmission {
  id: string;
  created_at: string;
  form_type: string;
  phone_number: string | null;
  consulting: boolean | null;
  user_identifier: string | null;
  metadata: any;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  notes: string | null;
  lead_status: LeadStatus;
  form_title?: string;
}

interface FormInfo {
  slug: string;
  title: string;
}

export default function AdminLeads() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [forms, setForms] = useState<FormInfo[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // First get all forms to create a mapping
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('slug, title');

      if (formsError) {
        console.error('Error fetching forms:', formsError);
      } else {
        setForms(formsData || []);
      }

      // Then get submissions
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle submissions",
          variant: "destructive"
        });
      } else {
        // Map form titles to submissions
        const formsMap = (formsData || []).reduce((acc, form) => {
          acc[form.slug] = form.title;
          return acc;
        }, {} as Record<string, string>);

        const mappedData = (data || []).map(submission => ({
          ...submission,
          form_title: formsMap[submission.form_type] || submission.form_type
        }));
        setSubmissions(mappedData);
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

  const handleDeleteSubmission = async (submissionId: string) => {
    setDeletingId(submissionId);
    
    try {
      console.log('Starting deletion process for submission:', submissionId);
      
      // First delete related responses
      const { error: responsesError } = await supabase
        .from('form_responses')
        .delete()
        .eq('submission_id', submissionId);

      if (responsesError) {
        console.error('Error deleting responses:', responsesError);
        throw responsesError;
      }

      console.log('Successfully deleted responses for submission:', submissionId);

      // Then delete the submission
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submissionId);

      if (submissionError) {
        console.error('Error deleting submission:', submissionError);
        throw submissionError;
      }

      console.log('Successfully deleted submission:', submissionId);

      // Update local state
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      
      toast({
        title: "Successo",
        description: "Submission eliminata con successo",
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Errore",
        description: `Errore nell'eliminazione della submission: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">Gestione Leads</h1>
              <p className="text-gray-600">Visualizza e gestisci le submissions dei form</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form Submissions</h2>
            <p className="text-gray-600">Totale: {submissions.length} submissions</p>
          </div>
          <Button onClick={fetchSubmissions} variant="outline">
            Aggiorna
          </Button>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna submission trovata</h3>
                <p className="text-gray-600">Le submissions appariranno qui quando gli utenti invieranno i form.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Submission #{submission.id.slice(0, 8)}
                      {(submission.first_name || submission.last_name) && (
                        <span className="ml-2 font-bold text-[#245C4F]">
                          {submission.first_name} {submission.last_name}
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {submission.form_title || submission.form_type}
                      </Badge>
                      {submission.consulting && (
                        <Badge className="bg-green-100 text-green-800">
                          Consulenza richiesta
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(submission.created_at)}
                    </div>
                    {submission.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {submission.phone_number}
                      </div>
                    )}
                    {submission.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {submission.email}
                      </div>
                    )}
                    {submission.user_identifier && (
                      <div className="text-sm text-gray-600">
                        ID Utente: {submission.user_identifier}
                      </div>
                    )}
                  </div>

                  {/* Lead Status */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Status Lead:</span>
                    </div>
                    <LeadStatusBadge status={submission.lead_status} />
                  </div>

                  {/* Notes */}
                  {submission.notes && (
                    <div className="mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <StickyNote className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="text-sm text-gray-600">Note:</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {submission.notes}
                      </p>
                    </div>
                  )}
                  
                  {submission.metadata && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Blocchi attivi: {submission.metadata.blocks?.length || 0}</p>
                      <p>Blocchi completati: {submission.metadata.completedBlocks?.length || 0}</p>
                      {submission.metadata.slug && (
                        <p>Slug: {submission.metadata.slug}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      onClick={() => navigate(`/admin/leads/${submission.id}`)}
                      className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizza Dettagli
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-2"
                          disabled={deletingId === submission.id}
                        >
                          {deletingId === submission.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Elimina
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questa submission? 
                            {(submission.first_name || submission.last_name) && (
                              <span className="font-medium">
                                {' '}({submission.first_name} {submission.last_name})
                              </span>
                            )}
                            <br />
                            <span className="text-red-600 font-medium">
                              Questa azione non può essere annullata e eliminerà anche tutte le risposte associate.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Elimina Definitivamente
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}