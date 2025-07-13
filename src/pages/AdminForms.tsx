import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, FileText, Eye, Search, RefreshCw, Settings, Calendar, Hash } from 'lucide-react';
import { useAdminBlocks } from '@/hooks/useAdminBlocks';

export default function AdminForms() {
  const [searchTerm, setSearchTerm] = useState('');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { forms, blocks, loading, error, refetch } = useAdminBlocks();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Get block count per form
  const getFormBlockCount = (formSlug: string) => {
    return blocks.filter(block => block.form_slug === formSlug).length;
  };

  // Filter forms based on search
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.form_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
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
                <FileText className="h-6 w-6" />
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Form Totali</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{forms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Blocchi Totali</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{blocks.length}</p>
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

        {/* Search */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form Disponibili</h2>
            <p className="text-gray-600 mt-1">Seleziona un form per visualizzare i dettagli e gestire i blocchi</p>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca form..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
          <div className="grid gap-4">
            {filteredForms.map((form) => {
              const blockCount = getFormBlockCount(form.slug);
              
              return (
                <Card key={form.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#245C4F] group-hover:text-[#1e4f44] transition-colors">
                          {form.title}
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
                      </div>
                      <Button
                        onClick={() => navigate(`/admin/forms/${form.slug}`)}
                        className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Visualizza
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">ID:</span>
                        <code className="text-xs bg-gray-100 px-1 rounded font-mono">
                          {form.id.split('-')[0]}...
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Blocchi:</span>
                        <Badge variant="outline" className="text-xs">
                          {blockCount}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Attivo:</span>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          Sì
                        </Badge>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          onClick={() => navigate(`/admin/forms/${form.slug}`)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Dettagli →
                        </Button>
                      </div>
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