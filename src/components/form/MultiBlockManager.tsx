
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormExtended } from "@/hooks/useFormExtended";
import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { MultiBlockManagerPlaceholder } from "@/types/form";
import { Plus, ArrowRight, Trash, AlertCircle, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface MultiBlockManagerProps {
  questionId: string;
  placeholderKey: string;
  placeholder: MultiBlockManagerPlaceholder;
}

export function MultiBlockManager({
  questionId,
  placeholderKey,
  placeholder
}: MultiBlockManagerProps) {
  // Importa il form context originale
  const formContext = useOriginalForm();
  
  const { 
    createDynamicBlock, 
    navigateToDynamicBlock, 
    deleteDynamicBlock, 
    navigateToNextQuestion,
    getDynamicBlocksByBlueprint,
    getBlockResponseSummary,
    isDynamicBlockComplete,
    getIncompleteBlocks,
    isBlockCompleted,
    markBlockAsCompleted
  } = useFormExtended();
  
  const isMobile = useIsMobile();
  
  // Flag di stato per errore di validazione
  const [showValidationError, setShowValidationError] = useState(false);
  
  // Ottieni tutti i blocchi dinamici basati su questo blueprint
  const dynamicBlocks = getDynamicBlocksByBlueprint(placeholder.blockBlueprint);
  
  // Identifica i blocchi incompleti
  const incompleteBlocks = getIncompleteBlocks(placeholder.blockBlueprint);
  const hasIncompleteBlocks = incompleteBlocks.length > 0;
  
  // Crea un nuovo blocco basato sul blueprint
  const handleAddBlock = () => {
    // Reset any previous validation error
    setShowValidationError(false);
    
    console.log(`Creazione blocco con blueprint: ${placeholder.blockBlueprint}`);
    
    try {
      // Usa il blueprint completo con il placeholder {copyNumber}
      const blockBlueprint = placeholder.blockBlueprint;
      
      // Ottieni il parent block ID direttamente dall'active question nel form context
      const parentBlockId = formContext.state.activeQuestion.block_id;
      
      console.log(`Blocco genitore attualmente attivo: ${parentBlockId}`);
      console.log(`Il blocco è completato? ${isBlockCompleted(parentBlockId) ? 'Sì' : 'No'}`);
      
      // Controlla se il blocco corrente (parent) è marcato come completo
      // Se sì, rimuovilo dalla lista dei blocchi completati perché stiamo aggiungendo un nuovo blocco dinamico
      if (isBlockCompleted(parentBlockId)) {
        // Rimuovi il blocco padre dai completati perché ora ha un nuovo blocco figlio incompleto
        console.log(`Rimuovendo il blocco ${parentBlockId} dalla lista dei completati`);
        
        // Utilizziamo il context già importato per rimuovere il blocco dai completati
        formContext.removeBlockFromCompleted(parentBlockId);
      }
      
      // Crea il blocco dinamico senza navigare ad esso
      const newBlockId = createDynamicBlock(blockBlueprint);
      
      if (!newBlockId) {
        console.error("Creazione blocco fallita, nessun ID restituito");
      }
    } catch (error) {
      console.error("Errore durante la creazione del blocco:", error);
    }
  };

  // Naviga ad un blocco specifico
  const handleNavigateToBlock = (blockId: string) => {
    // Reset any previous validation error
    setShowValidationError(false);
    navigateToDynamicBlock(blockId);
  };
  
  // Elimina un blocco specifico
  const handleDeleteBlock = (blockId: string) => {
    // Reset any previous validation error
    setShowValidationError(false);
    deleteDynamicBlock(blockId);
  };

  // Naviga alla prossima domanda solo se tutti i blocchi sono completi
  const handleContinue = () => {
    // Controlla se ci sono blocchi incompleti
    if (hasIncompleteBlocks) {
      // Mostra errore di validazione
      setShowValidationError(true);
      
      // Mostra un toast con l'errore
      toast.error("Completa o elimina tutti gli elementi prima di procedere", {
        description: "Devi completare o eliminare tutti gli elementi che hai aggiunto prima di procedere",
        duration: 5000,
      });
      
      // Non permettiamo la navigazione
      return;
    }
    
    setShowValidationError(false);
    // Se tutti i blocchi sono completi, procede
    navigateToNextQuestion(questionId, placeholder.leads_to);
  };

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {placeholder.placeholder_label}
        </h3>
        
        {dynamicBlocks.length > 0 && (
          <div className="mb-4 space-y-3">
            <h4 className="text-md font-medium text-gray-700">
              {dynamicBlocks.length === 1 
                ? "1 elemento aggiunto" 
                : `${dynamicBlocks.length} elementi aggiunti`}
            </h4>
            
            <ul className="space-y-3">
              {dynamicBlocks.map((block) => {
                const responseSummary = getBlockResponseSummary(block.block_id);
                const isComplete = isDynamicBlockComplete(block.block_id);
                
                return (
                  <li 
                    key={block.block_id} 
                    className="bg-[#F8F4EF] border border-[#BEB8AE] rounded-lg p-3 shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_6px_rgba(175,168,159,0.3)] transition-all"
                  >
                    <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center">
                            {isComplete ? (
                              <CheckCircle2 className="h-4 w-4 text-[#245C4F] mr-2 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                            )}
                            <span className={`font-medium ${isComplete ? 'text-[#245C4F]' : 'text-gray-800'}`}>
                              {block.title}
                            </span>
                          </div>
                          {responseSummary && (
                            <div 
                              className={`text-sm mt-1 text-gray-700`}
                              dangerouslySetInnerHTML={{ __html: responseSummary }}
                            />
                          )}
                        </div>
                      </div>
                      <div className={`flex ${isMobile ? 'mt-3 w-full justify-between' : 'items-center space-x-2 self-end'}`}>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleNavigateToBlock(block.block_id)}
                          className={`bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[10px] px-3 py-1.5 flex items-center shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all`}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          {isComplete ? "Modifica" : "Completa"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBlock(block.block_id)}
                          className="bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-[10px] px-2 py-1.5 flex items-center shadow-[0_3px_0_0_#b71c1c] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#b71c1c] transition-all"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            
            {showValidationError && hasIncompleteBlocks && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Completa tutti gli elementi prima di procedere</p>
                    <p className="mt-1">Hai {incompleteBlocks.length} {incompleteBlocks.length === 1 ? 'elemento' : 'elementi'} da completare o eliminare.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-col space-y-3 mt-4">
          {/* Add button */}
          <Button
            type="button"
            onClick={handleAddBlock}
            className="bg-white border border-[#245C4F] text-[#245C4F] hover:bg-[#F8F4EF] px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium inline-flex items-center gap-[8px] shadow-[0_3px_0_0_#AFA89F] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#AFA89F] transition-all"
          >
            <Plus className="h-4 w-4" />
            {placeholder.add_block_label}
          </Button>
          
          {/* Avanti button - disabilitato se ci sono blocchi incompleti */}
          <Button
            type="button"
            onClick={handleContinue}
            disabled={hasIncompleteBlocks}
            className={`${
              hasIncompleteBlocks 
                ? "bg-[#a0c3be] cursor-not-allowed" 
                : "bg-[#245C4F] hover:bg-[#1e4f44]"
            } text-white px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium ${
              hasIncompleteBlocks 
                ? "shadow-[0_3px_0_0_#8daca7]" 
                : "shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37]"
            } transition-all`}
          >
            Avanti
          </Button>
        </div>
      </div>
    </div>
  );
}
