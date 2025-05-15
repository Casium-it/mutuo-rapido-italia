
import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Question, IncomeSource } from "@/types/form";
import { IncomeSourceCard } from "./IncomeSourceCard";
import { AddIncomeSourceButton } from "./AddIncomeSourceButton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface IncomeSourceManagerProps {
  question: Question;
}

export function IncomeSourceManager({ question }: IncomeSourceManagerProps) {
  const { 
    getIncomeSources, 
    addIncomeSource, 
    removeIncomeSource, 
    navigateToNextQuestion,
    editIncomeSource,
    resetCurrentIncomeSource,
    state
  } = useFormExtended();
  
  // Ottieni le fonti di reddito aggiornate dal contesto
  const incomeSources = getIncomeSources();
  
  // Log per debug
  useEffect(() => {
    console.log("IncomeSourceManager mounted/updated");
    console.log("Fonti di reddito disponibili:", incomeSources);
    console.log("State income sources:", state.incomeSources);
  }, [incomeSources, state.incomeSources]);
  
  const handleAddNew = () => {
    // Resetta l'ID della fonte di reddito corrente prima di navigare
    resetCurrentIncomeSource();
    navigateToNextQuestion(question.question_id, "nuovo_reddito_secondario");
  };
  
  const handleEditSource = (source: IncomeSource) => {
    console.log("Editing income source:", source);
    
    // Imposta la fonte di reddito corrente per la modifica
    editIncomeSource(source.id);
    
    // Naviga alla prima domanda per questo tipo di reddito
    const detailsQuestionId = `dettagli_${source.type}`;
    navigateToNextQuestion(question.question_id, detailsQuestionId);
  };
  
  const handleRemoveSource = (sourceId: string) => {
    removeIncomeSource(sourceId);
    toast({
      title: "Fonte di reddito rimossa",
      description: "La fonte di reddito è stata eliminata correttamente.",
      variant: "default",
    });
  };
  
  const handleContinue = () => {
    // Se non ci sono fonti di reddito, non possiamo procedere
    if (incomeSources.length === 0) {
      toast({
        title: "Nessuna fonte di reddito",
        description: "Aggiungi almeno una fonte di reddito prima di continuare.",
        variant: "destructive",
      });
      return;
    }
    
    // Altrimenti, procedi al blocco successivo
    navigateToNextQuestion(question.question_id, "next_block");
  };
  
  // Non mostrare nulla se non è una domanda di gestione reddito
  if (!question.is_income_manager) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Lista delle fonti di reddito esistenti */}
      {incomeSources && incomeSources.length > 0 ? (
        <div className="space-y-4">
          {incomeSources.map(source => (
            <IncomeSourceCard 
              key={source.id}
              source={source}
              onEdit={() => handleEditSource(source)}
              onRemove={() => handleRemoveSource(source.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Nessuna fonte di reddito aggiuntiva inserita.</p>
          <p className="text-gray-500 text-sm">Clicca sul pulsante sotto per aggiungerne una.</p>
        </div>
      )}
      
      {/* Pulsante per aggiungere una nuova fonte di reddito */}
      <AddIncomeSourceButton onClick={handleAddNew} />
      
      {/* Pulsante "Continua" - mostrato solo se ci sono fonti di reddito */}
      {incomeSources && incomeSources.length > 0 && (
        <div className="mt-8">
          <Button
            type="button"
            className={cn(
              "bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium",
              "transition-all shadow-[0_6px_12px_rgba(36,92,79,0.2)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.25)]",
              "inline-flex items-center gap-[12px]"
            )}
            onClick={handleContinue}
          >
            Continua <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
