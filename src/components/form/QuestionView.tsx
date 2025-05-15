
import React, { useEffect, useState } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams } from "react-router-dom";
import { StandardBlock, Block, RepeatingGroupBlock } from "@/types/form";

// Funzioni di utilità per il controllo del tipo
const isStandardBlock = (block: Block): block is StandardBlock => {
  return !('type' in block) || block.type !== 'repeating_group';
};

const isRepeatingGroupBlock = (block: Block): block is RepeatingGroupBlock => {
  return 'type' in block && block.type === 'repeating_group';
};

export function QuestionView() {
  const { state, blocks, goToQuestion } = useFormExtended();
  const location = useLocation();
  const params = useParams<{ blockId?: string, questionId?: string }>();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Sincronizza il componente con l'URL quando cambia
  useEffect(() => {
    if (params.blockId && params.questionId) {
      // Se l'URL contiene blockId e questionId, ma sono diversi dallo stato attuale,
      // aggiorna lo stato interno per allinearlo all'URL
      if (state.activeQuestion.block_id !== params.blockId || 
          state.activeQuestion.question_id !== params.questionId) {
        goToQuestion(params.blockId, params.questionId, true);
      }
    }
    
    setIsInitialized(true);
  }, [location.pathname, params.blockId, params.questionId, state.activeQuestion, goToQuestion]);
  
  // Attendere che il componente sia inizializzato prima di renderizzare
  if (!isInitialized) {
    return <div className="p-4">Caricamento...</div>;
  }
  
  // Find the current active block and question
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
  
  // Verifica che il blocco sia esistente
  if (!activeBlock) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Blocco non trovato.</p>
      </div>
    );
  }

  // Se il blocco è un RepeatingGroupBlock, non dovremmo visualizzare questo componente
  if (isRepeatingGroupBlock(activeBlock)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Questo blocco utilizza un componente personalizzato.</p>
      </div>
    );
  }

  // A questo punto sappiamo che è un StandardBlock
  const activeQuestion = activeBlock.questions.find(
    question => question.question_id === state.activeQuestion.question_id
  );

  if (!activeQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Domanda non trovata.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="space-y-4">
        <FormQuestion question={activeQuestion} />
      </div>
    </div>
  );
}
