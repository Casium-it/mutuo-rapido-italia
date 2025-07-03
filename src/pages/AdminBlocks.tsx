
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Blocks, Eye, Settings, Users, Search, Database, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminBlocks } from '@/hooks/useAdminBlocks';

export default function AdminBlocks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [formFilter, setFormFilter] = useState<string>('all');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { blocks, forms, loading, error, getFilteredBlocks, getStats, refetch } = useAdminBlocks();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const stats = getStats();
  const filteredBlocks = getFilteredBlocks(formFilter === 'all' ? null : formFilter)
    .filter(block => 
      block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.block_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.form_title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.priority - b.priority);

  const getBlockTypeLabel = (block: any) => {
    const labels = [];
    if (block.default_active) labels.push('Attivo di default');
    if (block.multiBlock) labels.push('Multi-blocco');
    if (block.invisible) labels.push('Invisibile');
    if (block.blueprint_id) labels.push('Blueprint');
    return labels;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento blocchi...</p>
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
                <Blocks className="h-6 w-6" />
                Gestione Blocchi
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
                <Blocks className="h-5 w-5 text-[#245C4F]" />
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
                <Database className="h-5 w-5 text-[#245C4F]" />
                <div>
                  <p className="text-sm text-gray-600">Form Attivi</p>
                  <p className="text-2xl font-bold text-[#245C4F]">{stats.totalForms}</p>
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
                  <p className="text-2xl font-bold text-[#245C4F]">{filteredBlocks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Blocchi del Database</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {stats.blocksByForm.map((formStat) => (
                <Badge key={formStat.formSlug} variant="outline" className="text-xs">
                  {formStat.formTitle}: {formStat.count}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 max-w-md">
            <Select value={formFilter} onValueChange={setFormFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtra per form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i Form</SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.slug}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca blocchi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Blocks Grid */}
        {filteredBlocks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Blocks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || formFilter !== 'all' ? 'Nessun blocco trovato' : 'Nessun blocco disponibile'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || formFilter !== 'all'
                    ? 'Prova a modificare i termini di ricerca o il filtro per form.' 
                    : 'Non ci sono blocchi configurati nel database.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBlocks.map((block) => (
              <Card key={`${block.form_id}-${block.block_id}`} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                          Priorità: {block.priority}
                        </Badge>
                        <Badge className="text-xs bg-[#245C4F]/10 text-[#245C4F] hover:bg-[#245C4F]/20">
                          {block.form_title}
                        </Badge>
                        <span className="text-[#245C4F]">#{block.block_number}</span>
                        {block.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: <code className="bg-gray-100 px-1 rounded text-xs">{block.block_id}</code>
                        <span className="mx-2">•</span>
                        Form: <code className="bg-gray-100 px-1 rounded text-xs">{block.form_slug}</code>
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Block Properties */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Domande:</span>
                        <span className="font-medium">{block.questions.length}</span>
                      </div>
                      {block.blueprint_id && (
                        <div className="flex items-center gap-2 text-sm">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Blueprint:</span>
                          <code className="bg-gray-100 px-1 rounded text-xs">{block.blueprint_id}</code>
                        </div>
                      )}
                      {block.copy_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Copia numero:</span>
                          <span className="font-medium">{block.copy_number}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Block Type Badges */}
                    <div className="flex flex-wrap gap-1">
                      {getBlockTypeLabel(block).map((label, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => navigate(`/admin/blocks/${block.block_id}?form=${block.form_slug}`)}
                      className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizza Dettagli
                    </Button>
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
