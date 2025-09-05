import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AINotesSectionProps {
  submissionId: string;
  aiNotes: string | null;
  onUpdate: (field: string, value: string) => Promise<void>;
}

export function AINotesSection({ submissionId, aiNotes, onUpdate }: AINotesSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-notes', {
        body: {
          submissionId,
          type: 'generate'
        }
      });

      if (error) throw error;

      if (data.success) {
        await onUpdate('ai_notes', data.aiNotes);
        toast({
          title: "Note AI generate",
          description: "Le note AI sono state generate con successo",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating AI notes:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione delle note AI",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async () => {
    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-notes', {
        body: {
          submissionId,
          type: 'improve',
          existingAiNotes: aiNotes
        }
      });

      if (error) throw error;

      if (data.success) {
        await onUpdate('ai_notes', data.aiNotes);
        toast({
          title: "Note AI migliorate",
          description: "Le note AI sono state migliorate con successo",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error improving AI notes:', error);
      toast({
        title: "Errore",
        description: "Errore nel miglioramento delle note AI",
        variant: "destructive"
      });
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <label className="text-sm font-medium text-gray-600">Note AI</label>
      </div>
      
      <div className={`w-full rounded-md border border-input bg-gray-50 p-3 text-sm relative ${
        aiNotes ? 'min-h-[200px]' : 'h-24'
      }`}>
        {aiNotes ? (
          <div className="whitespace-pre-wrap">{aiNotes}</div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-gray-400 italic text-center mb-3 px-4">
              Clicca su "Genera" per creare note AI basate sui dati del lead e sulle risposte fornite
            </div>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating || isImproving}
              className="bg-[#245C4F] hover:bg-[#1a453b]"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Genera
            </Button>
          </div>
        )}
      </div>

      {aiNotes && (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || isImproving}
            className="bg-[#245C4F] hover:bg-[#1a453b]"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Rigenera
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleImprove}
            disabled={isGenerating || isImproving}
          >
            {isImproving ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Migliora
          </Button>
        </div>
      )}
    </div>
  );
}