
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Blocks, Eye, Settings, Users, Search } from 'lucide-react';
import { allBlocks } from '@/data/blocks';
import { Input } from '@/components/ui/input';

export default function AdminBlocks() {
  const [searchTerm, setSearchTerm] = useState('');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Filter blocks based on search term
  const filteredBlocks = allBlocks.filter(block => 
    block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.block_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBlockTypeLabel = (block: any) => {
    const labels = [];
    if (block.default_active) labels.push('Attivo di default');
    if (block.multiBlock) labels.push('Multi-blocco');
    if (block.invisible) labels.push('Invisibile');
    if (block.blueprint_id) labels.push('Blueprint');
    return labels;
  };

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
        {/* Search and Stats */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Blocchi del Form</h2>
            <p className="text-gray-600">
              Totale: {allBlocks.length} blocchi | Visualizzati: {filteredBlocks.length}
            </p>
          </div>
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca blocchi per titolo o ID..."
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
                  {searchTerm ? 'Nessun blocco trovato' : 'Nessun blocco disponibile'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Prova a modificare i termini di ricerca.' 
                    : 'Non ci sono blocchi configurati nel sistema.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBlocks.map((block) => (
              <Card key={block.block_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-[#245C4F]">#{block.block_number}</span>
                        {block.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: <code className="bg-gray-100 px-1 rounded text-xs">{block.block_id}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Priorità: {block.priority}
                      </Badge>
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

                  {/* Questions Preview */}
                  {block.questions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Domande nel blocco:</h4>
                      <div className="space-y-1">
                        {block.questions.slice(0, 3).map((question) => (
                          <div key={question.question_id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium text-xs text-gray-500">
                              {question.question_number}:
                            </span>
                            <span className="ml-2">
                              {question.question_text.length > 80 
                                ? `${question.question_text.substring(0, 80)}...` 
                                : question.question_text
                              }
                            </span>
                          </div>
                        ))}
                        {block.questions.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            ... e altre {block.questions.length - 3} domande
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
