import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Calendar, User, MapPin, Search, Filter, StickyNote } from 'lucide-react';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { SimpleNoteDialog } from '@/components/mediatore/SimpleNoteDialog';
import { LeadStatus } from '@/types/leadStatus';
import { useAuth } from '@/contexts/AuthContext';

interface Lead {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  lead_status: LeadStatus;
  provincia?: string | null;
  compenso_lead?: string | null;
  saved_simulation?: {
    form_state: any;
  };
  pratica?: {
    status: string;
  } | null;
}

type PraticaStatus = 'lead' | 'da_richiamare' | 'consulenza_programmata' | 'consulenza_saltata' | 'consulenza_completata' | 'in_attesa_documenti' | 'documenti_ricevuti' | 
  'in_attesa_mandato' | 'mandato_firmato' | 'inviata_alla_banca' | 'predelibera_ricevuta' | 'istruttoria_ricevuta' | 
  'rogito_completato' | 'pratica_rifiutata' | 'pratica_sospesa' | 'non_risponde' | 'persa';

const statusOptions: { value: PraticaStatus | 'all' | 'nuova_lead'; label: string }[] = [
  { value: 'all', label: 'Tutti gli Status' },
  { value: 'nuova_lead', label: '✨ Nuova Lead' },
  { value: 'lead', label: 'Lead' },
  { value: 'da_richiamare', label: 'Da Richiamare' },
  { value: 'consulenza_programmata', label: 'Consulenza Programmata' },
  { value: 'consulenza_saltata', label: 'Consulenza Saltata' },
  { value: 'consulenza_completata', label: 'Consulenza Completata' },
  { value: 'in_attesa_documenti', label: 'In Attesa Documenti' },
  { value: 'documenti_ricevuti', label: 'Documenti Ricevuti' },
  { value: 'in_attesa_mandato', label: 'In Attesa Mandato' },
  { value: 'mandato_firmato', label: 'Mandato Firmato' },
  { value: 'inviata_alla_banca', label: 'Inviata alla Banca' },
  { value: 'predelibera_ricevuta', label: 'Predelibera Ricevuta' },
  { value: 'istruttoria_ricevuta', label: 'Istruttoria Ricevuta' },
  { value: 'rogito_completato', label: 'Rogito Completato' },
  { value: 'pratica_rifiutata', label: 'Pratica Rifiutata' },
  { value: 'pratica_sospesa', label: 'Pratica Sospesa' },
  { value: 'non_risponde', label: 'Non Risponde' },
  { value: 'persa', label: 'Persa' }
];

export default function MediatoreLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PraticaStatus | 'all' | 'nuova_lead'>('all');
  const [leadAperti, setLeadAperti] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('No authenticated user found');
        return;
      }
      
      console.log('🔍 Fetching leads for mediatore:', user.id);
      
      // Fetch leads assigned to the current mediatore with saved simulation data and pratica status
      const { data: submissions, error } = await supabase
        .from('form_submissions')
        .select(`
          id,
          created_at,
          first_name,
          last_name,
          lead_status,
          mediatore,
          compenso_lead,
          saved_simulation_id,
          saved_simulations (
            form_state
          ),
          pratiche (
            status
          )
        `)
        .eq('mediatore', user.id) // Only leads assigned to this mediatore
        .order('created_at', { ascending: false });

      console.log('📋 Fetched submissions:', { submissions, error });

      if (error) {
        console.error('Error fetching leads:', error);
        return;
      }

      // Process leads to extract provincia from saved simulation form state
      const processedLeads = submissions?.map(submission => {
        let provincia = null;
        
        if (submission.saved_simulations?.form_state) {
          try {
            const formState = submission.saved_simulations.form_state as any;
            const responses = formState?.responses || {};
            
            // Look for provincia in different possible question IDs
            const possibleKeys = Object.keys(responses).filter(key => 
              key.includes('provincia') || 
              key.includes('citta') || 
              key.includes('zona') ||
              key.includes('dove_')
            );
            
            if (possibleKeys.length > 0) {
              const provinciaResponse = responses[possibleKeys[0]];
              if (provinciaResponse && typeof provinciaResponse === 'object') {
                // Look for placeholder keys (placeholder1, placeholder2, etc.)
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

        return {
          id: submission.id,
          created_at: submission.created_at,
          first_name: submission.first_name,
          last_name: submission.last_name,
          lead_status: submission.lead_status,
          provincia,
          compenso_lead: submission.compenso_lead,
          saved_simulation: submission.saved_simulations,
          pratica: submission.pratiche || null
        };
      }) || [];

      console.log('✅ Processed leads for mediatore:', processedLeads.length);
      setLeads(processedLeads);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchLeads();
    }
  }, [user?.id]);

  // Filtered leads based on search term and status
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.provincia && lead.provincia.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'nuova_lead') {
          // Filter for leads without pratica
          matchesStatus = !lead.pratica;
        } else {
          // Filter by pratica status
          matchesStatus = lead.pratica?.status === statusFilter;
        }
      }

      // Apply lead aperti filter (filter out lost and rejected leads)
      let matchesLeadAperti = true;
      if (leadAperti) {
        // Filter out "persa" from pratica status and "pratica_rifiutata" 
        const isNotLostOrRejected = !lead.pratica || 
          (lead.pratica.status !== 'persa' && lead.pratica.status !== 'pratica_rifiutata');
        matchesLeadAperti = isNotLostOrRejected;
      }
      
      return matchesSearch && matchesStatus && matchesLeadAperti;
    });
  }, [leads, searchTerm, statusFilter, leadAperti]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento lead...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/mediatore')}
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-[#00853E] hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">I Miei Lead</h1>
              <p className="text-gray-600">Lead assegnati a te</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {leads.length === 0 ? (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun lead assegnato</h3>
              <p className="text-gray-500">Al momento non hai lead assegnati a te.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Header with title and count */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                I Miei Lead ({filteredLeads.length})
              </h2>
            </div>

            {/* Filters */}
            <Card className="bg-white border border-[#BEB8AE]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cerca per nome o provincia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Lead Aperti Toggle */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#BEB8AE]">
                    <Switch
                      id="lead-aperti"
                      checked={leadAperti}
                      onCheckedChange={setLeadAperti}
                    />
                    <label htmlFor="lead-aperti" className="text-sm font-medium cursor-pointer">
                      Lead aperti
                    </label>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="w-full md:w-64">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PraticaStatus | 'all' | 'nuova_lead')}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredLeads.length === 0 ? (
              <Card className="max-w-md mx-auto text-center">
                <CardContent className="p-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun lead trovato</h3>
                  <p className="text-gray-500">Nessun lead corrisponde ai criteri di ricerca.</p>
                </CardContent>
              </Card>
            ) : (
              /* Table Layout */
              <Card className="bg-white border border-[#BEB8AE]">
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 p-4 border-b border-[#BEB8AE] bg-gray-50">
                    <div className="font-medium text-gray-700">Nome</div>
                    <div className="font-medium text-gray-700">Status</div>
                    <div className="font-medium text-gray-700">Provincia</div>
                    <div className="font-medium text-gray-700">Compenso</div>
                    <div className="font-medium text-gray-700">Azioni</div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="divide-y divide-[#BEB8AE]">
                    {filteredLeads.map((lead) => (
                      <div key={lead.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
                        {/* Name Column */}
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {lead.first_name && lead.last_name 
                              ? `${lead.first_name} ${lead.last_name}`
                              : lead.first_name || lead.last_name || 'Nome non disponibile'
                            }
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(lead.created_at)}
                          </div>
                        </div>
                        
                        {/* Status Column */}
                        <div>
                          <LeadStatusBadge 
                            status={lead.pratica?.status as any || lead.lead_status} 
                            isNewLead={!lead.pratica}
                          />
                        </div>
                        
                        {/* Provincia Column */}
                        <div className="text-gray-600">
                          {lead.provincia ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{lead.provincia}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </div>
                        
                        {/* Compenso Column */}
                        <div className="text-gray-600">
                          {lead.compenso_lead ? (
                            <span className="text-sm font-medium">{lead.compenso_lead}</span>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </div>
                        
                        {/* Actions Column */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/mediatore/leads/${lead.id}`)}
                            className="text-[#245C4F] border-[#245C4F] hover:bg-[#245C4F] hover:text-white"
                          >
                            Dettagli
                          </Button>
                          <SimpleNoteDialog
                            submissionId={lead.id}
                            onUpdate={fetchLeads}
                          >
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-[#245C4F] border-[#245C4F] hover:bg-[#245C4F] hover:text-white"
                            >
                              Nota Rapida
                            </Button>
                          </SimpleNoteDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}