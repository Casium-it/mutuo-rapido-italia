import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, ArrowLeft, Phone, Calendar, FileText, Mail, User, StickyNote, Trash2, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  form_id: string | null;
  phone_number: string | null;
  consulting: boolean | null;
  user_identifier: string | null;
  metadata: any;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  notes: string | null;
  mediatore: string | null;
  ultimo_contatto: string | null;
  prossimo_contatto: string | null;
  lead_status: LeadStatus;
  form_title: string;
  assigned_to: string | null;
  forms?: {
    slug: string;
    title: string;
  };
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phoneFilter, setPhoneFilter] = useState<'all' | 'with' | 'without'>('all');
  const [formFilter, setFormFilter] = useState<string>('all');
  const [prossimoContattoFilter, setProssimoContattoFilter] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Session Storage helpers
  const saveFiltersToSession = (status: string, phone: 'all' | 'with' | 'without', form: string) => {
    try {
      sessionStorage.setItem('adminLeads_statusFilter', status);
      sessionStorage.setItem('adminLeads_phoneFilter', phone);
      sessionStorage.setItem('adminLeads_formFilter', form);
    } catch (error) {
      console.warn('Could not save filters to session storage:', error);
    }
  };

  const loadFiltersFromSession = () => {
    try {
      const savedStatus = sessionStorage.getItem('adminLeads_statusFilter') || 'all';
      const savedPhone = sessionStorage.getItem('adminLeads_phoneFilter') || 'all';
      const savedForm = sessionStorage.getItem('adminLeads_formFilter') || 'all';
      return { 
        status: savedStatus, 
        phone: savedPhone as 'all' | 'with' | 'without',
        form: savedForm
      };
    } catch (error) {
      console.warn('Could not load filters from session storage:', error);
      return { status: 'all', phone: 'all' as const, form: 'all' };
    }
  };

  const saveScrollPosition = () => {
    try {
      sessionStorage.setItem('adminLeads_scrollPosition', window.pageYOffset.toString());
    } catch (error) {
      console.warn('Could not save scroll position:', error);
    }
  };

  const restoreScrollPosition = () => {
    try {
      const savedPosition = sessionStorage.getItem('adminLeads_scrollPosition');
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('adminLeads_scrollPosition'); // Clean up after use
      }
    } catch (error) {
      console.warn('Could not restore scroll position:', error);
    }
  };

  // Initialize filters from session storage
  useEffect(() => {
    const { status, phone, form } = loadFiltersFromSession();
    setStatusFilter(status);
    setPhoneFilter(phone);
    setFormFilter(form);
  }, []);

  // Restore scroll position after component mounts and DOM is ready
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      restoreScrollPosition();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Get submissions with joined form data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select(`
          *,
          forms (
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle submissions",
          variant: "destructive"
        });
        return;
      }

      // Map the data to include form_title from the joined form
      const mappedData = (submissionsData || []).map(submission => ({
        ...submission,
        form_title: submission.forms?.title || 'Form non trovato'
      }));
      
      setSubmissions(mappedData);

      // Extract unique forms for the filter
      const uniqueForms = Array.from(
        new Map(
          mappedData
            .filter(submission => submission.forms)
            .map(submission => [
              submission.forms.slug,
              {
                slug: submission.forms.slug,
                title: submission.forms.title
              }
            ])
        ).values()
      );
      
      setForms(uniqueForms);
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

  // Filter submissions based on status, phone, form and prossimo contatto
  let filteredSubmissions = submissions.filter(submission => {
    const statusMatch = statusFilter === 'all' || submission.lead_status === statusFilter;
    const phoneMatch = phoneFilter === 'all' || 
      (phoneFilter === 'with' && submission.phone_number) ||
      (phoneFilter === 'without' && !submission.phone_number);
    const formMatch = formFilter === 'all' || submission.forms?.slug === formFilter;
    const prossimoContattoMatch = !prossimoContattoFilter || submission.prossimo_contatto;
    return statusMatch && phoneMatch && formMatch && prossimoContattoMatch;
  });

  // Sort by prossimo_contatto when filter is active (oldest first)
  if (prossimoContattoFilter) {
    filteredSubmissions = filteredSubmissions.sort((a, b) => {
      if (!a.prossimo_contatto || !b.prossimo_contatto) return 0;
      return new Date(a.prossimo_contatto).getTime() - new Date(b.prossimo_contatto).getTime();
    });
  }

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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Form Submissions</h2>
              <p className="text-gray-600">Totale: {filteredSubmissions.length} submissions</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                saveFiltersToSession(value, phoneFilter, formFilter);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtra per status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli status</SelectItem>
                  <SelectItem value="not_contacted">Non Contattato</SelectItem>
                  <SelectItem value="non_risponde_x1">Non Risponde x1</SelectItem>
                  <SelectItem value="non_risponde_x2">Non Risponde x2</SelectItem>
                  <SelectItem value="non_risponde_x3">Non Risponde x3</SelectItem>
                  <SelectItem value="non_interessato">Non Interessato</SelectItem>
                  <SelectItem value="da_risentire">Da Risentire</SelectItem>
                  <SelectItem value="prenotata_consulenza">Prenotata Consulenza</SelectItem>
                  <SelectItem value="pratica_bocciata">Pratica Bocciata</SelectItem>
                  <SelectItem value="converted">Convertito</SelectItem>
                  <SelectItem value="perso">Perso</SelectItem>
                  <SelectItem value="first_contact">Primo Contatto</SelectItem>
                  <SelectItem value="advanced_conversations">Conversazioni Avanzate</SelectItem>
                  <SelectItem value="rejected">Respinto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 border-l pl-4">
              <Phone className="h-4 w-4 text-gray-500" />
              <Label htmlFor="phone-filter" className="text-sm text-gray-600">Telefono:</Label>
              <Select value={phoneFilter} onValueChange={(value: 'all' | 'with' | 'without') => {
                setPhoneFilter(value);
                saveFiltersToSession(statusFilter, value, formFilter);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="with">Sì</SelectItem>
                  <SelectItem value="without">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <FileText className="h-4 w-4 text-gray-500" />
              <Label htmlFor="form-filter" className="text-sm text-gray-600">Form:</Label>
              <Select value={formFilter} onValueChange={(value) => {
                setFormFilter(value);
                saveFiltersToSession(statusFilter, phoneFilter, value);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtra per form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i form</SelectItem>
                  {forms.map((form) => (
                    <SelectItem key={form.slug} value={form.slug}>
                      {form.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <Button
                onClick={() => setProssimoContattoFilter(!prossimoContattoFilter)}
                variant={prossimoContattoFilter ? "default" : "outline"}
                className={prossimoContattoFilter ? "bg-[#245C4F] hover:bg-[#1e4f44]" : ""}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Prossimo Contatto
              </Button>
            </div>
            
            <Button onClick={fetchSubmissions} variant="outline">
              Aggiorna
            </Button>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'Nessuna submission trovata' : 'Nessuna submission con questo status'}
                </h3>
                <p className="text-gray-600">
                  {statusFilter === 'all' 
                    ? 'Le submissions appariranno qui quando gli utenti invieranno i form.' 
                    : 'Prova a cambiare il filtro per vedere altre submissions.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSubmissions.map((submission) => (
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
                        {submission.form_title}
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
                      <LeadStatusBadge status={submission.lead_status} />
                      {submission.mediatore && (
                        <span className="text-sm text-gray-600">
                          → {submission.mediatore}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Assegnata a: </span>
                      <span className="font-medium">
                        {submission.assigned_to || 'nessuno'}
                      </span>
                    </div>
                    
                    {/* Contact Dates */}
                    <div className="space-y-1 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>Ultimo contatto:</span>
                        <span className="font-medium">
                          {submission.ultimo_contatto 
                            ? formatDate(submission.ultimo_contatto)
                            : '(nessuno)'
                          }
                        </span>
                      </div>
                       <div className="flex items-center gap-1">
                         <span>Prossimo contatto:</span>
                         <span className={`font-medium ${
                           submission.prossimo_contatto && new Date(submission.prossimo_contatto) < new Date()
                             ? 'text-red-600 font-bold'
                             : ''
                         }`}>
                           {submission.prossimo_contatto 
                             ? formatDate(submission.prossimo_contatto)
                             : '(non in programma)'
                           }
                         </span>
                       </div>
                    </div>
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
                      onClick={() => {
                        saveScrollPosition();
                        navigate(`/admin/leads/${submission.id}`);
                      }}
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