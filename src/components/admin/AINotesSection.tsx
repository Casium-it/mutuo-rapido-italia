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

  // Simulate realistic progress for different models (simplified)
  const simulateProgress = (isFastModel: boolean) => {
    const totalTime = isFastModel ? 40 : 120; // Total time to reach 99%
    
    return new Promise<{ cancel: () => void }>((resolve) => {
      const startTime = Date.now();
      let animationFrame: number;
      let cancelled = false;
      
      // Start at 1%
      setProgressLabel('Caricamento dati...');
      setProgress(1);
      
      const updateProgress = () => {
        if (cancelled) return;
        
        const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
        
        if (elapsedTime < totalTime) {
          // Progress from 1% to 99% over totalTime seconds
          const progressRatio = elapsedTime / totalTime;
          const currentProgress = 1 + (98 * progressRatio); // 1% + 98% progression to reach 99%
          
          // Update label based on progress
          if (currentProgress < 30) {
            setProgressLabel('Caricamento dati...');
          } else if (currentProgress < 70) {
            setProgressLabel(isFastModel ? 'Generazione rapida...' : 'Elaborazione approfondita...');
          } else {
            setProgressLabel('Finalizzazione...');
          }
          
          setProgress(Math.min(99, currentProgress));
          animationFrame = requestAnimationFrame(updateProgress);
        } else {
          // Wait at 99% for actual completion
          setProgressLabel('Attesa completamento...');
          setProgress(99);
          animationFrame = requestAnimationFrame(updateProgress);
        }
      };
      
      const cancel = () => {
        cancelled = true;
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
      
      animationFrame = requestAnimationFrame(updateProgress);
      resolve({ cancel });
    });
  };

  // Sprint to completion animation (2 seconds)
  const sprintToCompletion = (currentProgress: number) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const startProgress = currentProgress;
      const targetProgress = 100;
      const sprintDuration = 2000; // 2 seconds
      let animationFrame: number;
      
      setProgressLabel('Completamento...');
      
      const updateSprint = () => {
        const elapsedTime = Date.now() - startTime;
        const sprintRatio = Math.min(elapsedTime / sprintDuration, 1);
        
        // Smooth easing function (ease-out)
        const easedRatio = 1 - Math.pow(1 - sprintRatio, 3);
        const newProgress = startProgress + ((targetProgress - startProgress) * easedRatio);
        
        setProgress(newProgress);
        
        if (sprintRatio >= 1) {
          setProgress(100);
          setProgressLabel('Completato!');
          resolve();
        } else {
          animationFrame = requestAnimationFrame(updateSprint);
        }
      };
      
      animationFrame = requestAnimationFrame(updateSprint);
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
        // Sprint to completion in 2 seconds
        await sprintToCompletion(progress);
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
        // Sprint to completion in 2 seconds
        await sprintToCompletion(progress);
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
      
      <div className={`w-full rounded-md border border-input bg-gray-50 p-3 text-sm relative ${
        parsedNotes.text ? 'min-h-[200px]' : 'h-24'
      }`}>
        {parsedNotes.text ? (
          <div className="relative">
            {/* Blur existing text when regenerating/improving */}
            <div className={`whitespace-pre-wrap ${(isGenerating || isImproving) ? 'blur-sm opacity-50' : ''} transition-all duration-300`}>
              {parsedNotes.text}
            </div>
            
            {/* Progress bar overlay for regenerate/improve */}
            {(isGenerating || isImproving) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm">
                <div className="w-full max-w-md space-y-3 p-6 bg-white/90 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{progressLabel || (isImproving ? 'Preparazione...' : 'Preparazione...')}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {!isGenerating ? (
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
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Genera
                </Button>
              </>
            ) : (
              /* Progress bar for initial generation */
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{progressLabel || 'Preparazione...'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-2" />
              </div>
            )}
          </div>
        )}
      </div>

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