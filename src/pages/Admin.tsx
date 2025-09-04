import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, FileText, Database, Users, Bell, TrendingUp, MessageSquare } from 'lucide-react';

export default function Admin() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/question-ids')}>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Question IDs</h3>
                <p className="text-sm text-gray-600">Gestisci le domande utilizzate nei form e visualizza le versioni</p>
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
          </div>
        </div>
      </main>
    </div>
  );
}
