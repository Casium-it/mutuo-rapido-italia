
import React, { useState } from 'react';
import { RepeatingGroupBlock, RepeatingGroupEntry } from '@/types/form';
import { IncomeManagerView } from './IncomeManagerView';
import { IncomeSubflowWizard } from './IncomeSubflowWizard';
import { useRepeatingGroup } from '@/hooks/useRepeatingGroup';
import { useForm } from '@/contexts/FormContext';
import { toast } from '@/components/ui/use-toast';

interface RepeatingGroupRendererProps {
  block: RepeatingGroupBlock;
}

export function RepeatingGroupRenderer({ block }: RepeatingGroupRendererProps) {
  const { repeating_id, subflow, title } = block;
  const { navigateToNextQuestion } = useForm();
  const { addEntry, updateEntry } = useRepeatingGroup(repeating_id);
  
  // Stato per la modalità di visualizzazione (manager o subflow)
  const [mode, setMode] = useState<'manager' | 'subflow'>('manager');
  
  // Stato per il record in corso di modifica
  const [editingEntry, setEditingEntry] = useState<{
    data: RepeatingGroupEntry;
    index: number;
  } | null>(null);
  
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
          title: "Reddito aggiornato",
          description: "Le modifiche alla fonte di reddito sono state salvate con successo."
        });
      }
    } else {
      // Aggiunge un nuovo record
      success = addEntry(data);
      
      if (success) {
        toast({
          title: "Reddito aggiunto",
          description: "La nuova fonte di reddito è stata aggiunta con successo."
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
    // Trova il blocco corrente e passa al blocco successivo
    navigateToNextQuestion(block.block_id, "next_block");
  };
  
  if (mode === 'subflow') {
    return (
      <IncomeSubflowWizard
        questions={subflow}
        initialData={editingEntry?.data}
        onComplete={handleSubflowComplete}
        onCancel={handleSubflowCancel}
      />
    );
  }
  
  return (
    <IncomeManagerView
      repeatingId={repeating_id}
      title={title}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onContinue={handleContinue}
    />
  );
}
