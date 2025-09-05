import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AINotesSectionProps {
  submissionId: string;
  aiNotes: string | null;
  onUpdate: (field: string, value: string) => Promise<void>;
}

interface ParsedAINotes {
  confidence: number | null;
  text: string;
}

export function AINotesSection({ submissionId, aiNotes, onUpdate }: AINotesSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  // Parse AI notes to extract confidence score and text
  const parseAINotes = (notes: string | null): ParsedAINotes => {
    if (!notes) return { confidence: null, text: '' };
    
    // Check if notes follow the new format: "[score] - text"
    const match = notes.match(/^\[(\d+)\]\s*-\s*(.*)$/s);
    if (match) {
      return {
        confidence: parseInt(match[1], 10),
        text: match[2].trim()
      };
    }
    
    // Backward compatibility: treat as plain text
    return {
      confidence: null,
      text: notes.trim()
    };
  };

  // Get confidence badge variant based on score
  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 80) return 'default'; // Green
    if (confidence >= 60) return 'secondary'; // Yellow
    return 'destructive'; // Red
  };

  // Get confidence label
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta';
    if (confidence >= 60) return 'Media';
    return 'Bassa';
  };

  const parsedNotes = parseAINotes(aiNotes);

  // Simulate realistic progress for different models
  const simulateProgress = (isFastModel: boolean) => {
    const firstPhaseTime = isFastModel ? 20 : 80; // Time to reach 80%
    const secondPhaseTime = isFastModel ? 20 : 80; // Time from 80% to 99%
    
    return new Promise<void>((resolve) => {
      let currentProgress = 0;
      const startTime = Date.now();
      
      // Initial upload phase (10%)
      setProgressLabel('Caricamento dati...');
      setProgress(10);
      currentProgress = 10;
      
      const progressInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
        
        if (elapsedTime < 2) {
          // Upload phase - stay at 10% for first 2 seconds
          return;
        } else if (elapsedTime < firstPhaseTime) {
          // First phase: 10% to 80% in firstPhaseTime seconds
          setProgressLabel(isFastModel ? 'Generazione rapida...' : 'Elaborazione approfondita...');
          const phaseProgress = (elapsedTime - 2) / (firstPhaseTime - 2);
          currentProgress = 10 + (70 * phaseProgress); // 10% + 70% progression
          setProgress(Math.floor(currentProgress));
        } else if (elapsedTime < (firstPhaseTime + secondPhaseTime)) {
          // Second phase: 80% to 99% in secondPhaseTime seconds
          setProgressLabel('Finalizzazione...');
          const secondPhaseProgress = (elapsedTime - firstPhaseTime) / secondPhaseTime;
          currentProgress = 80 + (19 * secondPhaseProgress); // 80% + 19% progression to reach 99%
          setProgress(Math.floor(currentProgress));
        } else {
          // Wait at 99% for actual completion
          setProgressLabel('Attesa completamento...');
          setProgress(99);
          resolve();
        }
      }, 50); // Update every 50ms for smooth animation
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Start progress simulation for fast model
      const progressPromise = simulateProgress(true);
      
      // Make API call
      const apiPromise = supabase.functions.invoke('generate-ai-notes', {
        body: {
          submissionId,
          type: 'generate',
          model: 'gpt-4o-mini' // Faster model for generation
        }
      });

      // Wait for both progress simulation and API call
      const [, { data, error }] = await Promise.all([progressPromise, apiPromise]);

      if (error) throw error;

      if (data.success) {
        setProgress(100);
        setProgressLabel('Completato!');
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
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setProgressLabel('');
      }, 1000); // Keep completion state visible for 1 second
    }
  };

  const handleImprove = async () => {
    setIsImproving(true);
    setProgress(0);
    
    try {
      // Start progress simulation for slow model
      const progressPromise = simulateProgress(false);
      
      // Make API call
      const apiPromise = supabase.functions.invoke('generate-ai-notes', {
        body: {
          submissionId,
          type: 'improve',
          existingAiNotes: aiNotes,
          model: 'gpt-5-mini-2025-08-07' // Higher quality model for improvement
        }
      });

      // Wait for both progress simulation and API call
      const [, { data, error }] = await Promise.all([progressPromise, apiPromise]);

      if (error) throw error;

      if (data.success) {
        setProgress(100);
        setProgressLabel('Completato!');
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
      setTimeout(() => {
        setIsImproving(false);
        setProgress(0);
        setProgressLabel('');
      }, 1000); // Keep completion state visible for 1 second
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-600">Note AI</label>
        {parsedNotes.confidence !== null && (
          <Badge 
            variant={getConfidenceBadgeVariant(parsedNotes.confidence)}
            className="text-xs"
          >
            Affidabilità: {getConfidenceLabel(parsedNotes.confidence)} ({parsedNotes.confidence}%)
          </Badge>
        )}
      </div>
      
      {(isGenerating || isImproving) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{progressLabel || (isImproving ? 'Preparazione...' : 'Preparazione...')}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full h-2 transition-all duration-75" />
        </div>
      )}
      
      <div className={`w-full rounded-md border border-input bg-gray-50 p-3 text-sm relative ${
        parsedNotes.text ? 'min-h-[200px]' : 'h-24'
      }`}>
        {parsedNotes.text ? (
          <div className="whitespace-pre-wrap">{parsedNotes.text}</div>
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

      {parsedNotes.text && (
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