
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormExtended } from "@/hooks/useFormExtended";
import { MultiBlockManagerPlaceholder } from "@/types/form";
import { Plus, ArrowRight, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
    getBlockResponseSummary
  } = useFormExtended();
  
  const isMobile = useIsMobile();
  
  // Ottieni tutti i blocchi dinamici basati su questo blueprint
  const dynamicBlocks = getDynamicBlocksByBlueprint(placeholder.blockBlueprint);
  
  // Crea un nuovo blocco basato sul blueprint
  const handleAddBlock = () => {
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
    // Usa usedNextBlockNavRef.current = true come in navigateToNextQuestion
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
                
                return (
                  <li 
                    key={block.block_id} 
                    className="bg-[#F8F4EF] border border-[#BEB8AE] rounded-lg p-3 shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_6px_rgba(175,168,159,0.3)] transition-all"
                  >
                    <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                      <div className="flex items-center">
                        <div>
                          <span className="text-gray-800 font-medium">
                            {block.title}
                          </span>
                          {responseSummary && (
                            <div 
                              className="text-sm mt-1 text-[#245C4F]"
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
                          className="bg-[#245C4F] text-white hover:bg-[#1e4f44] rounded-[10px] px-3 py-1.5 flex items-center shadow-[0_2px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#1a3f37] transition-all"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Modifica
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBlock(block.block_id)}
                          className="bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-[10px] px-2 py-1.5 flex items-center shadow-[0_2px_0_0_#dc2626] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#dc2626] transition-all"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        <div className="flex flex-col space-y-3 mt-4">
          {/* Add button - rimosso l'attributo disabled e il testo di caricamento */}
          <Button
            type="button"
            onClick={handleAddBlock}
            className="bg-white border border-[#245C4F] text-[#245C4F] hover:bg-[#F8F4EF] px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium inline-flex items-center gap-[8px] shadow-[0_3px_0_0_#AFA89F] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#AFA89F] transition-all"
          >
            <Plus className="h-4 w-4" />
            {placeholder.add_block_label}
          </Button>
          
          {/* Avanti button always shown */}
          <Button
            type="button"
            onClick={handleContinue}
            className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all"
          >
            Avanti
          </Button>
        </div>
      </div>
    </div>
  );
}
