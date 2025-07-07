import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Blocks, Settings, Users, FileText, Hash, Database, RefreshCw, Plus, GitBranch, Save, Undo2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Block } from '@/types/form';
import { FlowVisualization } from '@/components/admin/flow-visualization/FlowVisualization';

import { EditableFlowChart } from '@/components/admin/flow-editing/EditableFlowChart';
import { FlowEditProvider, useFlowEdit } from '@/contexts/FlowEditContext';
import { CreateQuestionDialog } from '@/components/admin/flow-editing/CreateQuestionDialog';
import { getBlockValidation, BlockValidation, BlockActivatorUnion } from '@/utils/blockValidation';

interface AdminBlockDetail extends Block {
  form_id: string;
  form_title: string;
  form_slug: string;
  form_type: string;
}

function AdminBlockDetailContent() {
  const { blockId } = useParams<{ blockId: string }>();
  const [searchParams] = useSearchParams();
  const formSlug = searchParams.get('form');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [block, setBlock] = useState<AdminBlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFlowVisualization, setShowFlowVisualization] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [createQuestionDialog, setCreateQuestionDialog] = useState(false);

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

      if (formSlug) {
        query = query.eq('forms.slug', formSlug);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

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

  const handleSaveBlock = async (updatedBlock: Block) => {
    if (!block) return;

    try {
      // Find the specific form_blocks record to update
      const { data: blockRecords, error: fetchError } = await supabase
        .from('form_blocks')
        .select('id, block_data')
        .eq('form_id', block.form_id);

      if (fetchError) throw fetchError;

      const targetRecord = blockRecords?.find((record: any) => {
        const blockContent = record.block_data as Block;
        return blockContent.block_id === blockId;
      });

      if (!targetRecord) {
        throw new Error('Record del blocco non trovato');
      }

      // Update the block data
      const { error: updateError } = await supabase
        .from('form_blocks')
        .update({
          block_data: updatedBlock,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetRecord.id);

      if (updateError) throw updateError;

      // Update local state
      setBlock(prev => prev ? { ...prev, ...updatedBlock } : null);
      
      console.log('Blocco salvato con successo');
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      throw error;
    }
  };

  const renderActivationSources = (activators: BlockActivatorUnion[], hasDefault: boolean) => {
    return (
      <div className="space-y-1">
        {hasDefault && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
            DEFAULT
          </Badge>
        )}
        
        {activators.map((activator, index) => (
          <div key={index} className="text-xs text-gray-600">
            {activator.type === 'option' ? (
              <>
                {activator.blockTitle} → {activator.questionId} → {activator.optionLabel}
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 mr-1">
                  MULTI-BLOCK
                </Badge>
                {activator.blockTitle} → {activator.questionId} → {activator.blueprintPattern}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderValidationStatus = (validation: BlockValidation) => {
    const hasActivationError = !validation.activationSources.isValid;
    const hasLeadsToError = !validation.leadsToValidation.isValid;
    const hasAnyError = hasActivationError || hasLeadsToError;

    // Check if this is a multi-block with special leads_to back reference
    const multiBlockActivator = validation.activationSources.activators.find(a => a.type === 'multiblock');
    const hasBackReference = multiBlockActivator && validation.leadsToValidation.isValid;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
          Verifiche Blocco
        </h4>
        
        {/* Activation Sources */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {hasActivationError ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">Attivazione da blocchi:</span>
          </div>
          
          <div className="ml-6">
            {validation.activationSources.activators.length > 0 || validation.activationSources.hasDefault ? (
              renderActivationSources(validation.activationSources.activators, validation.activationSources.hasDefault)
            ) : (
              <div className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Nessun blocco di attivazione trovato
              </div>
            )}
          </div>
        </div>

        {/* Leads To Validation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {hasLeadsToError ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">Riferimenti leads_to:</span>
          </div>
          
          {hasLeadsToError ? (
            <div className="ml-6 space-y-1">
              {validation.leadsToValidation.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {error}
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-6 space-y-1">
              <div className="text-xs text-green-600">
                Tutti i riferimenti sono validi
              </div>
              {hasBackReference && multiBlockActivator && (
                <div className="text-xs text-purple-600 flex items-center gap-1">
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                    MULTI-BLOCK
                  </Badge>
                  Leads to - back to: {multiBlockActivator.questionId}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
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
              onClick={() => setShowFlowVisualization(!showFlowVisualization)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4" />
              {showFlowVisualization ? 'Nascondi Mappa' : 'Visualizza Mappa Flusso'}
            </Button>
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
        {/* Flow Visualization */}
        {showFlowVisualization && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  {editMode ? 'Mappa Flusso Editabile' : 'Mappa Flusso Orizzontale del Blocco'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {editMode ? 'Modalità Lettura' : 'Modalità Editing'}
                  </Button>
                  {editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setCreateQuestionDialog(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Nuova Domanda
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EditableFlowChart block={block} />
            </CardContent>
          </Card>
        )}

        {/* Block Verification Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Verifica Integrità Blocco
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Load all blocks for validation - we need this context
              const [allBlocks, setAllBlocks] = useState<Array<Block & { form_id: string; form_title: string; form_slug: string; form_type: string }>>([]);
              const [validationLoading, setValidationLoading] = useState(true);

              useEffect(() => {
                const loadAllBlocks = async () => {
                  try {
                    const { data: blocksData, error: blocksError } = await supabase
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
                      `)
                      .order('sort_order');

                    if (blocksError) throw blocksError;

                    const transformedBlocks = (blocksData || []).map((item: any) => {
                      const blockData = item.block_data as Block;
                      return {
                        ...blockData,
                        form_id: item.form_id,
                        form_title: item.forms.title,
                        form_slug: item.forms.slug,
                        form_type: item.forms.form_type,
                      };
                    });

                    setAllBlocks(transformedBlocks);
                  } catch (err) {
                    console.error('Error loading blocks for validation:', err);
                  } finally {
                    setValidationLoading(false);
                  }
                };

                loadAllBlocks();
              }, []);

              if (validationLoading) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-gray-600">Verifica in corso...</span>
                  </div>
                );
              }

              const validation = getBlockValidation(block, allBlocks);
              const hasValidationErrors = !validation.activationSources.isValid || !validation.leadsToValidation.isValid;

              return (
                <div className={`p-4 rounded-lg border ${hasValidationErrors ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                  {renderValidationStatus(validation)}
                </div>
              );
            })()}
          </CardContent>
        </Card>

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
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {createQuestionDialog && (
        <CreateQuestionDialog
          open={createQuestionDialog}
          onClose={() => setCreateQuestionDialog(false)}
        />
      )}
    </div>
  );
}

// Edit Controls Component
function EditControls() {
  const { state, saveChanges, undoLastChange, canUndo } = useFlowEdit();

  return (
    <>
      {state.hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Modifiche non salvate
            </div>
            <div className="flex gap-2">
              <Button
                onClick={undoLastChange}
                disabled={!canUndo}
                variant="outline"
                size="sm"
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Annulla
              </Button>
              <Button
                onClick={saveChanges}
                disabled={state.isAutoSaving}
                size="sm"
                className="bg-[#245C4F] hover:bg-[#1e4f44]"
              >
                {state.isAutoSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Salva
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminBlockDetail() {
  const { blockId } = useParams<{ blockId: string }>();
  const [searchParams] = useSearchParams();
  const formSlug = searchParams.get('form');
  const [block, setBlock] = useState<AdminBlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load block data first
  useEffect(() => {
    const loadBlock = async () => {
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
    loadBlock();
  }, []);

  if (loading || !block) {
    return <div>Loading...</div>;
  }

  const handleSaveBlock = async (updatedBlock: Block) => {
    if (!block) return;

    try {
      // Find the specific form_blocks record to update
      const { data: blockRecords, error: fetchError } = await supabase
        .from('form_blocks')
        .select('id, block_data')
        .eq('form_id', block.form_id);

      if (fetchError) throw fetchError;

      const targetRecord = blockRecords?.find((record: any) => {
        const blockContent = record.block_data as Block;
        return blockContent.block_id === blockId;
      });

      if (!targetRecord) {
        throw new Error('Record del blocco non trovato');
      }

      // Update the block data
      const { error: updateError } = await supabase
        .from('form_blocks')
        .update({
          block_data: updatedBlock,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetRecord.id);

      if (updateError) throw updateError;

      // Update local state
      setBlock(prev => prev ? { ...prev, ...updatedBlock } : null);
      
      console.log('Blocco salvato con successo');
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      throw error;
    }
  };

  return (
    <FlowEditProvider initialBlock={block} onSave={handleSaveBlock}>
      <AdminBlockDetailContent />
      <EditControls />
    </FlowEditProvider>
  );
}
