import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, RefreshCw, Eye, Edit2, Database, AlertTriangle, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface QuestionId {
  id: string;
  question_id: string;
  current_version: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface QuestionVersion {
  id: string;
  version_number: number;
  question_text: string;
  question_type: string;
  placeholder_values?: any;
  is_active: boolean;
  created_at: string;
}

interface Form {
  id: string;
  title: string;
  slug: string;
}

interface DuplicateError {
  question_id: string;
  locations: string[];
}

const AdminQuestionIds = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionId | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [showFormSelector, setShowFormSelector] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [duplicateErrors, setDuplicateErrors] = useState<DuplicateError[]>([]);
  const [showDuplicateError, setShowDuplicateError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const itemsPerPage = 20;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch forms
  const { data: forms = [] } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('id, title, slug')
        .eq('is_active', true)
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data as Form[];
    }
  });

  // Fetch question IDs
  const { data: questionIds = [], isLoading } = useQuery({
    queryKey: ['question-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_ids')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as QuestionId[];
    }
  });

  // Fetch question versions for selected question
  const { data: questionVersions = [] } = useQuery({
    queryKey: ['question-versions', selectedQuestion?.id],
    queryFn: async () => {
      if (!selectedQuestion?.id) return [];
      
      const { data, error } = await supabase
        .from('question_versions')
        .select('*')
        .eq('question_id_record', selectedQuestion.id)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data as QuestionVersion[];
    },
    enabled: !!selectedQuestion?.id
  });

  // Fetch all question versions for display
  const { data: allVersionsData = {} } = useQuery({
    queryKey: ['all-question-versions', questionIds.map(q => q.id)],
    queryFn: async () => {
      const versionsMap: Record<string, QuestionVersion[]> = {};
      
      for (const question of questionIds) {
        const { data, error } = await supabase
          .from('question_versions')
          .select('*')
          .eq('question_id_record', question.id)
          .order('version_number', { ascending: false });
        
        if (!error && data) {
          versionsMap[question.id] = data as QuestionVersion[];
        }
      }
      
      return versionsMap;
    },
    enabled: questionIds.length > 0
  });

  // Check if question is used
  const { data: usageData = {} } = useQuery({
    queryKey: ['question-usage', questionIds.map(q => q.question_id)],
    queryFn: async () => {
      const usageMap: Record<string, boolean> = {};
      
      // Get all active form blocks and check manually
      const { data: formBlocks, error } = await supabase
        .from('form_blocks')
        .select(`
          block_data,
          forms!inner(is_active)
        `)
        .eq('forms.is_active', true);
      
      if (error) {
        console.error('Error fetching form blocks for usage check:', error);
        return usageMap;
      }
      
      // Initialize all questions as not used
      for (const question of questionIds) {
        usageMap[question.question_id] = false;
      }
      
      // Check each block for question usage
      for (const block of formBlocks || []) {
        const blockData = block.block_data;
        if (blockData && typeof blockData === 'object' && !Array.isArray(blockData) && 'questions' in blockData) {
          const questions = (blockData as any).questions;
          if (Array.isArray(questions)) {
            for (const question of questions) {
              if (question && typeof question === 'object' && 'question_id' in question) {
                const questionId = question.question_id;
                if (questionId && typeof questionId === 'string' && usageMap.hasOwnProperty(questionId)) {
                  usageMap[questionId] = true;
                }
              }
            }
          }
        }
      }
      
      return usageMap;
    },
    enabled: questionIds.length > 0
  });

  // Extract questions mutation
  const extractQuestionsMutation = useMutation({
    mutationFn: async (formId: string) => {
      // Start progress simulation
      setExtractionProgress(10);
      
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      try {
        const { data, error } = await supabase.functions.invoke('extract-question-ids', {
          body: { form_id: formId }
        });
        
        clearInterval(progressInterval);
        setExtractionProgress(100);
        
        if (error) throw error;
        return data;
      } catch (error) {
        clearInterval(progressInterval);
        setExtractionProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      setTimeout(() => setExtractionProgress(0), 1000);
      
      if (data.duplicate_errors && data.duplicate_errors.length > 0) {
        setDuplicateErrors(data.duplicate_errors);
        setShowDuplicateError(true);
        return;
      }
      
      toast.success(`Extracted questions: ${data.new_questions} new, ${data.updated_questions} updated, ${data.unchanged} unchanged`);
      queryClient.invalidateQueries({ queryKey: ['question-ids'] });
      queryClient.invalidateQueries({ queryKey: ['question-usage'] });
      setShowFormSelector(false);
    },
    onError: (error: any) => {
      setExtractionProgress(0);
      toast.error(`Failed to extract questions: ${error.message}`);
      setShowFormSelector(false);
    }
  });

  // Update description mutation
  const updateDescriptionMutation = useMutation({
    mutationFn: async ({ questionId, description }: { questionId: string; description: string }) => {
      const { error } = await supabase
        .from('question_ids')
        .update({ description, updated_at: new Date().toISOString() })
        .eq('id', questionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Description updated successfully");
      queryClient.invalidateQueries({ queryKey: ['question-ids'] });
      setSelectedQuestion(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update description: ${error.message}`);
    }
  });

  const filteredQuestions = questionIds.filter(q =>
    q.question_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.description && q.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleUpdateDescription = () => {
    if (selectedQuestion) {
      updateDescriptionMutation.mutate({
        questionId: selectedQuestion.id,
        description: editingDescription
      });
    }
  };

  const handleExtractClick = () => {
    setShowFormSelector(true);
  };

  const handleFormSelect = () => {
    if (selectedFormId) {
      extractQuestionsMutation.mutate(selectedFormId);
    }
  };

  const formatQuestionText = (questionText: string, placeholderValues: any) => {
    if (!placeholderValues || !questionText) {
      return questionText;
    }

    let formattedText = questionText;

    // Replace placeholder patterns with formatted versions
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    
    formattedText = formattedText.replace(placeholderRegex, (match, placeholderKey) => {
      if (placeholderValues.type === 'select' && placeholderValues.options) {
        const optionLabels = placeholderValues.options.map((opt: any) => opt.label).join('/');
        return `**{{${optionLabels}}}**`;
      } else if (placeholderValues.type === 'input') {
        const inputType = placeholderValues.input_type || 'text';
        const validation = placeholderValues.validation || 'none';
        return `**{{${inputType}:${validation}}}**`;
      } else if (placeholderValues.type === 'multiblock') {
        return `**{{multiblock:${placeholderKey}}}**`;
      }
      return `**{{${placeholderKey}}}**`;
    });

    return formattedText;
  };

  const renderFormattedText = (text: string) => {
    // Split text by bold markers and render accordingly
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="text-gray-700 hover:text-[#245C4F] hover:bg-transparent p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#245C4F] mb-2">Question IDs</h1>
          <p className="text-gray-600">Gestisci tutte le domande utilizzate nei form</p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca per ID domanda o descrizione..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                onClick={handleExtractClick}
                disabled={extractQuestionsMutation.isPending}
                className="bg-[#245C4F] hover:bg-[#1e4f44] text-white"
              >
                <Database className="h-4 w-4 mr-2" />
                {extractQuestionsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Estrazione...
                  </>
                ) : (
                  'Estrai Question IDs'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Extraction Progress */}
        {extractionProgress > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estrazione in corso...</span>
                  <span className="text-sm text-gray-600">{extractionProgress}%</span>
                </div>
                <Progress value={extractionProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#245C4F]">{questionIds.length}</div>
              <div className="text-sm text-gray-600">Totale Question IDs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(usageData).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">In Uso</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(usageData).filter(used => !used).length}
              </div>
              <div className="text-sm text-gray-600">Non Utilizzate</div>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question IDs ({filteredQuestions.length})</CardTitle>
              {totalPages > 1 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Pagina {currentPage} di {totalPages} • Mostrate {paginatedQuestions.length} di {filteredQuestions.length}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Caricamento question IDs...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedQuestions.map((question) => {
                  const versions = allVersionsData[question.id] || [];
                  const latestVersion = versions.find(v => v.is_active) || versions[0];
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-4 gap-6">
                        {/* Left Column - Main Info (3/4 width) */}
                        <div className="col-span-3 space-y-4 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <code className="bg-[#245C4F]/10 text-[#245C4F] px-3 py-1 rounded-md text-sm font-mono font-medium">
                              {question.question_id}
                            </code>
                            <Badge variant={usageData[question.question_id] ? "default" : "secondary"}>
                              {usageData[question.question_id] ? "In uso" : "Non utilizzata"}
                            </Badge>
                            {latestVersion && (
                              <Badge variant="outline" className="capitalize">
                                {latestVersion.question_type}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              v{question.current_version}
                            </span>
                          </div>
                          
                          {latestVersion && (
                            <div className="space-y-2">
                              <p className="text-gray-700 leading-relaxed break-words text-base">
                                {renderFormattedText(formatQuestionText(latestVersion.question_text, latestVersion.placeholder_values))}
                              </p>
                            </div>
                          )}
                          
                          {question.description && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h4 className="font-medium text-blue-900 text-sm">Descrizione</h4>
                              </div>
                              <p className="text-blue-800 text-sm leading-relaxed">
                                {question.description}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Right Column - Versions & Actions (1/4 width) */}
                        <div className="col-span-1 space-y-4 border-l border-gray-200 pl-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm">Versioni</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {versions.length > 0 ? (
                                versions.map((version) => (
                                  <div 
                                    key={version.id} 
                                    className={`flex flex-col gap-1 p-2 rounded text-xs ${
                                      version.is_active 
                                        ? 'bg-[#245C4F]/10 border border-[#245C4F]/20' 
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <Badge 
                                        variant={version.is_active ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        v{version.version_number}
                                      </Badge>
                                      {version.is_active && (
                                        <span className="text-[#245C4F] font-medium text-xs">Attiva</span>
                                      )}
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                      {new Date(version.created_at).toLocaleDateString('it-IT')}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-xs">Nessuna versione</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-200">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => setSelectedQuestion(question)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Dettagli
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    Dettagli Question ID: {question.question_id}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Descrizione</label>
                                    <Textarea
                                      value={editingDescription}
                                      onChange={(e) => setEditingDescription(e.target.value)}
                                      placeholder="Aggiungi una descrizione per questa domanda..."
                                      onFocus={() => setEditingDescription(question.description || "")}
                                      className="min-h-20"
                                    />
                                    <Button
                                      onClick={handleUpdateDescription}
                                      disabled={updateDescriptionMutation.isPending}
                                      className="mt-2"
                                      size="sm"
                                    >
                                      <Edit2 className="h-4 w-4 mr-2" />
                                      Salva Descrizione
                                    </Button>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-3">Storico completo delle versioni</h4>
                                    <div className="space-y-3">
                                      {questionVersions.map((version) => (
                                        <div key={version.id} className="border rounded-lg p-4">
                                          <div className="flex items-center gap-2 mb-3">
                                            <Badge variant={version.is_active ? "default" : "secondary"}>
                                              v{version.version_number}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize">
                                              {version.question_type}
                                            </Badge>
                                            {version.is_active && (
                                              <Badge className="bg-green-100 text-green-800">Attiva</Badge>
                                            )}
                                          </div>
                                          <div className="space-y-2">
                                            <div className="space-y-2">
                                              <p className="text-gray-900 break-words">
                                                {renderFormattedText(formatQuestionText(version.question_text, version.placeholder_values))}
                                              </p>
                                            </div>
                                            {version.placeholder_values && (
                                              <details className="mt-3">
                                                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                                                  Configurazione placeholder
                                                </summary>
                                                <pre className="mt-2 text-xs bg-gray-50 p-3 rounded border overflow-auto">
                                                  {JSON.stringify(version.placeholder_values, null, 2)}
                                                </pre>
                                              </details>
                                            )}
                                            <p className="text-xs text-gray-500 pt-2 border-t">
                                              Creata: {new Date(version.created_at).toLocaleString('it-IT')}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {paginatedQuestions.length === 0 && filteredQuestions.length > 0 && (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nessun risultato in questa pagina</p>
                  </div>
                )}
                
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? "Nessuna question ID trovata per la ricerca" : "Nessuna question ID disponibile. Usa 'Estrai Question IDs' per iniziare."}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Precedente
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={currentPage === pageNum ? "bg-[#245C4F] hover:bg-[#1e4f44]" : ""}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="px-2">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Successiva
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredQuestions.length)} di {filteredQuestions.length}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Selection Dialog */}
        <Dialog open={showFormSelector} onOpenChange={setShowFormSelector}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleziona Form per Estrazione</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Seleziona il form da cui estrarre i Question IDs:
              </p>
              <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un form..." />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.title} ({form.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  onClick={handleFormSelect}
                  disabled={!selectedFormId || extractQuestionsMutation.isPending}
                  className="bg-[#245C4F] hover:bg-[#1e4f44] text-white"
                >
                  {extractQuestionsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Estrazione...
                    </>
                  ) : (
                    'Inizia Estrazione'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowFormSelector(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate Error Dialog */}
        <Dialog open={showDuplicateError} onOpenChange={setShowDuplicateError}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">
                <AlertTriangle className="h-5 w-5 inline mr-2" />
                Errore: Question IDs Duplicati
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sono stati trovati Question IDs duplicati nel form selezionato. 
                  L'estrazione è stata annullata per mantenere l'integrità dei dati.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <h4 className="font-medium">Question IDs duplicati trovati:</h4>
                {duplicateErrors.map((error, index) => (
                  <div key={index} className="border rounded p-3 bg-red-50">
                    <p className="font-mono text-sm font-medium text-red-800">
                      {error.question_id}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Trovato in: {error.locations.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Cosa fare:</strong> Modifica i form per assegnare Question IDs unici a ogni domanda, 
                  poi riprova l'estrazione.
                </p>
              </div>
              
              <Button onClick={() => setShowDuplicateError(false)} className="w-full">
                Chiudi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminQuestionIds;