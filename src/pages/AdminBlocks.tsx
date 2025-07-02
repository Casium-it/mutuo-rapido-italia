
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Blocks, Eye, Settings, Users, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminBlockService, AdminBlock, FormSummary } from '@/services/adminBlockService';
import { toast } from '@/hooks/use-toast';

export default function AdminBlocks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<string>(searchParams.get('form') || 'all');
  const [blocks, setBlocks] = useState<AdminBlock[]>([]);
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [selectedForm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load forms first
      const formsData = await adminBlockService.getAllForms();
      setForms(formsData);
      
      // Load blocks based on selected form
      await loadBlocks();
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBlocks = async () => {
    try {
      let blocksData: AdminBlock[];
      
      if (selectedForm === 'all') {
        blocksData = await adminBlockService.getAllBlocks();
      } else {
        blocksData = await adminBlockService.getBlocksByForm(selectedForm);
      }
      
      setBlocks(blocksData);
    } catch (err) {
      console.error('Error loading blocks:', err);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei blocchi",
        variant: "destructive"
      });
    }
  };

  const handleFormChange = (value: string) => {
    setSelectedForm(value);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('form');
    } else {
      newParams.set('form', value);
    }
    setSearchParams(newParams);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Filter blocks based on search term
  const filteredBlocks = blocks.filter(block => 
    block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.blockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.formTitle.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.priority - b.priority);

  const getBlockTypeLabels = (block: AdminBlock) => {
    const labels = [];
    if (block.properties.defaultActive) labels.push('Attivo di default');
    if (block.properties.multiBlock) labels.push('Multi-blocco');
    if (block.properties.invisible) labels.push('Invisibile');
    if (block.properties.blueprintId) labels.push('Blueprint');
    return labels;
  };

  const getSelectedFormTitle = () => {
    if (selectedForm === 'all') return 'Tutti i form';
    const form = forms.find(f => f.slug === selectedForm);
    return form?.title || selectedForm;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento blocchi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Errore</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadData}>Riprova</Button>
            </div>
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
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Stats */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Blocchi del Database</h2>
              <p className="text-gray-600">
                {selectedForm === 'all' 
                  ? `Totale: ${blocks.length} blocchi da ${forms.length} form` 
                  : `${filteredBlocks.length} blocchi da ${getSelectedFormTitle()}`
                } | Visualizzati: {filteredBlocks.length}
              </p>
            </div>
            <Button onClick={loadData} variant="outline">
              Aggiorna
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Form Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedForm} onValueChange={handleFormChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleziona form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i form</SelectItem>
                  {forms.map((form) => (
                    <SelectItem key={form.slug} value={form.slug}>
                      {form.title} ({form.blockCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca blocchi per titolo, ID o form..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                  {searchTerm ? 'Nessun blocco trovato' : 'Nessun blocco disponibile'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Prova a modificare i termini di ricerca o il filtro form.' 
                    : 'Non ci sono blocchi nel database per il form selezionato.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBlocks.map((block) => (
              <Card key={`${block.formSlug}-${block.blockId}`} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                          Priorità: {block.priority}
                        </Badge>
                        <span className="text-[#245C4F]">#{block.blockNumber}</span>
                        <span>{block.title}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm text-gray-500">
                          ID: <code className="bg-gray-100 px-1 rounded text-xs">{block.blockId}</code>
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {block.formTitle}
                        </Badge>
                      </div>
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
                        <span className="font-medium">{block.questionCount}</span>
                      </div>
                      {block.properties.blueprintId && (
                        <div className="flex items-center gap-2 text-sm">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Blueprint:</span>
                          <code className="bg-gray-100 px-1 rounded text-xs">{block.properties.blueprintId}</code>
                        </div>
                      )}
                      {block.properties.copyNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Copia numero:</span>
                          <span className="font-medium">{block.properties.copyNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Block Type Badges */}
                    <div className="flex flex-wrap gap-1">
                      {getBlockTypeLabels(block).map((label, index) => (
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
                      onClick={() => navigate(`/admin/blocks/${block.blockId}?form=${block.formSlug}`)}
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
