
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Database, Blocks, Eye, Settings, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Block } from '@/types/form';
import { getBlockValidation, BlockValidation, BlockActivatorUnion } from '@/utils/blockValidation';

interface FormData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  form_type: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  completion_behavior: string;
}

interface AdminBlock extends Block {
  form_id: string;
  form_title: string;
  form_slug: string;
  form_type: string;
}

export default function AdminFormDetail() {
  const { formSlug } = useParams<{ formSlug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [blocks, setBlocks] = useState<AdminBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formSlug) {
      fetchFormDetails();
    }
  }, [formSlug]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', formSlug)
        .single();

      if (formError) {
        console.error('Error fetching form:', formError);
        toast({
          title: "Errore",
          description: "Form non trovato",
          variant: "destructive"
        });
        navigate('/admin/forms');
        return;
      }

      // Fetch form blocks
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
        .eq('form_id', formData.id)
        .order('sort_order');

      if (blocksError) {
        console.error('Error fetching blocks:', blocksError);
      }

      // Transform database blocks to AdminBlock format
      const transformedBlocks: AdminBlock[] = (blocksData || []).map((item: any) => {
        const blockData = item.block_data as Block;
        return {
          ...blockData,
          form_id: item.form_id,
          form_title: item.forms.title,
          form_slug: item.forms.slug,
          form_type: item.forms.form_type,
        };
      });

      setFormData(formData);
      setBlocks(transformedBlocks);
    } catch (err) {
      console.error('Error loading form details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    const hasAddBlockError = !validation.addBlockValidation.isValid;
    const hasAnyError = hasActivationError || hasLeadsToError || hasAddBlockError;

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

        {/* Add Block Validation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {hasAddBlockError ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">Riferimenti add_block:</span>
          </div>
          
          {hasAddBlockError ? (
            <div className="ml-6 space-y-1">
              {validation.addBlockValidation.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {error}
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-6 space-y-1">
              <div className="text-xs text-green-600">
                Tutti i riferimenti add_block sono validi
              </div>
            </div>
          )}
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento dettagli form...</p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Form non trovato</h1>
          <Button onClick={() => navigate('/admin/forms')}>Torna ai Form</Button>
        </div>
      </div>
    );
  }

  const getSpecialLabels = (block: AdminBlock) => {
    const labels = [];
    if (block.default_active) labels.push('Attivo di default');
    if (block.multiBlock) labels.push('Multi-blocco');
    if (block.invisible) labels.push('Invisibile');
    return labels;
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            onClick={() => navigate('/admin/forms')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#245C4F]">Dettagli Form: {formData.title}</h1>
            <p className="text-gray-600">Benvenuto, {user?.email}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => navigate(`/admin/forms/${formSlug}?tab=${value}`)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Informazioni Generali</TabsTrigger>
            <TabsTrigger value="blocks">Blocchi ({blocks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informazioni Form</span>
                  <div className="flex gap-2">
                    <Badge variant={formData.is_active ? "default" : "secondary"}>
                      {formData.is_active ? "Attivo" : "Inattivo"}
                    </Badge>
                    <Badge variant="outline">v{formData.version}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Titolo</label>
                      <p className="text-lg font-semibold">{formData.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Slug</label>
                      <p className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{formData.slug}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tipo Form</label>
                      <p>{formData.form_type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Comportamento Completamento</label>
                      <p>{formData.completion_behavior}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Creato il</label>
                      <p>{formatDate(formData.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ultimo aggiornamento</label>
                      <p>{formatDate(formData.updated_at)}</p>
                    </div>
                  </div>
                </div>
                
                {formData.description && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm font-medium text-gray-600">Descrizione</label>
                    <p className="mt-1">{formData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Blocks className="h-5 w-5 text-[#245C4F]" />
                    <div>
                      <p className="text-sm text-gray-600">Blocchi Totali</p>
                      <p className="text-2xl font-bold text-[#245C4F]">{blocks.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Domande Totali</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {blocks.reduce((total, block) => total + block.questions.length, 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Blocchi Attivi Default</p>
                      <p className="text-2xl font-bold text-green-600">
                        {blocks.filter(block => block.default_active).length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Blocchi del Form</h2>
                <p className="text-gray-600">Gestisci i blocchi specifici di questo form</p>
              </div>
              <Button
                onClick={() => navigate('/admin/blocks')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Vista Globale
              </Button>
            </div>

            {blocks.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Blocks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun blocco trovato</h3>
                    <p className="text-gray-600">Questo form non ha blocchi configurati.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {blocks.map((block) => {
                  const validation = getBlockValidation(block, blocks);
                  const specialLabels = getSpecialLabels(block);
                  const hasValidationErrors = !validation.activationSources.isValid || 
                                            !validation.leadsToValidation.isValid || 
                                            !validation.addBlockValidation.isValid;

                  return (
                    <Card key={block.block_id} className={`hover:shadow-md transition-shadow ${hasValidationErrors ? 'border-red-200' : ''}`}>
                      <CardHeader className="pb-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl text-[#245C4F] flex items-center gap-2">
                                #{block.block_number} {block.title}
                              </CardTitle>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span>
                                  ID: <code className="bg-gray-100 px-1 rounded text-xs">{block.block_id}</code>
                                </span>
                              </div>
                            </div>
                            {hasValidationErrors && (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Settings className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Priorità:</span>
                              <Badge variant="outline" className="text-xs font-mono">
                                {block.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Database className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Domande:</span>
                              <span className="font-medium">{block.questions.length}</span>
                            </div>
                          </div>

                          {specialLabels.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {specialLabels.map((label, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary"
                                  className="text-xs bg-green-100 text-green-800"
                                >
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {renderValidationStatus(validation)}

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                          <Button
                            onClick={() => navigate(`/admin/blocks/${block.block_id}?form=${formData.slug}`)}
                            className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Visualizza Dettagli
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
