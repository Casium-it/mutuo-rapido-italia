
import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Block } from "@/types/form";

interface CompletionStatusProps {
  allBlocksCompleted: boolean;
  incompleteBlocks: Block[];
  onNavigateToBlock: (blockId: string, questionId: string) => void;
}

export function CompletionStatus({ 
  allBlocksCompleted, 
  incompleteBlocks, 
  onNavigateToBlock 
}: CompletionStatusProps) {
  if (allBlocksCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-700 mb-4">
        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-medium">Tutte le domande completate</p>
          <p className="text-sm text-green-600 mt-1">Non ci sono risposte mancanti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-red-700 mb-4">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-medium">Ci sono sezioni da completare</p>
          <p className="text-sm text-red-600 mt-1">
            Completa tutte le sezioni prima di inviare la richiesta.
          </p>
        </div>
      </div>
      
      <div className="pl-4 border-l-2 border-red-200">
        <h3 className="font-medium text-red-900 mb-2">Sezioni da completare:</h3>
        <ul className="space-y-2">
          {incompleteBlocks.map(block => (
            <li key={block?.block_id} className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-gray-700">{block?.title}</span>
              <Button 
                type="button" 
                size="sm" 
                variant="link" 
                className="ml-2 text-[#245C4F] p-0 h-auto" 
                onClick={() => {
                  if (block && block.questions.length > 0) {
                    onNavigateToBlock(block.block_id, block.questions[0].question_id);
                  }
                }}
              >
                Vai alla sezione
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
