import React, { useState, useEffect } from 'react';
import { RepeatingGroupBlock, RepeatingGroupEntry } from '@/types/form';
import { IncomeManagerView } from './IncomeManagerView';
import { useRepeatingGroup } from '@/hooks/useRepeatingGroup';
import { useForm } from '@/contexts/FormContext';
import { QuestionView } from './QuestionView';
import { toast } from '@/components/ui/use-toast';
import { dispatchResetEvent } from '@/utils/repeatingGroupUtils';

interface RepeatingGroupRendererProps {
  block: RepeatingGroupBlock;
}

export function RepeatingGroupRenderer({ block }: RepeatingGroupRendererProps) {
  const { 
    repeating_id, 
    subflow, 
    title, 
    subtitle = "Gestisci qui tutti i tuoi redditi aggiuntivi. Puoi aggiungere, modificare o eliminare fonti di reddito.",
    empty_state_text = "Non hai ancora aggiunto nessuna fonte di reddito aggiuntiva.",
    add_button_text = "Aggiungi fonte di reddito",
    continue_button_text = "Avanti"
  } = block;
  
  const { 
    goToQuestion, 
    navigateToNextQuestion, 
    state, 
    setResponse, 
    clearSubflowResponses,
    startEditingRepeatingEntry,
    cancelEditingRepeatingEntry
  } = useForm();
  
  const { 
    addEntry, 
    updateEntry, 
    refreshEntries, 
    entries, 
    deleteEntry 
  } = useRepeatingGroup(repeating_id);
  
  // Determine if we're in the manager view or a subflow view
  const isInManagerView = state.activeQuestion.question_id === 'manager_view';
  
  // Effect to update data when the form changes mode or block
  useEffect(() => {
    // Reset states when the active block changes
    refreshEntries();
    
    // Control when page is reloaded or navigated
    const handleBeforeUnload = () => {
      // Dispatch a reset event when the page is reloaded
      dispatchResetEvent();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [block.block_id, state.activeQuestion.block_id, refreshEntries]);
  
  // Handle adding a new entry (clear previous responses and navigate to the first question)
  const handleAdd = () => {
    // Clear any previous responses for the subflow questions
    clearSubflowResponses(subflow);
    
    // Navigate to the first question in the subflow
    const firstQuestion = subflow[0];
    if (firstQuestion) {
      goToQuestion(block.block_id, firstQuestion.question_id);
    }
  };
  
  // Handle editing an existing entry (prefill responses and navigate to the first question)
  const handleEdit = (entry: RepeatingGroupEntry, index: number) => {
    // Mark that we're editing this specific entry
    startEditingRepeatingEntry(repeating_id, index);
    
    // Clear any previous responses first
    clearSubflowResponses(subflow);
    
    // Set responses for all subflow questions based on the entry
    subflow.forEach(question => {
      const questionId = question.question_id;
      
      // Handle direct properties (assume one placeholder per question for simplicity)
      if (entry[questionId] !== undefined) {
        const placeholderKey = Object.keys(question.placeholders)[0];
        // Ensure we have a value to set
        if (entry[questionId] !== undefined) {
          setResponse(questionId, placeholderKey, entry[questionId]);
        }
      }
      
      // Handle nested properties (if stored in old format)
      if (typeof entry[questionId] === 'object') {
        Object.entries(entry[questionId]).forEach(([placeholderKey, value]) => {
          setResponse(questionId, placeholderKey, value as string | string[]);
        });
      }
    });
    
    // Navigate to the first question
    const firstQuestion = subflow[0];
    if (firstQuestion) {
      goToQuestion(block.block_id, firstQuestion.question_id);
    }
  };
  
  // Handle deleting an entry
  const handleDelete = (index: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questa fonte di reddito?")) {
      const success = deleteEntry(index);
      
      if (success) {
        toast({
          title: "Fonte di reddito eliminata",
          description: "La fonte di reddito è stata eliminata con successo.",
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione della fonte di reddito.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle continuing to the next block from the manager view
  const handleContinue = () => {
    // Get the current question ID (should be 'manager_view')
    const currentQuestionId = state.activeQuestion.question_id;
    
    // Navigate to the next block
    if (block.next_block_id) {
      // If we have a specific next block, go there
      goToQuestion(block.next_block_id, 'manager_view');
    } else {
      // Otherwise use the standard navigation to find the next block
      navigateToNextQuestion(currentQuestionId, 'next_block');
    }
  };
  
  // If we're not in the manager view, we must be in a subflow question
  if (!isInManagerView) {
    return <QuestionView />;
  }
  
  // In manager view, render the IncomeManagerView
  return (
    <IncomeManagerView
      repeatingId={repeating_id}
      title={title}
      subtitle={subtitle}
      emptyStateText={empty_state_text}
      addButtonText={add_button_text}
      continueButtonText={continue_button_text}
      summaryField={block.summary_field}
      summaryTemplate={block.summary_template}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onContinue={handleContinue}
      entries={entries}
    />
  );
}
