
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormExtended } from "@/hooks/useFormExtended";
import { MultiBlockManagerPlaceholder } from "@/types/form";
import { Plus, ArrowRight, Check, Trash, X } from "lucide-react";

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
  const { 
    createDynamicBlock, 
    navigateToDynamicBlock, 
    deleteDynamicBlock, 
    navigateToNextQuestion,
    getDynamicBlocksByBlueprint,
    areAllDynamicBlocksComplete,
    isBlockComplete 
  } = useFormExtended();
  
  const [isCreating, setIsCreating] = useState(false);
  
  // Ottieni tutti i blocchi dinamici basati su questo blueprint
  const dynamicBlocks = getDynamicBlocksByBlueprint(placeholder.blockBlueprint);
  const allBlocksComplete = areAllDynamicBlocksComplete(placeholder.blockBlueprint);
  
  // Crea un nuovo blocco basato sul blueprint
  const handleAddBlock = () => {
    if (isCreating) return; // Previene clic multipli durante la creazione
    
    setIsCreating(true);
    console.log(`Creazione blocco con blueprint: ${placeholder.blockBlueprint}`);
    
    try {
      // Usa il blueprint completo con il placeholder {copyNumber}
      const blockBlueprint = placeholder.blockBlueprint;
      
      // Crea il blocco dinamico senza navigare ad esso
      const newBlockId = createDynamicBlock(blockBlueprint);
      
      if (!newBlockId) {
        console.error("Creazione blocco fallita, nessun ID restituito");
      }
    } catch (error) {
      console.error("Errore durante la creazione del blocco:", error);
    } finally {
      // Ripristina lo stato dopo un breve ritardo
      setTimeout(() => setIsCreating(false), 500);
    }
  };

  // Naviga ad un blocco specifico
  const handleNavigateToBlock = (blockId: string) => {
    navigateToDynamicBlock(blockId);
  };
  
  // Elimina un blocco specifico
  const handleDeleteBlock = (blockId: string) => {
    deleteDynamicBlock(blockId);
  };

  // Naviga alla prossima domanda senza creare un nuovo blocco
  const handleContinue = () => {
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
            
            <ul className="space-y-2">
              {dynamicBlocks.map((block) => {
                const isComplete = isBlockComplete(block.block_id);
                return (
                  <li 
                    key={block.block_id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-center">
                      {isComplete ? (
                        <span className="flex items-center text-green-600 mr-2">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-500 mr-2">
                          <X className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-gray-800">
                        {block.title}
                        {!isComplete && (
                          <span className="text-amber-500 ml-2 text-sm">
                            (Incompleto)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleNavigateToBlock(block.block_id)}
                        className="bg-white border border-[#245C4F] text-[#245C4F] hover:bg-[#F8F4EF] rounded-[10px] px-2 py-1 flex items-center"
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        {isComplete ? "Visualizza" : "Completa"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBlock(block.block_id)}
                        className="bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-[10px] px-2 py-1 flex items-center"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button
            type="button"
            onClick={handleAddBlock}
            disabled={isCreating}
            className="bg-white border border-[#245C4F] text-[#245C4F] hover:bg-[#F8F4EF] px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium inline-flex items-center gap-[8px]"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? "Creazione in corso..." : placeholder.add_block_label}
          </Button>
          
          <Button
            type="button"
            onClick={handleContinue}
            disabled={dynamicBlocks.length > 0 && !allBlocksComplete}
            className={`bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium ${
              (dynamicBlocks.length > 0 && !allBlocksComplete) ? 
                "opacity-50 cursor-not-allowed hover:bg-[#245C4F]" : ""
            }`}
          >
            {dynamicBlocks.length > 0 && !allBlocksComplete 
              ? "Completa tutti gli elementi per continuare" 
              : "Continua"}
          </Button>
        </div>
        
        {dynamicBlocks.length > 0 && !allBlocksComplete && (
          <p className="mt-2 text-sm text-amber-600">
            Per proseguire è necessario completare tutti gli elementi aggiunti.
          </p>
        )}
      </div>
    </div>
  );
}
