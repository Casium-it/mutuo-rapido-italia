
import React, { useEffect, useState, useRef } from "react";
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
  
  // Uso un ref per tenere traccia dell'ultima navigazione
  const lastProcessedParams = useRef<{
    blockId?: string,
    questionId?: string
  }>({});
  
  // Add navigation lock to prevent multiple navigation attempts
  const isNavigatingRef = useRef(false);
  
  // Sincronizza il componente con l'URL quando cambia
  useEffect(() => {
    // Se non abbiamo parametri, non facciamo nulla
    if (!params.blockId || !params.questionId) {
      setIsInitialized(true);
      return;
    }
    
    // Skip if already navigating
    if (isNavigatingRef.current) {
      return;
    }
    
    // Controlla se abbiamo già processato questi parametri esatti
    const isSameParams = 
      lastProcessedParams.current.blockId === params.blockId &&
      lastProcessedParams.current.questionId === params.questionId;
      
    // Aggiorna il ref con i parametri correnti
    lastProcessedParams.current = {
      blockId: params.blockId,
      questionId: params.questionId
    };
    
    // Determina se è necessario aggiornare lo stato interno
    const needsStateUpdate = 
      state.activeQuestion.block_id !== params.blockId ||
      state.activeQuestion.question_id !== params.questionId;
    
    // Solo se è necessario un aggiornamento dello stato
    // e non abbiamo già processato questi parametri, aggiorniamo lo stato
    if (!isSameParams && needsStateUpdate) {
      // Set navigation lock
      isNavigatingRef.current = true;
      
      // Update state with a small delay to prevent immediate re-renders
      setTimeout(() => {
        goToQuestion(params.blockId!, params.questionId!, true);
        
        // Release navigation lock after a delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      }, 50);
    }
    
    setIsInitialized(true);
  }, [location.pathname, params.blockId, params.questionId]); 
  
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

  // Handle repeating group blocks, find the active question in the subflow
  if (isRepeatingGroupBlock(activeBlock)) {
    const activeQuestion = activeBlock.subflow.find(
      question => question.question_id === state.activeQuestion.question_id
    );

    if (!activeQuestion) {
      // If the active question is not in the subflow, it's likely the manager_view
      if (state.activeQuestion.question_id === 'manager_view') {
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Vista manager per il gruppo ripetuto.</p>
          </div>
        );
      }
      
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Domanda non trovata nel sottoflusso.</p>
        </div>
      );
    }

    // Render the question from the subflow with the correct block_id
    return (
      <div className="max-w-2xl">
        <div className="space-y-4">
          <FormQuestion question={{
            ...activeQuestion,
            block_id: activeBlock.block_id
          }} />
        </div>
      </div>
    );
  }

  // Handle standard blocks
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
