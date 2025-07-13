import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, User, Phone, Mail, FileText, Trash2, Eye, RefreshCw } from 'lucide-react';
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
  is_auto_save: boolean | null;
  simulation_id: string | null;
  form_state: any;
}

export default function AdminSimulations() {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_simulations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching simulations:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle simulazioni",
          variant: "destructive"
        });
      } else {
        setSimulations(data || []);
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
      const { error } = await supabase
        .from('saved_simulations')
        .delete()
        .eq('id', simulationId);

      if (error) {
        console.error('Error deleting simulation:', error);
        throw error;
      }

      // Update local state
      setSimulations(prev => prev.filter(s => s.id !== simulationId));
      
      toast({
        title: "Successo",
        description: "Simulazione eliminata con successo",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento simulazioni...</p>
        </div>
      </div>
    );
  }

  const autoSaveSimulations = simulations.filter(s => s.is_auto_save);
  const manualSimulations = simulations.filter(s => !s.is_auto_save);
  const expiredSimulations = simulations.filter(s => isExpired(s.expires_at));

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <Clock className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Scadute</p>
                  <p className="text-2xl font-bold text-red-600">{expiredSimulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulazioni Salvate</h2>
          <p className="text-gray-600">Visualizza tutte le simulazioni salvate dagli utenti</p>
        </div>

        {simulations.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna simulazione trovata</h3>
                <p className="text-gray-600">Le simulazioni appariranno qui quando gli utenti le salveranno.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {simulations.map((simulation) => (
              <Card key={simulation.id} className={`hover:shadow-md transition-shadow ${isExpired(simulation.expires_at) ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getSimulationDisplayName(simulation)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {simulation.form_slug}
                      </Badge>
                      <Badge className={`${simulation.percentage === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {simulation.percentage}% completata
                      </Badge>
                      {simulation.is_auto_save && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Auto-salvata
                        </Badge>
                      )}
                      {isExpired(simulation.expires_at) && (
                        <Badge className="bg-red-100 text-red-800">
                          Scaduta
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      Aggiornata: {formatDate(simulation.updated_at)}
                    </div>
                    {simulation.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {simulation.phone}
                      </div>
                    )}
                    {simulation.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {simulation.email}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <strong>Codice Ripresa:</strong> {simulation.resume_code}
                    </div>
                    <div>
                      <strong>Creata:</strong> {formatDate(simulation.created_at)}
                    </div>
                    <div>
                      <strong>Scadenza:</strong> {formatDate(simulation.expires_at)}
                    </div>
                  </div>

                  {simulation.simulation_id && (
                    <div className="text-sm text-gray-600 mb-4">
                      <strong>ID Simulazione:</strong> {simulation.simulation_id}
                    </div>
                  )}
                  
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      onClick={() => {
                        // Navigate to resume simulation page
                        window.open(`/riprendi/${simulation.resume_code}`, '_blank');
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizza Simulazione
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-2"
                          disabled={deletingId === simulation.id}
                        >
                          {deletingId === simulation.id ? (
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
                          <AlertDialogAction
                            onClick={() => handleDeleteSimulation(simulation.id)}
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