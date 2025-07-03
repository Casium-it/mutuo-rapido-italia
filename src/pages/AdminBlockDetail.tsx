import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Blocks, Settings, Users, FileText, Hash, Eye, EyeOff, ExternalLink, Plus, GitBranch, Database, RefreshCw } from 'lucide-react';
import { BlockFlowMap } from '@/components/admin/BlockFlowMap';
import { supabase } from '@/integrations/supabase/client';
import { Block } from '@/types/form';

interface AdminBlockDetail extends Block {
  form_id: string;
  form_title: string;
  form_slug: string;
  form_type: string;
}

export default function AdminBlockDetail() {
  const { blockId } = useParams<{ blockId: string }>();
  const [searchParams] = useSearchParams();
  const formSlug = searchParams.get('form');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [showFlowMap, setShowFlowMap] = useState(false);
  const [block, setBlock] = useState<AdminBlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    loadBlockFromDatabase();
  }, [blockId, formSlug]);

  const loadBlockFromDatabase = async () => {
    if (!blockId) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('form_blocks')
        .select(`
          id,
          block_data,
          sort_order,
          form_id,
          forms!inner(
            id,
            title,
            slug,
            form_type
          )
        `);

      // If we have a form filter, use it
      if (formSlug) {
        query = query.eq('forms.slug', formSlug);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Find the block with matching block_id in the block_data
      const blockData = data?.find((item: any) => {
        const blockContent = item.block_data as Block;
        return blockContent.block_id === blockId;
      });

      if (!blockData) {
        setError(`Blocco con ID "${blockId}" non trovato nel database.`);
        return;
      }

      const blockContent = blockData.block_data as Block;
      const blockWithForm: AdminBlockDetail = {
        ...blockContent,
        form_id: blockData.form_id,
        form_title: blockData.forms.title,
        form_slug: blockData.forms.slug,
        form_type: blockData.forms.form_type,
      };

      setBlock(blockWithForm);
    } catch (err) {
      console.error('Error loading block from database:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento blocco...</p>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="min-h-screen bg-[#f8f5f1] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Blocco non trovato</h3>
            <p className="text-gray-600 mb-4">
              {error || `Il blocco con ID "${blockId}" non esiste nel database.`}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/admin/blocks')} variant="outline">
                Torna ai Blocchi
              </Button>
              <Button onClick={loadBlockFromDatabase} className="bg-[#245C4F] hover:bg-[#1e4f44]">
                <RefreshCw className="h-4 w-4 mr-2" />
                Riprova
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBlockTypeLabel = (block: any) => {
    const labels = [];
    if (block.default_active) labels.push('Attivo di default');
    if (block.multiBlock) labels.push('Multi-blocco');
    if (block.invisible) labels.push('Invisibile');
    if (block.blueprint_id) labels.push('Blueprint');
    return labels;
  };

  const getPlaceholderTypeIcon = (type: string) => {
    switch (type) {
      case 'select':
        return <Hash className="h-3 w-3" />;
      case 'input':
        return <FileText className="h-3 w-3" />;
      case 'MultiBlockManager':
        return <Blocks className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getLeadsToStyles = (leadsTo: string) => {
    if (leadsTo === 'next_block') {
      return 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs';
    } else if (leadsTo === 'stop_flow') {
      return 'bg-red-200 text-red-800 px-2 py-1 rounded text-xs';
    } else {
      return 'bg-white px-2 py-1 rounded text-xs';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin/blocks')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna ai Blocchi
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F] flex items-center gap-2">
                <Blocks className="h-6 w-6" />
                Dettagli Blocco #{block.block_number}
              </h1>
              <p className="text-gray-600">
                Form: {block.form_title} • Benvenuto, {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={loadBlockFromDatabase}
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
        {/* Block Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-sm font-mono">
                    Priorità: {block.priority}
                  </Badge>
                  <Badge className="bg-[#245C4F]/10 text-[#245C4F] hover:bg-[#245C4F]/20">
                    {block.form_title}
                  </Badge>
                  {block.title}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{block.block_id}</code>
                  <span className="mx-2">•</span>
                  Form: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{block.form_slug}</code>
                </p>
              </div>
              <Button
                onClick={() => setShowFlowMap(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <GitBranch className="h-4 w-4" />
                Visualizza Mappa Flusso
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Informazioni Base</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Domande:</span>
                    <span className="font-medium">{block.questions.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Numero blocco:</span>
                    <span className="font-medium">{block.block_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Tipo form:</span>
                    <span className="font-medium">{block.form_type}</span>
                  </div>
                  {block.copy_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Copia numero:</span>
                      <span className="font-medium">{block.copy_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Properties */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Proprietà</h4>
                <div className="flex flex-wrap gap-2">
                  {getBlockTypeLabel(block).map((label, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  {getBlockTypeLabel(block).length === 0 && (
                    <span className="text-sm text-gray-500">Nessuna proprietà speciale</span>
                  )}
                </div>
              </div>

              {/* Blueprint Info */}
              {block.blueprint_id && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Blueprint</h4>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">ID Blueprint:</span>
                    </div>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm mt-1 block">
                      {block.blueprint_id}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Domande del Blocco ({block.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {block.questions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nessuna domanda in questo blocco</p>
              </div>
            ) : (
              <div className="space-y-6">
                {block.questions.map((question, index) => (
                  <Card key={question.question_id} className="border-l-4 border-l-[#245C4F]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{question.question_number}
                            </Badge>
                            Domanda {index + 1}
                          </CardTitle>
                          <code className="text-xs text-gray-500 mt-1">
                            ID: {question.question_id}
                          </code>
                        </div>
                        <div className="flex gap-1">
                          {question.inline && (
                            <Badge variant="secondary" className="text-xs">Inline</Badge>
                          )}
                          {question.endOfForm && (
                            <Badge variant="secondary" className="text-xs">Fine Form</Badge>
                          )}
                          {question.skippableWithNotSure && (
                            <Badge variant="secondary" className="text-xs">Saltabile</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Question Text */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Testo della domanda:</h5>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">
                          {question.question_text}
                        </p>
                      </div>

                      {/* Question Notes */}
                      {question.question_notes && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Note:</h5>
                          <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded">
                            {question.question_notes}
                          </p>
                        </div>
                      )}

                      {/* Placeholders */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">
                          Placeholder ({Object.keys(question.placeholders).length})
                        </h5>
                        {Object.keys(question.placeholders).length === 0 ? (
                          <p className="text-gray-500 text-sm">Nessun placeholder configurato</p>
                        ) : (
                          <div className="grid gap-4">
                            {Object.entries(question.placeholders).map(([key, placeholder]) => (
                              <div key={key} className="border rounded-lg p-4 bg-white shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  {getPlaceholderTypeIcon(placeholder.type)}
                                  <span className="font-semibold text-base">{key}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {placeholder.type}
                                  </Badge>
                                </div>
                                
                                {/* Select Placeholder Details */}
                                {placeholder.type === 'select' && (
                                  <div className="space-y-3">
                                    {placeholder.placeholder_label && (
                                      <div className="text-sm">
                                        <span className="font-medium text-gray-700">Label:</span>
                                        <span className="ml-2 text-gray-600">{placeholder.placeholder_label}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium text-gray-700 text-sm">
                                        Opzioni ({placeholder.options?.length || 0}):
                                      </span>
                                      <div className="mt-2 space-y-2">
                                        {placeholder.options?.map((option, optIndex) => (
                                          <div key={optIndex} className="bg-gray-50 rounded p-3 border-l-2 border-blue-200">
                                            <div className="space-y-2 text-sm">
                                              <div>
                                                <span className="font-medium text-gray-700">ID:</span>
                                                <code className="ml-2 bg-white px-2 py-1 rounded text-xs">{option.id}</code>
                                              </div>
                                              <div>
                                                <span className="font-medium text-gray-700">Label:</span>
                                                <span className="ml-2 text-gray-600">{option.label}</span>
                                              </div>
                                              <div>
                                                <span className="font-medium text-gray-700">Leads to:</span>
                                                <code className={getLeadsToStyles(option.leads_to)}>{option.leads_to}</code>
                                              </div>
                                              {option.add_block && (
                                                <div>
                                                  <span className="font-medium text-gray-700">Add block:</span>
                                                  <div className="flex items-center gap-1 mt-1">
                                                    <Plus className="h-3 w-3 text-green-600" />
                                                    <code className="bg-green-50 px-2 py-1 rounded text-xs text-green-800">{option.add_block}</code>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )) || (
                                          <p className="text-gray-500 text-sm italic">Nessuna opzione configurata</p>
                                        )}
                                      </div>
                                    </div>
                                    {placeholder.multiple && (
                                      <div className="text-sm">
                                        <Badge variant="secondary" className="text-xs">Selezione multipla</Badge>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Input Placeholder Details */}
                                {placeholder.type === 'input' && (
                                  <div className="space-y-2">
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Tipo input:</span>
                                        <Badge variant="outline" className="ml-2 text-xs">{placeholder.input_type}</Badge>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Validazione:</span>
                                        <Badge variant="outline" className="ml-2 text-xs">{placeholder.input_validation}</Badge>
                                      </div>
                                      {placeholder.placeholder_label && (
                                        <div>
                                          <span className="font-medium text-gray-700">Label:</span>
                                          <span className="ml-2 text-gray-600">{placeholder.placeholder_label}</span>
                                        </div>
                                      )}
                                      {placeholder.leads_to && (
                                        <div>
                                          <span className="font-medium text-gray-700">Leads to:</span>
                                          <code className={getLeadsToStyles(placeholder.leads_to)}>{placeholder.leads_to}</code>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* MultiBlockManager Placeholder Details */}
                                {placeholder.type === 'MultiBlockManager' && (
                                  <div className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Blueprint:</span>
                                        <div className="flex items-center gap-1 mt-1">
                                          <Blocks className="h-3 w-3 text-blue-600" />
                                          <code className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-800">{placeholder.blockBlueprint}</code>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Add Block Label:</span>
                                        <span className="ml-2 text-gray-600">{placeholder.add_block_label}</span>
                                      </div>
                                      {placeholder.placeholder_label && (
                                        <div>
                                          <span className="font-medium text-gray-700">Label:</span>
                                          <span className="ml-2 text-gray-600">{placeholder.placeholder_label}</span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-medium text-gray-700">Leads to:</span>
                                        <code className={getLeadsToStyles(placeholder.leads_to)}>{placeholder.leads_to}</code>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Flow Map Dialog */}
      <BlockFlowMap 
        block={block}
        isOpen={showFlowMap}
        onClose={() => setShowFlowMap(false)}
      />
    </div>
  );
}
