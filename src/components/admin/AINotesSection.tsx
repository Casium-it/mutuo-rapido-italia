import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EditableField } from './EditableField';

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
  
  // Track if we're processing existing notes (regen/improve)
  const isProcessing = isGenerating || isImproving;

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

  // Simplified progress simulation using setInterval
  const simulateProgress = (isFastModel: boolean) => {
    const totalDuration = isFastModel ? 8000 : 15000; // 8s for fast, 15s for slow
    const updateInterval = 200; // Update every 200ms
    const totalSteps = totalDuration / updateInterval;
    let currentStep = 0;
    let intervalId: NodeJS.Timeout;
    
    return new Promise<{ cancel: () => void }>((resolve) => {
      setProgress(5); // Start at 5%
      setProgressLabel('Caricamento dati...');
      
      intervalId = setInterval(() => {
        currentStep++;
        const progressPercent = Math.min(95, 5 + (90 * currentStep / totalSteps)); // 5% to 95%
        
        // Update label based on progress
        if (progressPercent < 30) {
          setProgressLabel('Caricamento dati...');
        } else if (progressPercent < 70) {
          setProgressLabel(isFastModel ? 'Generazione rapida...' : 'Elaborazione approfondita...');
        } else {
          setProgressLabel('Finalizzazione...');
        }
        
        setProgress(progressPercent);
        
        if (currentStep >= totalSteps) {
          setProgressLabel('Attesa completamento...');
          setProgress(95); // Stop at 95%, wait for API completion
        }
      }, updateInterval);
      
      const cancel = () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
      
      resolve({ cancel });
    });
  };

  // Complete progress to 100%
  const completeProgress = () => {
    return new Promise<void>((resolve) => {
      setProgressLabel('Completato!');
      setProgress(100);
      
      setTimeout(() => {
        resolve();
      }, 1000); // Show completion for 1 second
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    let progressController: { cancel: () => void } | null = null;
    
    try {
      // Start progress simulation for fast model
      const progressPromise = simulateProgress(true);
      progressController = await progressPromise;
      
      // Make API call
      const { data, error } = await supabase.functions.invoke('generate-ai-notes', {
        body: {
          submissionId,
          type: 'generate',
          model: 'gpt-4o-mini' // Faster model for generation
        }
      });

      // Cancel the progress simulation since API completed
      if (progressController) {
        progressController.cancel();
      }

      if (error) throw error;

      if (data.success) {
        // Complete progress to 100%
        await completeProgress();
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
    let progressController: { cancel: () => void } | null = null;
    
    try {
      // Start progress simulation for slow model
      const progressPromise = simulateProgress(false);
      progressController = await progressPromise;
      
      // Make API call
      const { data, error } = await supabase.functions.invoke('generate-ai-notes', {
        body: {
          submissionId,
          type: 'improve',
          existingAiNotes: aiNotes,
          model: 'gpt-5-mini-2025-08-07' // Higher quality model for improvement
        }
      });

      // Cancel the progress simulation since API completed
      if (progressController) {
        progressController.cancel();
      }

      if (error) throw error;

      if (data.success) {
        // Complete progress to 100%
        await completeProgress();
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
      
      {parsedNotes.text && !isProcessing ? (
        /* Show notes content when not processing */
        <div className="space-y-4">
          <EditableField
            label=""
            value={parsedNotes.text}
            onSave={(value) => {
              // Preserve confidence score if it exists
              const updatedValue = parsedNotes.confidence !== null 
                ? `[${parsedNotes.confidence}] - ${value}`
                : value;
              return onUpdate('ai_notes', updatedValue);
            }}
            placeholder="Modifica le note AI..."
            multiline
          />
        </div>
      ) : (
        /* Show loading state for initial generation or when processing existing notes */
        <div className="w-full rounded-md border border-input bg-gray-50 p-3 text-sm relative min-h-24">
          <div className="flex flex-col items-center justify-center h-full py-4">
            {!parsedNotes.text && !isProcessing ? (
              /* Initial empty state */
              <>
                <div className="text-gray-400 italic text-center mb-3 px-4">
                  Clicca su "Genera" per creare note AI basate sui dati del lead e sulle risposte fornite
                </div>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating || isImproving}
                  className="bg-[#245C4F] hover:bg-[#1a453b]"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Genera
                </Button>
              </>
            ) : (
              /* Progress bar for generation/regeneration/improvement */
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{progressLabel || 'Preparazione...'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-2" />
              </div>
            )}
          </div>
        </div>
      )}

      {parsedNotes.text && !isGenerating && !isImproving && (
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