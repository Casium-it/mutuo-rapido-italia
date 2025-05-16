
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
 * 
 * Questo componente gestisce la creazione dinamica di blocchi copiati da un blocco sorgente,
 * consentendo all'utente di aggiungere più istanze dello stesso tipo di informazione (ad es. redditi secondari).
 * 
 * Quando l'utente fa clic sul pulsante "Aggiungi", viene creata una copia del blocco e l'utente
 * viene automaticamente indirizzato alla prima domanda del nuovo blocco.
 * 
 * @param questionId - L'ID della domanda contenente questo placeholder
 * @param placeholderKey - La chiave del placeholder all'interno della domanda
 * @param sourceBlockId - L'ID del blocco sorgente da copiare
 * @param addBlockLabel - Testo personalizzato per il pulsante di aggiunta
 * @param placeholderLabel - Etichetta opzionale per il placeholder
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
    navigateToNextQuestion
  } = useFormExtended();
  
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // Ottieni tutti i blocchi copiati da questo sourceBlockId
  const copiedBlockIds = getBlockCopiesForSource(sourceBlockId);
  
  // Trova i blocchi effettivi dai loro ID
  const copiedBlocks = copiedBlockIds
    .map(blockId => blocks.find(b => b.block_id === blockId))
    .filter(Boolean);

  // Gestisci la creazione di una nuova copia del blocco e naviga direttamente ad essa
  const handleAddBlockCopy = () => {
    // Previeni doppi clic
    if (isAddingBlock) return;
    
    setIsAddingBlock(true);
    
    try {
      // Crea una nuova copia del blocco
      const newBlockId = copyBlock(sourceBlockId);
      
      // Se la creazione è riuscita, naviga automaticamente alla prima domanda del nuovo blocco
      if (newBlockId) {
        setTimeout(() => {
          // Trova il blocco appena creato
          const newBlock = blocks.find(b => b.block_id === newBlockId);
          if (newBlock && newBlock.questions.length > 0) {
            // Naviga alla prima domanda del nuovo blocco
            const firstQuestionId = newBlock.questions[0].question_id;
            goToQuestion(newBlockId, firstQuestionId);
          }
          setIsAddingBlock(false);
        }, 300); // Aumentato il ritardo da 100ms a 300ms per garantire che il blocco sia stato aggiunto
      } else {
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
      
      {/* Lista dei blocchi copiati */}
      {copiedBlocks.length > 0 && (
        <div className="space-y-3 mb-4">
          {copiedBlocks.map((block, index) => (
            <Card 
              key={block?.block_id} 
              className="border border-[#E7E1D9] hover:border-[#245C4F] transition-colors"
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div 
                  className="font-medium flex-1 cursor-pointer"
                  onClick={() => block && handleNavigateToBlock(block.block_id)}
                >
                  {block?.title} {index + 1}
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
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
              </CardContent>
            </Card>
          ))}
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
