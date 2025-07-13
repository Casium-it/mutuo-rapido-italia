import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Database, Eye, Settings, Search, RefreshCw, Blocks } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAdminBlocks } from '@/hooks/useAdminBlocks';

export default function AdminForms() {
  const [searchTerm, setSearchTerm] = useState('');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { forms, loading, error, getStats, refetch } = useAdminBlocks();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const stats = getStats();
  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.form_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFormBlockCount = (formSlug: string) => {
    return stats.blocksByForm.find(stat => stat.formSlug === formSlug)?.count || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f5f1] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Errore nel caricamento</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} className="bg-[#245C4F] hover:bg-[#1e4f44]">
              <RefreshCw className="h-4 w-4 mr-2" />
              Riprova
            </Button>
          </CardContent>
        </Card>
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
              <h1 className="text-2xl font-bold text-[#245C4F] flex items-center gap-2">
                <Database className="h-6 w-6" />
                Gestione Form
              </h1>
              <p className="text-gray-600">Benvenuto, {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={refetch}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Aggiorna
            </Button>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Form Totali</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{stats.totalForms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Blocchi Totali</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{stats.totalBlocks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Visualizzati</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{filteredForms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form del Database</h2>
            <p className="text-gray-600 mt-1">Gestisci i form e i loro blocchi</p>
          </div>
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca form..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
              onClick={() => navigate('/admin/blocks')}
            >
              <Settings className="h-4 w-4" />
              Vista Globale Blocchi
            </Button>
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nessun form trovato' : 'Nessun form disponibile'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Prova a modificare i termini di ricerca.' 
                    : 'Non ci sono form configurati nel database.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredForms.map((form) => {
              const blockCount = getFormBlockCount(form.slug);
              
              return (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#245C4F] flex items-center gap-2">
                          {form.title}
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Attivo
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>
                            Slug: <code className="bg-gray-100 px-1 rounded text-xs">{form.slug}</code>
                          </span>
                          <span>•</span>
                          <span>
                            Tipo: <Badge variant="outline" className="text-xs">{form.form_type}</Badge>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Form per simulazioni mutui</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Form Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Database className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Blocchi:</span>
                        <span className="font-medium">{blockCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Stato:</span>
                        <Badge variant="default" className="text-xs">
                          Attivo
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => navigate(`/admin/blocks?form=${form.slug}`)}
                        className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
                      >
                        <Blocks className="h-4 w-4" />
                        Gestisci Blocchi ({blockCount})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}