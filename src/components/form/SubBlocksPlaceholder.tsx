
import React from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    blocks 
  } = useFormExtended();

  // Ottieni tutti i blocchi copiati da questo sourceBlockId
  const copiedBlockIds = getBlockCopiesForSource(sourceBlockId);
  
  // Trova i blocchi effettivi dai loro ID
  const copiedBlocks = copiedBlockIds
    .map(blockId => blocks.find(b => b.block_id === blockId))
    .filter(Boolean);

  // Gestisci la creazione di una nuova copia del blocco e naviga direttamente ad essa
  const handleAddBlockCopy = () => {
    // Crea una nuova copia del blocco
    const newBlockId = copyBlock(sourceBlockId);
    
    // Se la creazione è riuscita, naviga automaticamente alla prima domanda del nuovo blocco
    if (newBlockId) {
      // Trova il blocco appena creato
      const newBlock = blocks.find(b => b.block_id === newBlockId);
      if (newBlock && newBlock.questions.length > 0) {
        // Naviga alla prima domanda del nuovo blocco
        const firstQuestionId = newBlock.questions[0].question_id;
        goToQuestion(newBlockId, firstQuestionId);
      }
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
              className="border border-[#E7E1D9] hover:border-[#245C4F] cursor-pointer transition-colors"
              onClick={() => block && handleNavigateToBlock(block.block_id)}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="font-medium">
                  {block?.title} {index + 1}
                </div>
                <div className="text-sm text-gray-500">
                  Modifica
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pulsante per aggiungere un nuovo blocco */}
      <Button
        type="button"
        onClick={handleAddBlockCopy}
        variant="outline"
        className={cn(
          "border-[1.5px] border-dashed border-[#BEB8AE] text-[#245C4F] bg-transparent",
          "hover:bg-[#F8F4EF] hover:border-[#245C4F]",
          "flex items-center gap-2 px-4 py-2"
        )}
      >
        <Plus className="h-4 w-4" />
        {addBlockLabel}
      </Button>
    </div>
  );
}
