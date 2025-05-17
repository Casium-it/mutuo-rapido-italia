
import React, { useState } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SubBlocksPlaceholderProps {
  questionId: string;
  placeholderKey: string;
  sourceBlockId: string;
  addBlockLabel?: string;
  placeholderLabel?: string;
}

/**
 * SubBlocksPlaceholder - Un componente che permette all'utente di aggiungere più istanze di un blocco
 */
export function SubBlocksPlaceholder({
  questionId,
  placeholderKey,
  sourceBlockId,
  addBlockLabel = "Aggiungi elemento",
  placeholderLabel
}: SubBlocksPlaceholderProps) {
  const { 
    copyBlock, 
    getBlockCopiesForSource, 
    goToQuestion, 
    blocks,
    removeBlock,
    navigateToNextQuestion,
    state
  } = useFormExtended();
  
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // Ottieni tutti i blocchi copiati da questo sourceBlockId
  const copiedBlockIds = getBlockCopiesForSource(sourceBlockId);
  console.log(`Blocchi copiati per ${sourceBlockId}:`, copiedBlockIds);
  
  // Trova i blocchi effettivi dai loro ID
  const copiedBlocks = copiedBlockIds
    .map(blockId => blocks.find(b => b.block_id === blockId))
    .filter(Boolean);

  // Funzione per ottenere un riassunto dinamico delle risposte del blocco
  const getBlockSummary = (blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return { summaryItems: [] };

    const responses = state.responses;
    const summaryItems: Array<{ label: string; value: string }> = [];
    
    // Itera su tutte le domande del blocco per generare un sommario dinamico
    block.questions.forEach(question => {
      const questionId = question.question_id;
      
      // Verifica se esiste una risposta per questa domanda
      if (responses[questionId]) {
        // Per ogni placeholder nella domanda
        Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
          const response = responses[questionId][placeholderKey];
          
          if (response !== undefined && response !== "") {
            let displayValue = "";
            
            // Gestisci i diversi tipi di placeholder
            if (placeholder.type === "select") {
              const options = placeholder.options;
              if (!Array.isArray(response)) {
                // Per selezione singola
                const option = options.find(opt => opt.id === response);
                if (option) {
                  displayValue = option.label;
                }
              } else {
                // Per selezione multipla
                displayValue = response
                  .map(id => {
                    const option = options.find(opt => opt.id === id);
                    return option ? option.label : id;
                  })
                  .join(", ");
              }
            } else if (placeholder.type === "input") {
              // Per input di testo o numeri
              displayValue = Array.isArray(response) ? response.join(", ") : response.toString();
              
              // Formatta i valori monetari quando appropriato
              if (placeholder.input_validation === "euro" && !isNaN(Number(displayValue))) {
                displayValue = new Intl.NumberFormat('it-IT', { 
                  style: 'currency', 
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(Number(displayValue));
              }
            }
            
            // Crea un'etichetta dalla domanda,
            // rimuovendo placeholder e sostituendoli con la risposta effettiva
            let questionText = question.question_text;
            
            // Rimuovi tutti i placeholder dal testo della domanda per l'etichetta
            questionText = questionText.replace(/\{\{[^}]+\}\}/g, "");
            
            // Pulisci il testo da spazi eccessivi e rimuovi eventuali spazi a fine testo
            questionText = questionText.trim();
            
            // Aggiungi al sommario solo se c'è un valore da mostrare
            if (displayValue) {
              summaryItems.push({
                label: questionText,
                value: displayValue
              });
            }
          }
        });
      }
    });
    
    return { summaryItems };
  };

  // Gestisci la creazione di una nuova copia del blocco e naviga direttamente ad essa
  const handleAddBlockCopy = () => {
    // Previeni doppi clic
    if (isAddingBlock) return;
    
    setIsAddingBlock(true);
    console.log("Creazione di una nuova copia del blocco:", sourceBlockId);
    
    try {
      // Crea una nuova copia del blocco
      const newBlockId = copyBlock(sourceBlockId);
      console.log("Nuovo blocco creato con ID:", newBlockId);
      
      // Se la creazione è riuscita, naviga automaticamente alla prima domanda del nuovo blocco
      if (newBlockId) {
        // Aumentato il timeout per garantire che il blocco sia completamente aggiunto
        setTimeout(() => {
          // Trova il blocco appena creato
          const newBlock = blocks.find(b => b.block_id === newBlockId);
          console.log("Trovato blocco:", newBlock);
          
          if (newBlock && newBlock.questions.length > 0) {
            // Naviga alla prima domanda del nuovo blocco
            const firstQuestionId = newBlock.questions[0].question_id;
            console.log(`Navigazione a ${newBlockId}/${firstQuestionId}`);
            goToQuestion(newBlockId, firstQuestionId);
          }
          setIsAddingBlock(false);
        }, 1000); // Aumentato a 1000ms per garantire che il blocco sia completamente registrato
      } else {
        console.error("Impossibile creare un nuovo blocco");
        setIsAddingBlock(false);
      }
    } catch (e) {
      console.error("Errore nella creazione del blocco:", e);
      setIsAddingBlock(false);
    }
  };

  // Gestisci la navigazione a un blocco copiato
  const handleNavigateToBlock = (blockId: string) => {
    // Trova il blocco e la sua prima domanda
    const block = blocks.find(b => b.block_id === blockId);
    if (block && block.questions.length > 0) {
      const firstQuestionId = block.questions[0].question_id;
      console.log(`Navigazione diretta a ${blockId}/${firstQuestionId}`);
      goToQuestion(blockId, firstQuestionId);
    }
  };
  
  // Gestisci l'eliminazione di un blocco copiato
  const handleRemoveBlock = (blockId: string) => {
    removeBlock(blockId);
  };
  
  // Gestisci la navigazione al prossimo blocco (saltando i blocchi invisibili)
  const handleGoToNextBlock = () => {
    navigateToNextQuestion(questionId, "next_block");
  };

  return (
    <div className="w-full my-4">
      {placeholderLabel && (
        <div className="text-[16px] font-medium text-gray-800 mb-3">
          {placeholderLabel}
        </div>
      )}
      
      {/* Lista dei blocchi copiati con il riepilogo */}
      {copiedBlocks.length > 0 && (
        <div className="space-y-3 mb-4">
          {copiedBlocks.map((block, index) => {
            const summary = getBlockSummary(block?.block_id || "");
            
            return (
              <Card 
                key={block?.block_id} 
                className="border border-[#E7E1D9] hover:border-[#245C4F] transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    {/* Titolo e riepilogo */}
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => block && handleNavigateToBlock(block.block_id)}
                    >
                      <h4 className="font-medium text-[#245C4F] mb-1">
                        {block?.title} {index + 1}
                      </h4>
                      
                      {/* Visualizza il riepilogo dinamico delle risposte */}
                      <div className="text-sm text-gray-700 space-y-1">
                        {summary.summaryItems.length > 0 ? (
                          summary.summaryItems.map((item, idx) => (
                            <p key={idx}>
                              <span className="font-medium">{item.label}</span> {item.value}
                            </p>
                          ))
                        ) : (
                          <p>Nessuna informazione disponibile</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Pulsante elimina */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-500 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questo {block?.title.toLowerCase()}? Questa azione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => block && handleRemoveBlock(block.block_id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mt-6">
        {/* Pulsante per aggiungere un nuovo blocco */}
        <Button
          type="button"
          onClick={handleAddBlockCopy}
          variant="outline"
          disabled={isAddingBlock}
          className={cn(
            "border-[1.5px] border-dashed border-[#BEB8AE] text-[#245C4F] bg-transparent",
            "hover:bg-[#F8F4EF] hover:border-[#245C4F]",
            "flex items-center gap-2 px-4 py-2"
          )}
        >
          <Plus className="h-4 w-4" />
          {isAddingBlock ? "Creazione..." : addBlockLabel}
        </Button>
        
        {/* Pulsante per passare al prossimo blocco */}
        <Button
          type="button"
          onClick={handleGoToNextBlock}
          variant="default"
          className="bg-[#245C4F] hover:bg-[#1A453A] text-white flex items-center gap-2 mt-4 sm:mt-0"
        >
          Avanti
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
