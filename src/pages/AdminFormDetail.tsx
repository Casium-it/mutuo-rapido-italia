
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Database, Eye, Settings, Users, AlertTriangle, CheckCircle, XCircle, Blocks } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAdminBlocks } from '@/hooks/useAdminBlocks';
import { getBlockValidation, BlockValidation } from '@/utils/blockValidation';

interface FormData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  form_type: string;
  is_active: boolean;
  version: number;
  completion_behavior: string;
  created_at: string;
  updated_at: string;
}

interface FormStats {
  totalBlocks: number;
  totalSubmissions: number;
  activeBlocks: number;
}

export default function AdminFormDetail() {
  const { formSlug } = useParams<{ formSlug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData | null>(null);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { blocks, loading: blocksLoading, error: blocksError, getFilteredBlocks } = useAdminBlocks();

  useEffect(() => {
    if (formSlug) {
      fetchFormDetails();
      fetchFormStats();
    }
  }, [formSlug]);

  const fetchFormDetails = async () => {
    try {
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

      setForm(formData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    }
  };

  const fetchFormStats = async () => {
    try {
      // Get total submissions for this form
      const { count: submissionsCount } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('form_type', formSlug || '');

      setStats({
        totalBlocks: 0, // Will be updated when blocks load
        totalSubmissions: submissionsCount || 0,
        activeBlocks: 0 // Will be updated when blocks load
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update stats when blocks are loaded
  useEffect(() => {
    if (blocks.length > 0 && formSlug) {
      const formBlocks = getFilteredBlocks(formSlug);
      const activeBlocks = formBlocks.filter(block => !block.invisible).length;
      
      setStats(prev => prev ? {
        ...prev,
        totalBlocks: formBlocks.length,
        activeBlocks: activeBlocks
      } : null);
    }
  }, [blocks, formSlug, getFilteredBlocks]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpecialLabels = (block: any) => {
    const labels = [];
    if (block.default_active) labels.push('Attivo di default');
    if (block.multiBlock) labels.push('Multi-blocco');
    if (block.invisible) labels.push('Invisibile');
    return labels;
  };

  const renderValidationStatus = (validation: BlockValidation) => {
    const hasActivationError = !validation.activationSources.isValid;
    const hasLeadsToError = !validation.leadsToValidation.isValid;
    const hasAddBlockError = !validation.addBlockValidation.isValid;
    const hasAnyError = hasActivationError || hasLeadsToError || hasAddBlockError;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {hasAnyError ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className="text-xs font-medium">
            {hasAnyError ? 'Problemi di validazione' : 'Validazione OK'}
          </span>
        </div>
      </div>
    );
  };

  if (loading || blocksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento dettagli form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Form non trovato</h1>
          <Button onClick={() => navigate('/admin/forms')}>Torna ai Form</Button>
        </div>
      </div>
    );
  }

  const formBlocks = getFilteredBlocks(formSlug || '').sort((a, b) => a.priority - b.priority);

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
            <h1 className="text-2xl font-bold text-[#245C4F]">{form.title}</h1>
            <p className="text-gray-600">Slug: {form.slug}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Informazioni Generali</TabsTrigger>
            <TabsTrigger value="blocks">Blocchi ({formBlocks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Blocks className="h-5 w-5 text-[#245C4F]" />
                      <div>
                        <p className="text-sm text-gray-600">Blocchi Totali</p>
                        <p className="text-2xl font-bold text-[#245C4F]">{stats?.totalBlocks || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-[#245C4F]" />
                      <div>
                        <p className="text-sm text-gray-600">Submissions</p>
                        <p className="text-2xl font-bold text-[#245C4F]">{stats?.totalSubmissions || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-[#245C4F]" />
                      <div>
                        <p className="text-sm text-gray-600">Blocchi Attivi</p>
                        <p className="text-2xl font-bold text-[#245C4F]">{stats?.activeBlocks || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Form Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Dettagli Form</span>
                    <div className="flex gap-2">
                      <Badge variant={form.is_active ? "default" : "secondary"}>
                        {form.is_active ? "Attivo" : "Inattivo"}
                      </Badge>
                      <Badge variant="outline">v{form.version}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Titolo</label>
                        <p className="text-lg font-medium">{form.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Slug</label>
                        <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{form.slug}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tipo Form</label>
                        <p>{form.form_type}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Comportamento Completamento</label>
                        <p>{form.completion_behavior}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Creato</p>
                          <p className="text-sm">{formatDate(form.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Aggiornato</p>
                          <p className="text-sm">{formatDate(form.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {form.description && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Descrizione</label>
                      <p className="mt-2 text-gray-700">{form.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blocks">
            <div className="space-y-6">
              {blocksError ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Database className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Errore nel caricamento</h3>
                    <p className="text-gray-600">{blocksError}</p>
                  </CardContent>
                </Card>
              ) : formBlocks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Blocks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun blocco trovato</h3>
                    <p className="text-gray-600">Questo form non contiene blocchi configurati.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {formBlocks.map((block) => {
                    const validation = getBlockValidation(block, blocks);
                    const specialLabels = getSpecialLabels(block);
                    const hasValidationErrors = !validation.activationSources.isValid || 
                                              !validation.leadsToValidation.isValid || 
                                              !validation.addBlockValidation.isValid;

                    return (
                      <Card key={`${block.form_id}-${block.block_id}`} className={`hover:shadow-md transition-shadow ${hasValidationErrors ? 'border-red-200' : ''}`}>
                        <CardHeader className="pb-4">
                          <div className="space-y-3">
                            {/* Main Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-xl text-[#245C4F] flex items-center gap-2">
                                  #{block.block_number} {block.title}
                                  {hasValidationErrors && (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span>
                                    ID: <code className="bg-gray-100 px-1 rounded text-xs">{block.block_id}</code>
                                  </span>
                                  <span>•</span>
                                  <span>Priorità: {block.priority}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">Domande:</span>
                                <span className="font-medium">{block.questions.length}</span>
                              </div>
                            </div>

                            {/* Special Labels */}
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
                          {/* Block Validation Status */}
                          {renderValidationStatus(validation)}

                          {/* Action Button */}
                          <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button
                              onClick={() => navigate(`/admin/blocks/${block.block_id}?form=${form.slug}`)}
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
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
