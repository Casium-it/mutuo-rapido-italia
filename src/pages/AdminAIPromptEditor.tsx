import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIPromptForm {
  name: string;
  description: string;
  messages: Message[];
  model: string;
  variables: string[];
  is_active: boolean;
}

const AI_MODELS = [
  'gpt-5-2025-08-07',
  'gpt-5-mini-2025-08-07', 
  'gpt-5-nano-2025-08-07',
  'gpt-4.1-2025-04-14',
  'gpt-4.1-mini-2025-04-14',
  'gpt-4o-mini',
  'gpt-4o'
];

export default function AdminAIPromptEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id && id !== 'new');

  const [formData, setFormData] = useState<AIPromptForm>({
    name: '',
    description: '',
    messages: [{ role: 'system', content: '' }],
    model: 'gpt-4o-mini',
    variables: [],
    is_active: true
  });

  const [newVariable, setNewVariable] = useState('');

  const { data: existingPrompt, isLoading } = useQuery({
    queryKey: ['ai-prompt', id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing
  });

  React.useEffect(() => {
    if (existingPrompt) {
      setFormData({
        name: existingPrompt.name,
        description: existingPrompt.description || '',
        messages: existingPrompt.messages as unknown as Message[],
        model: existingPrompt.model,
        variables: existingPrompt.variables || [],
        is_active: existingPrompt.is_active
      });
    }
  }, [existingPrompt]);

  const saveMutation = useMutation({
    mutationFn: async (data: AIPromptForm) => {
      if (isEditing) {
        const { error } = await supabase
          .from('ai_prompts')
          .update({
            ...data,
            messages: data.messages as any
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_prompts')
          .insert({
            ...data,
            messages: data.messages as any
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast({
        title: isEditing ? "Prompt aggiornato" : "Prompt creato",
        description: isEditing ? "Il prompt è stato aggiornato con successo." : "Il prompt è stato creato con successo.",
      });
      navigate('/admin/ai-prompts');
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile salvare il prompt: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del prompt è obbligatorio.",
        variant: "destructive",
      });
      return;
    }

    if (formData.messages.length === 0 || formData.messages.every(m => !m.content.trim())) {
      toast({
        title: "Errore", 
        description: "Almeno un messaggio è obbligatorio.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const addMessage = (role: 'system' | 'user' | 'assistant') => {
    setFormData(prev => ({
      ...prev,
      messages: [...prev.messages, { role, content: '' }]
    }));
  };

  const updateMessage = (index: number, field: keyof Message, value: string) => {
    setFormData(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => 
        i === index ? { ...msg, [field]: value } : msg
      )
    }));
  };

  const deleteMessage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  };

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/ai-prompts')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna ai Prompt
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">
                {isEditing ? 'Modifica Prompt AI' : 'Nuovo Prompt AI'}
              </h1>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Prompt *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Es. AI Notes Generation"
                />
              </div>
              <div>
                <Label htmlFor="model">Modello AI</Label>
                <Select value={formData.model} onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona modello" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrivi a cosa serve questo prompt..."
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Prompt attivo</Label>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Messaggi</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addMessage('system')}>
                  <Plus className="h-3 w-3 mr-1" /> Sistema
                </Button>
                <Button size="sm" variant="outline" onClick={() => addMessage('user')}>
                  <Plus className="h-3 w-3 mr-1" /> Utente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.messages.map((message, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Select 
                    value={message.role} 
                    onValueChange={(value: 'system' | 'user' | 'assistant') => updateMessage(index, 'role', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="user">Utente</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMessage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={message.content}
                  onChange={(e) => updateMessage(index, 'content', e.target.value)}
                  placeholder="Inserisci il contenuto del messaggio..."
                  rows={4}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Variabili</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="Nome variabile (es. leadInfo)"
                onKeyPress={(e) => e.key === 'Enter' && addVariable()}
              />
              <Button onClick={addVariable} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.variables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.variables.map(variable => (
                  <Badge key={variable} variant="secondary" className="cursor-pointer">
                    {`{{${variable}}}`}
                    <button
                      onClick={() => removeVariable(variable)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600">
              Le variabili possono essere utilizzate nei messaggi usando la sintassi {`{{nomeVariabile}}`}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}