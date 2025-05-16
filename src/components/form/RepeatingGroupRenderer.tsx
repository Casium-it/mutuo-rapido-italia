
import React, { useState, useEffect } from 'react';
import { RepeatingGroupBlock, RepeatingGroupEntry } from '@/types/form';
import { RepeatingGroupManager } from './RepeatingGroupManager';
import { LinearRepeatingGroupWizard } from './LinearRepeatingGroupWizard';
import { useRepeatingGroup } from '@/hooks/useRepeatingGroup';
import { useForm } from '@/contexts/FormContext';
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
    subtitle = "Gestisci qui tutti gli elementi. Puoi aggiungere, modificare o eliminare elementi.",
    empty_state_text = "Non hai ancora aggiunto nessun elemento.",
    add_button_text = "Aggiungi elemento",
    continue_button_text = "Continua"
  } = block;
  
  const { navigateToNextQuestion, state } = useForm();
  const { addEntry, updateEntry, refreshEntries } = useRepeatingGroup(repeating_id);
  
  // Stato per la modalità di visualizzazione (manager o subflow)
  const [mode, setMode] = useState<'manager' | 'subflow'>('manager');
  
  // Stato per il record in corso di modifica
  const [editingEntry, setEditingEntry] = useState<{
    data: RepeatingGroupEntry;
    index: number;
  } | null>(null);
  
  // Determina i campi chiave in base al tipo di repeating group
  const determineKeyFields = () => {
    // Default per redditi aggiuntivi
    let typeField = 'income_type';
    let amountField = 'amount_input';
    let descriptionField = 'income_description';

    // Qui puoi personalizzare i campi in base all'ID del gruppo ripetuto
    if (repeating_id === 'secondary_income') {
      typeField = 'income_type';
      amountField = 'amount_input';
      descriptionField = undefined;
    }
    // Aggiungi qui altri casi quando crei nuovi gruppi ripetuti

    return { typeField, amountField, descriptionField };
  };

  const { typeField, amountField, descriptionField } = determineKeyFields();
  
  // Effetto per aggiornare i dati quando il form cambia modalità o blocco
  useEffect(() => {
    // Reset mode e stati quando cambia il blocco attivo
    setMode('manager');
    setEditingEntry(null);
    
    // Forza un refresh dei dati per assicurarsi che siano aggiornati
    refreshEntries();
    
    // Controllo quando la pagina viene ricaricata o quando si naviga
    const handleBeforeUnload = () => {
      // Dispara un evento di reset quando la pagina viene ricaricata
      dispatchResetEvent();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [block.block_id, state.activeQuestion.block_id, refreshEntries]);
  
  // Gestisce l'aggiunta di un nuovo record
  const handleAdd = () => {
    setEditingEntry(null); // Non stiamo modificando, stiamo aggiungendo
    setMode('subflow');
  };
  
  // Gestisce la modifica di un record esistente
  const handleEdit = (entry: RepeatingGroupEntry, index: number) => {
    setEditingEntry({ data: entry, index });
    setMode('subflow');
  };
  
  // Gestisce il completamento del subflow
  const handleSubflowComplete = (data: RepeatingGroupEntry) => {
    let success = false;
    
    if (editingEntry) {
      // Aggiorna un record esistente
      success = updateEntry(data, editingEntry.index);
      
      if (success) {
        toast({
          title: "Elemento aggiornato",
          description: "Le modifiche sono state salvate con successo."
        });
      }
    } else {
      // Aggiunge un nuovo record
      success = addEntry(data);
      
      if (success) {
        toast({
          title: "Elemento aggiunto",
          description: "Il nuovo elemento è stato aggiunto con successo."
        });
      }
    }
    
    if (!success) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dei dati.",
        variant: "destructive"
      });
    }
    
    // Forza un aggiornamento dei dati
    refreshEntries();
    
    // Torna alla vista manager
    setMode('manager');
  };
  
  // Gestisce l'annullamento del subflow
  const handleSubflowCancel = () => {
    setMode('manager');
    setEditingEntry(null);
  };
  
  // Gestisce la pressione del pulsante continua
  const handleContinue = () => {
    // Usa l'ID della domanda attiva corrente invece del block_id
    const currentQuestionId = state.activeQuestion.question_id;
    navigateToNextQuestion(currentQuestionId, "next_block");
  };
  
  if (mode === 'subflow') {
    return (
      <LinearRepeatingGroupWizard
        questions={subflow}
        initialData={editingEntry?.data}
        onComplete={handleSubflowComplete}
        onCancel={handleSubflowCancel}
        completeButtonText={editingEntry ? "Salva modifiche" : add_button_text}
        cancelButtonText="Annulla"
      />
    );
  }
  
  return (
    <RepeatingGroupManager
      repeatingId={repeating_id}
      title={title}
      subtitle={subtitle}
      emptyStateText={empty_state_text}
      addButtonText={add_button_text}
      continueButtonText={continue_button_text}
      typeField={typeField}
      amountField={amountField}
      descriptionField={descriptionField}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onContinue={handleContinue}
    />
  );
}
