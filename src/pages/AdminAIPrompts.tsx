import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bot, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface AIPrompt {
  id: string;
  name: string;
  description?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminAIPrompts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['ai-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIPrompt[];
    }
  });

  const deletePromptMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_prompts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast({
        title: "Prompt eliminato",
        description: "Il prompt AI è stato eliminato con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il prompt: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare il prompt "${name}"?`)) {
      deletePromptMutation.mutate(id);
    }
  };

  const getMessagesSummary = (messages: AIPrompt['messages']) => {
    const systemMessages = messages.filter(m => m.role === 'system').length;
    const userMessages = messages.filter(m => m.role === 'user').length;
    return `${systemMessages} sistema, ${userMessages} utente`;
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna all'Admin
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F] flex items-center gap-2">
                <Bot className="h-6 w-6" />
                Gestione AI
              </h1>
              <p className="text-gray-600">Gestisci i prompt AI e le configurazioni</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin/ai-prompts/new')}
            className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuovo Prompt
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-8">Caricamento prompt...</div>
        ) : (
          <div className="space-y-4">
            {prompts?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun prompt AI</h3>
                  <p className="text-gray-600 mb-4">Inizia creando il tuo primo prompt AI</p>
                  <Button
                    onClick={() => navigate('/admin/ai-prompts/new')}
                    className="bg-[#245C4F] hover:bg-[#1e4f44]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Primo Prompt
                  </Button>
                </CardContent>
              </Card>
            ) : (
              prompts?.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {prompt.name}
                          {!prompt.is_active && (
                            <Badge variant="secondary">Inattivo</Badge>
                          )}
                        </CardTitle>
                        {prompt.description && (
                          <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/ai-prompts/${prompt.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(prompt.id, prompt.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-4">
                        <span><strong>Modello:</strong> {prompt.model}</span>
                        <span><strong>Messaggi:</strong> {getMessagesSummary(prompt.messages)}</span>
                      </div>
                      {prompt.variables.length > 0 && (
                        <div>
                          <strong>Variabili:</strong> {prompt.variables.join(', ')}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Creato il {new Date(prompt.created_at).toLocaleDateString('it-IT')}
                        {prompt.updated_at !== prompt.created_at && 
                          ` • Aggiornato il ${new Date(prompt.updated_at).toLocaleDateString('it-IT')}`
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}