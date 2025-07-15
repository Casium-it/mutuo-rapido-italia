import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, ArrowLeft, Phone, Calendar, FileText, Mail, User, StickyNote, Trash2, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { useLeads, Lead, LeadFilters } from '@/hooks/useLeads';
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

export default function AdminLeads() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phoneFilter, setPhoneFilter] = useState<'all' | 'with' | 'without'>('all');
  const [formFilter, setFormFilter] = useState<string>('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { leads, loading, forms, fetchLeads, deleteLead, filterLeads } = useLeads();

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

  // Leads are fetched automatically by the useLeads hook

  const handleDeleteLead = async (leadId: string) => {
    setDeletingId(leadId);
    
    const success = await deleteLead(leadId);
    setDeletingId(null);
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

  // Filter leads based on status, phone and form
  const filteredLeads = filterLeads(leads, { status: statusFilter, phone: phoneFilter, form: formFilter });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento leads...</p>
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
              <p className="text-gray-600">Visualizza e gestisci i leads del sistema</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
            <p className="text-gray-600">Totale: {filteredLeads.length} leads</p>
          </div>
          <div className="flex items-center gap-4">
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
            
            <Button onClick={fetchLeads} variant="outline">
              Aggiorna
            </Button>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'Nessun lead trovato' : 'Nessun lead con questo status'}
                </h3>
                <p className="text-gray-600">
                  {statusFilter === 'all' 
                    ? 'I leads appariranno qui quando gli utenti invieranno i form.' 
                    : 'Prova a cambiare il filtro per vedere altri leads.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Lead #{lead.id.slice(0, 8)}
                      {(lead.first_name || lead.last_name) && (
                        <span className="ml-2 font-bold text-[#245C4F]">
                          {lead.first_name} {lead.last_name}
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(lead.created_at)}
                    </div>
                    {lead.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {lead.phone_number}
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {lead.email}
                      </div>
                    )}
                    {lead.form_submissions?.user_identifier && (
                      <div className="text-sm text-gray-600">
                        ID Utente: {lead.form_submissions.user_identifier}
                      </div>
                    )}
                  </div>

                  {/* Lead Status */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Status Lead:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LeadStatusBadge status={lead.lead_status} />
                      {lead.mediatore && (
                        <span className="text-sm text-gray-600">
                          → {lead.mediatore}
                        </span>
                      )}
                      {lead.priority && (
                        <span className="text-xs text-gray-500">
                          Priorità: {lead.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div className="mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <StickyNote className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="text-sm text-gray-600">Note:</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {lead.notes}
                      </p>
                    </div>
                  )}
                  
                  {lead.form_submissions?.metadata && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Blocchi attivi: {lead.form_submissions.metadata.blocks?.length || 0}</p>
                      <p>Blocchi completati: {lead.form_submissions.metadata.completedBlocks?.length || 0}</p>
                      {lead.form_submissions.metadata.slug && (
                        <p>Slug: {lead.form_submissions.metadata.slug}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      onClick={() => {
                        saveScrollPosition();
                        navigate(`/admin/leads/${lead.id}`);
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
                          disabled={deletingId === lead.id}
                        >
                          {deletingId === lead.id ? (
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
                            Sei sicuro di voler eliminare questo lead? 
                            {(lead.first_name || lead.last_name) && (
                              <span className="font-medium">
                                {' '}({lead.first_name} {lead.last_name})
                              </span>
                            )}
                            <br />
                            <span className="text-red-600 font-medium">
                              Questa azione non può essere annullata e eliminerà anche tutte le interazioni associate.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteLead(lead.id)}
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