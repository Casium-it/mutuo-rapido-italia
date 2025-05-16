
import React, { useState, useEffect } from 'react';
import { RepeatingGroupBlock, RepeatingGroupEntry } from '@/types/form';
import { useRepeatingGroup } from '@/hooks/useRepeatingGroup';
import { useForm } from '@/contexts/FormContext';
import { toast } from '@/components/ui/use-toast';
import { IncomeManagerView } from './IncomeManagerView';
import { SubflowForm } from './SubflowForm';
import { dispatchResetEvent } from '@/utils/repeatingGroupUtils';

interface RepeatingGroupRendererProps {
  block: RepeatingGroupBlock;
  isIsolatedSubflow?: boolean;
  initialEditingIndex?: number | null;
  onSubflowComplete?: () => void;
  onSubflowCancel?: () => void;
  onEnterSubflow?: (block: RepeatingGroupBlock, index: number | null) => void;
}

export function RepeatingGroupRenderer({
  block,
  isIsolatedSubflow = false,
  initialEditingIndex = null,
  onSubflowComplete,
  onSubflowCancel,
  onEnterSubflow
}: RepeatingGroupRendererProps) {
  const { repeating_id, subflow, summary_id, summary_template } = block;
  const { navigateToNextQuestion, state } = useForm();
  const { addEntry, updateEntry, refreshEntries, entries, deleteEntry } = useRepeatingGroup(repeating_id);

  // Stato per la modalità di visualizzazione (manager o subflow)
  // Se isIsolatedSubflow è true, inizializzalo già in modalità subflow
  const [mode, setMode] = useState<'manager' | 'subflow'>(
    isIsolatedSubflow ? 'subflow' : 'manager'
  );

  // Stato per il record in corso di modifica
  const [editingEntry, setEditingEntry] = useState<{
    data: RepeatingGroupEntry;
    index: number;
  } | null>(
    initialEditingIndex !== null
      ? { data: entries[initialEditingIndex] || {}, index: initialEditingIndex }
      : null
  );

  // Effetto per aggiornare i dati quando il form cambia modalità o blocco
  useEffect(() => {
    // Forza un refresh dei dati per assicurarsi che siano aggiornati
    refreshEntries();

    // Se siamo in modalità isolata e c'è un initialEditingIndex, impostiamo l'editing entry
    if (isIsolatedSubflow && initialEditingIndex !== null && entries[initialEditingIndex]) {
      setEditingEntry({
        data: entries[initialEditingIndex],
        index: initialEditingIndex
      });
    }

    // Controllo quando la pagina viene ricaricata o quando si naviga
    const handleBeforeUnload = () => {
      // Dispara un evento di reset quando la pagina viene ricaricata
      dispatchResetEvent();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [block.block_id, refreshEntries, isIsolatedSubflow, initialEditingIndex, entries]);

  // Gestisce l'aggiunta di un nuovo record
  const handleAdd = () => {
    if (onEnterSubflow) {
      // Se abbiamo un handler per entrare in subflow, usiamo quello
      onEnterSubflow(block, null);
      return;
    }

    setEditingEntry(null); // Non stiamo modificando, stiamo aggiungendo
    setMode('subflow');
  };

  // Gestisce la modifica di un record esistente
  const handleEdit = (entry: RepeatingGroupEntry, index: number) => {
    if (onEnterSubflow) {
      // Se abbiamo un handler per entrare in subflow, usiamo quello
      onEnterSubflow(block, index);
      return;
    }

    setEditingEntry({ data: entry, index });
    setMode('subflow');
  };

  // Gestisce il completamento del subflow
  const handleSubflowComplete = (data: RepeatingGroupEntry) => {
    let success = false;

    console.log('Normalized data before save:', data);

    if (editingEntry) {
      // Aggiorna un record esistente
      success = updateEntry(data, editingEntry.index);

      if (success) {
        toast({
          title: "Dati aggiornati",
          description: "Le modifiche sono state salvate con successo."
        });
      }
    } else {
      // Aggiunge un nuovo record
      success = addEntry(data);

      if (success) {
        toast({
          title: "Dati aggiunti",
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

    // Se siamo in modalità isolata e abbiamo un handler per il completamento, lo chiamiamo
    if (isIsolatedSubflow && onSubflowComplete) {
      onSubflowComplete();
      return;
    }

    // Altrimenti, torna alla vista manager
    setMode('manager');
  };

  // Gestisce l'annullamento del subflow
  const handleSubflowCancel = () => {
    // Se siamo in modalità isolata e abbiamo un handler per l'annullamento, lo chiamiamo
    if (isIsolatedSubflow && onSubflowCancel) {
      onSubflowCancel();
      return;
    }

    // Altrimenti, torna alla vista manager
    setMode('manager');
    setEditingEntry(null);
  };

  // Gestisce la pressione del pulsante continua
  const handleContinue = () => {
    // Usa l'ID della domanda attiva corrente invece del block_id
    const currentQuestionId = state.activeQuestion.question_id;
    navigateToNextQuestion(currentQuestionId, "next_block");
  };

  // In modalità subflow, rendiamo solo il SubflowForm
  if (mode === 'subflow') {
    return (
      <div className="w-full">
        <SubflowForm
          questions={subflow}
          initialData={editingEntry?.data}
          onComplete={handleSubflowComplete}
          onCancel={handleSubflowCancel}
          endSignal="end_of_subflow"
        />
      </div>
    );
  }

  // Altrimenti, rendiamo la vista manager
  return (
    <IncomeManagerView
      repeatingId={repeating_id}
      title={block.title}
      subtitle={block.subtitle || "Gestisci qui tutti i tuoi redditi aggiuntivi. Puoi aggiungere, modificare o eliminare fonti di reddito."}
      emptyStateText={block.empty_state_text || "Non hai ancora aggiunto nessuna fonte di reddito aggiuntiva."}
      addButtonText={block.add_button_text || "Aggiungi fonte di reddito"}
      continueButtonText={block.continue_button_text || "Continua"}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={deleteEntry}
      onContinue={handleContinue}
      entries={entries}
      summaryId={summary_id}
      summaryTemplate={summary_template}
    />
  );
}
