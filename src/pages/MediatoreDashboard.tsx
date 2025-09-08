import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Users, Bell } from 'lucide-react';

export default function MediatoreDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#245C4F]">Mediatore Dashboard</h1>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestisci Attività</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/mediatore/leads')}
            >
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-[#245C4F] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestisci Lead</h3>
                <p className="text-sm text-gray-600">Visualizza e gestisci i tuoi lead assegnati</p>
              </CardContent>
            </Card>

            <Card className="opacity-50 cursor-not-allowed">
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Gestisci Notifiche</h3>
                <p className="text-sm text-gray-400">Configura le tue preferenze di notifica</p>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                    Prossimamente
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}