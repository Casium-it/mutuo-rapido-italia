
import React from "react";
import { Button } from "@/components/ui/button";
import { useFormExtended } from "@/hooks/useFormExtended";
import { MultiBlockManagerPlaceholder } from "@/types/form";
import { Plus } from "lucide-react";

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
  const { createAndNavigateToBlock, navigateToNextQuestion } = useFormExtended();

  // Crea un nuovo blocco basato sul blueprint
  const handleAddBlock = () => {
    // Passa direttamente il blueprint completo con il placeholder {copyNumber}
    // Sarà la funzione createDynamicBlock a gestire la sostituzione del numero
    createAndNavigateToBlock(placeholder.blockBlueprint, true);
  };

  // Naviga alla prossima domanda senza creare un nuovo blocco
  const handleContinue = () => {
    navigateToNextQuestion(questionId, placeholder.leads_to);
  };

  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {placeholder.placeholder_label}
        </h3>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button
            type="button"
            onClick={handleAddBlock}
            className="bg-white border border-[#245C4F] text-[#245C4F] hover:bg-[#F8F4EF] px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium inline-flex items-center gap-[8px]"
          >
            <Plus className="h-4 w-4" />
            {placeholder.add_block_label}
          </Button>
          
          <Button
            type="button"
            onClick={handleContinue}
            className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[16px] py-[10px] rounded-[10px] text-[16px] font-medium"
          >
            Continua
          </Button>
        </div>
      </div>
    </div>
  );
}
