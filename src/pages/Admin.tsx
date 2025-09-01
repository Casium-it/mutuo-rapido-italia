import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogOut, FileText, Database, Users, Bell, Blocks, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
  totalSubmissions: number;
  totalSimulations: number;
  simulationsWithContact: number;
  submissionsWithContact: number;
  recentSubmissions: number;
  recentSimulations: number;
}

export default function Admin() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    totalSimulations: 0,
    simulationsWithContact: 0,
    submissionsWithContact: 0,
    recentSubmissions: 0,
    recentSimulations: 0
  });
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Start date: July 13, 2025 00:00
      const startDate = new Date('2025-07-13T00:00:00.000Z');
      
      // Get submissions count from start date
      const { count: submissionsCount, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      if (submissionsError) throw submissionsError;

      // Get simulations count from start date
      const { count: simulationsCount, error: simulationsError } = await supabase
        .from('saved_simulations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      if (simulationsError) throw simulationsError;

      // Get simulations with contact info from start date
      const { count: simulationsWithContactCount, error: simulationsWithContactError } = await supabase
        .from('saved_simulations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .not('email', 'is', null)
        .not('phone', 'is', null)
        .not('name', 'is', null);

      if (simulationsWithContactError) throw simulationsWithContactError;

      // Get submissions with contact info from start date
      const { count: submissionsWithContactCount, error: submissionsWithContactError } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .not('phone_number', 'is', null);

      if (submissionsWithContactError) throw submissionsWithContactError;

      // Get recent submissions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentSubmissionsCount, error: recentSubmissionsError } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentSubmissionsError) throw recentSubmissionsError;

      // Get recent simulations (last 7 days)
      const { count: recentSimulationsCount, error: recentSimulationsError } = await supabase
        .from('saved_simulations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentSimulationsError) throw recentSimulationsError;

      setStats({
        totalSubmissions: submissionsCount || 0,
        totalSimulations: simulationsCount || 0,
        simulationsWithContact: simulationsWithContactCount || 0,
        submissionsWithContact: submissionsWithContactCount || 0,
        recentSubmissions: recentSubmissionsCount || 0,
        recentSimulations: recentSimulationsCount || 0
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle statistiche",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#245C4F]">Admin Dashboard</h1>
            <p className="text-gray-600">Benvenuto, {user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Submissions Totali</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{stats.totalSubmissions}</p>
                  <p className="text-xs text-gray-500">+{stats.recentSubmissions} ultimi 7gg</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Simulazioni Salvate</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSimulations}</p>
                  <p className="text-xs text-gray-500">+{stats.recentSimulations} ultimi 7gg</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">% Form Completati</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalSimulations > 0 ? Math.round((stats.totalSubmissions / stats.totalSimulations) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">submission / simulazioni</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">% Form con Contatti</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalSimulations > 0 ? Math.round((stats.submissionsWithContact / stats.totalSimulations) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">submissions contatti / simulazioni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestisci Piattaforma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/statistics')}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistiche</h3>
                <p className="text-sm text-gray-600">Visualizza statistiche dettagliate e analisi delle performance</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/notifications')}>
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestisci Notifiche</h3>
                <p className="text-sm text-gray-600">Configura le notifiche admin e i messaggi WhatsApp</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/forms')}>
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestisci Form</h3>
                <p className="text-sm text-gray-600">Visualizza e gestisci i form e i loro blocchi</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/articles')}>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestisci Articoli</h3>
                <p className="text-sm text-gray-600">Crea, modifica e pubblica articoli del blog</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/leads')}>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leads Submissions</h3>
                <p className="text-sm text-gray-600">Gestisci i lead e le submissions complete</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/simulations')}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Simulations</h3>
                <p className="text-sm text-gray-600">Visualizza le simulazioni salvate dagli utenti</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate('/admin/statistics')}
              className="bg-[#245C4F] hover:bg-[#1e4f44]"
            >
              Visualizza Statistiche
            </Button>
            <Button 
              onClick={() => navigate('/admin/leads')}
              className="bg-[#245C4F] hover:bg-[#1e4f44]"
            >
              Visualizza Tutti i Leads
            </Button>
            <Button 
              onClick={() => navigate('/admin/forms')}
              variant="outline"
            >
              Gestisci Form
            </Button>
            <Button 
              onClick={() => navigate('/admin/simulations')}
              variant="outline"
            >
              Gestisci Simulazioni
            </Button>
            <Button 
              onClick={fetchStats}
              variant="outline"
            >
              Aggiorna Statistiche
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
