import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, RefreshCw, Eye, Edit2, Database } from "lucide-react";

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

const AdminQuestionIds = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionId | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const queryClient = useQueryClient();

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

  // Check if question is used
  const { data: usageData = {} } = useQuery({
    queryKey: ['question-usage', questionIds.map(q => q.question_id)],
    queryFn: async () => {
      const usageMap: Record<string, boolean> = {};
      
      for (const question of questionIds) {
        const { data, error } = await supabase
          .rpc('is_question_used', { question_id_param: question.question_id });
        
        if (!error) {
          usageMap[question.question_id] = data;
        }
      }
      
      return usageMap;
    },
    enabled: questionIds.length > 0
  });

  // Extract questions mutation
  const extractQuestionsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('extract-question-ids');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Extracted questions: ${data.new_questions} new, ${data.updated_questions} updated, ${data.unchanged} unchanged`);
      queryClient.invalidateQueries({ queryKey: ['question-ids'] });
      queryClient.invalidateQueries({ queryKey: ['question-usage'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to extract questions: ${error.message}`);
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

  const handleUpdateDescription = () => {
    if (selectedQuestion) {
      updateDescriptionMutation.mutate({
        questionId: selectedQuestion.id,
        description: editingDescription
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                onClick={() => extractQuestionsMutation.mutate()}
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
            <CardTitle>Question IDs ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Caricamento question IDs...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {question.question_id}
                          </code>
                          <Badge variant={usageData[question.question_id] ? "default" : "secondary"}>
                            {usageData[question.question_id] ? "In uso" : "Non utilizzata"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Versione: {question.current_version}
                        </p>
                        {question.description && (
                          <p className="text-sm text-gray-800">{question.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Dettagli Question ID: {question.question_id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Descrizione</label>
                                <Textarea
                                  value={editingDescription}
                                  onChange={(e) => setEditingDescription(e.target.value)}
                                  placeholder="Aggiungi una descrizione per questa domanda..."
                                  onFocus={() => setEditingDescription(question.description || "")}
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
                                <h4 className="font-medium mb-2">Storico Versioni</h4>
                                <div className="space-y-2">
                                  {questionVersions.map((version) => (
                                    <div key={version.id} className="border rounded p-3 text-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant={version.is_active ? "default" : "secondary"}>
                                          v{version.version_number}
                                        </Badge>
                                        <Badge variant="outline">{version.question_type}</Badge>
                                        {version.is_active && (
                                          <Badge variant="default">Attiva</Badge>
                                        )}
                                      </div>
                                      <p className="text-gray-800 mb-1">{version.question_text}</p>
                                      {version.placeholder_values && (
                                        <details className="mt-2">
                                          <summary className="cursor-pointer text-blue-600">
                                            Valori placeholder
                                          </summary>
                                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                            {JSON.stringify(version.placeholder_values, null, 2)}
                                          </pre>
                                        </details>
                                      )}
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(version.created_at).toLocaleString('it-IT')}
                                      </p>
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
                ))}
                
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? "Nessuna question ID trovata per la ricerca" : "Nessuna question ID disponibile. Usa 'Estrai Question IDs' per iniziare."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminQuestionIds;