import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, User, Phone, Mail, FileText, Trash2, Eye, RefreshCw, Search, Filter, Calendar, CalendarCheck, Check, X, Save, UserCheck } from 'lucide-react';
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
export default function AdminSimulations() {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [filteredSimulations, setFilteredSimulations] = useState<SavedSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [contactFilter, setContactFilter] = useState<'all' | 'with_contact' | 'without_contact'>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    fetchSimulations();
  }, []);
  const fetchSimulations = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('saved_simulations').select('*').order('updated_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching simulations:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle simulazioni",
          variant: "destructive"
        });
      } else {
        setSimulations(data || []);
        setFilteredSimulations(data || []);
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
  const handleDeleteSimulation = async (simulationId: string) => {
    setDeletingId(simulationId);
    try {
      const {
        error
      } = await supabase.from('saved_simulations').delete().eq('id', simulationId);
      if (error) {
        console.error('Error deleting simulation:', error);
        throw error;
      }

      // Update local state
      setSimulations(prev => prev.filter(s => s.id !== simulationId));
      setFilteredSimulations(prev => prev.filter(s => s.id !== simulationId));
      toast({
        title: "Successo",
        description: "Simulazione eliminata con successo"
      });
    } catch (error) {
      console.error('Error deleting simulation:', error);
      toast({
        title: "Errore",
        description: `Errore nell'eliminazione della simulazione: ${error.message}`,
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

  // Apply filters when simulations or filters change
  useEffect(() => {
    let filtered = [...simulations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sim => getSimulationDisplayName(sim).toLowerCase().includes(searchTerm.toLowerCase()) || sim.resume_code.toLowerCase().includes(searchTerm.toLowerCase()) || sim.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || sim.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Completion filter
    if (completionFilter === 'completed') {
      filtered = filtered.filter(sim => sim.percentage === 100);
    } else if (completionFilter === 'in_progress') {
      filtered = filtered.filter(sim => sim.percentage < 100);
    }

    // Contact filter
    if (contactFilter === 'with_contact') {
      filtered = filtered.filter(sim => hasContactData(sim));
    } else if (contactFilter === 'without_contact') {
      filtered = filtered.filter(sim => !hasContactData(sim));
    }

    // Form type filter
    if (formTypeFilter !== 'all') {
      filtered = filtered.filter(sim => sim.form_slug === formTypeFilter);
    }
    setFilteredSimulations(filtered);
  }, [simulations, searchTerm, completionFilter, contactFilter, formTypeFilter]);

  // Get unique form types for filter
  const formTypes = [...new Set(simulations.map(sim => sim.form_slug))];
  const clearFilters = () => {
    setSearchTerm('');
    setCompletionFilter('all');
    setContactFilter('all');
    setFormTypeFilter('all');
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento simulazioni...</p>
        </div>
      </div>;
  }
  const autoSaveSimulations = simulations.filter(s => s.save_method === 'auto-save');
  const manualSimulations = simulations.filter(s => s.save_method === 'manual-save');
  const completedSaveSimulations = simulations.filter(s => s.save_method === 'completed-save');
  const expiredSimulations = simulations.filter(s => isExpired(s.expires_at));
  const completedSimulations = simulations.filter(s => s.percentage === 100);
  const withContactSimulations = simulations.filter(s => hasContactData(s));
  return <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin')} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Torna al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">Gestione Simulazioni</h1>
              <p className="text-gray-600">Visualizza e gestisci le simulazioni salvate</p>
            </div>
          </div>
          <Button onClick={fetchSimulations} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Aggiorna
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Totale Simulazioni</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{simulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Auto-salvate</p>
                  <p className="text-2xl font-bold text-blue-600">{autoSaveSimulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Manuali</p>
                  <p className="text-2xl font-bold text-green-600">{manualSimulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Completati</p>
                  <p className="text-2xl font-bold text-emerald-600">{completedSaveSimulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Scadute</p>
                  <p className="text-2xl font-bold text-red-600">{expiredSimulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Con Contatti</p>
                  <p className="text-2xl font-bold text-purple-600">{withContactSimulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cerca</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Nome, telefono, email, codice..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Completamento</label>
                <Select value={completionFilter} onValueChange={(value: any) => setCompletionFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    <SelectItem value="completed">Completate (100%)</SelectItem>
                    <SelectItem value="in_progress">In corso (&lt;100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Contatti</label>
                <Select value={contactFilter} onValueChange={(value: any) => setContactFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    <SelectItem value="with_contact">Con contatti</SelectItem>
                    <SelectItem value="without_contact">Senza contatti</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo Form</label>
                <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    {formTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {filteredSimulations.length} di {simulations.length} simulazioni
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters} className="text-gray-600">
                Pulisci Filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulazioni Salvate</h2>
          <p className="text-gray-600">Visualizza tutte le simulazioni salvate dagli utenti</p>
        </div>

        {filteredSimulations.length === 0 ? simulations.length === 0 ? <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna simulazione trovata</h3>
                  <p className="text-gray-600">Le simulazioni appariranno qui quando gli utenti le salveranno.</p>
                </div>
              </CardContent>
            </Card> : <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun risultato</h3>
                  <p className="text-gray-600">Nessuna simulazione corrisponde ai filtri selezionati.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-3">
                    Pulisci Filtri
                  </Button>
                </div>
              </CardContent>
            </Card> : <div className="grid gap-4">
            {filteredSimulations.map(simulation => <Card key={simulation.id} className={`hover:shadow-md transition-shadow ${isExpired(simulation.expires_at) ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getSimulationDisplayName(simulation)}
                      <span className="ml-2 font-bold text-[#245C4F] bg-green-50 px-2 py-1 rounded text-sm">
                        {simulation.form_slug.toUpperCase()}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-lg font-bold ${simulation.percentage === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {simulation.percentage}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      Aggiornata: {formatDate(simulation.updated_at)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CalendarCheck className="h-3 w-3" />
                      Creata: {formatDate(simulation.created_at)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      Scadenza: {formatDate(simulation.expires_at)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {simulation.phone && <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {simulation.phone}
                      </div>}
                    {simulation.email && <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {simulation.email}
                      </div>}
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <div>
                      <strong>Codice Ripresa:</strong> {simulation.resume_code}
                    </div>
                  </div>

                  {simulation.simulation_id && <div className="text-sm text-gray-600 mb-3">
                      <div>
                        <strong>ID Simulazione:</strong> {simulation.simulation_id}
                      </div>
                      <div className="space-y-1 mt-1 my-[12px]">
                        <div className="text-xs">
                          Salvataggio: {simulation.save_method === 'auto-save' ? 'Automatico' : 
                                       simulation.save_method === 'manual-save' ? 'Manuale' : 'Completato'}
                        </div>
                        <div className="text-xs">
                          Contatti: {hasContactData(simulation) ? '✓' : '✗'}
                        </div>
                      </div>
                      {isExpired(simulation.expires_at) && <div className="text-red-600 mt-1">
                          <strong>Stato:</strong> Scaduta
                        </div>}
                    </div>}
                   
                       {!simulation.simulation_id && <div className="text-sm text-gray-600 mb-3">
                        <div className="space-y-1">
                          <div className="text-xs">
                            Salvataggio: {simulation.save_method === 'auto-save' ? 'Automatico' : 
                                         simulation.save_method === 'manual-save' ? 'Manuale' : 'Completato'}
                          </div>
                          <div className="text-xs">
                            Contatti: {hasContactData(simulation) ? '✓' : '✗'}
                          </div>
                        </div>
                        {isExpired(simulation.expires_at) && <div className="text-red-600 mt-1">
                            <strong>Stato:</strong> Scaduta
                          </div>}
                      </div>}
                   
                  
                  <div className="flex justify-end items-center gap-2">
                    <Button onClick={() => navigate(`/admin/simulations/${simulation.id}`)} variant="outline" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Dettagli
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-2" disabled={deletingId === simulation.id}>
                          {deletingId === simulation.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div> : <Trash2 className="h-4 w-4" />}
                          Elimina
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questa simulazione?
                            <br />
                            <strong>Nome:</strong> {getSimulationDisplayName(simulation)}
                            <br />
                            <strong>Codice:</strong> {simulation.resume_code}
                            <br />
                            <span className="text-red-600 font-medium">
                              Questa azione non può essere annullata.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSimulation(simulation.id)} className="bg-red-600 hover:bg-red-700">
                            Elimina Definitivamente
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </main>
    </div>;
}