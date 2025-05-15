
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
  
  // Refs per tracciare lo stato di navigazione e prevenire loop
  const lastProcessedParams = useRef<{
    blockId?: string,
    questionId?: string,
    pathname: string,
    timestamp: number
  }>({ pathname: '', timestamp: 0 });
  
  const isNavigatingRef = useRef(false);
  const initCompletedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Sincronizza il componente con l'URL quando cambia
  useEffect(() => {
    // Pulizia dei timeout quando il componente viene smontato
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Effetto principale per la sincronizzazione con l'URL
  useEffect(() => {
    // Se già completato l'inizializzazione e non ci sono parametri, non fare nulla
    if (initCompletedRef.current && (!params.blockId || !params.questionId)) {
      return;
    }
    
    // Se non abbiamo parametri, imposta solo l'inizializzazione
    if (!params.blockId || !params.questionId) {
      setIsInitialized(true);
      initCompletedRef.current = true;
      return;
    }
    
    // Salta se già in navigazione
    if (isNavigatingRef.current) {
      console.log("Already navigating, skipping URL sync");
      return;
    }
    
    // Controlla se è lo stesso pathname che abbiamo già processato recentemente
    const currentPathname = location.pathname;
    const isSamePathname = lastProcessedParams.current.pathname === currentPathname;
    const isRecentNavigation = Date.now() - lastProcessedParams.current.timestamp < 1500;
    
    if (isSamePathname && isRecentNavigation) {
      console.log(`QuestionView: Skipping duplicate navigation to ${currentPathname}`);
      setIsInitialized(true);
      return;
    }
    
    // Determina se è necessario aggiornare lo stato interno
    const needsStateUpdate = 
      state.activeQuestion.block_id !== params.blockId ||
      state.activeQuestion.question_id !== params.questionId;
    
    // Solo se è necessario un aggiornamento dello stato, procediamo
    if (needsStateUpdate) {
      // Aggiorna il ref con i parametri correnti e timestamp
      lastProcessedParams.current = {
        blockId: params.blockId,
        questionId: params.questionId,
        pathname: currentPathname,
        timestamp: Date.now()
      };
      
      // Imposta il lock di navigazione
      isNavigatingRef.current = true;
      console.log(`QuestionView: Syncing state with URL: ${params.blockId}/${params.questionId}`);
      
      // Pulisci eventuali timeout precedenti
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Aggiorna lo stato con un piccolo ritardo per prevenire re-render immediati
      timeoutRef.current = setTimeout(() => {
        goToQuestion(params.blockId!, params.questionId!, true);
        
        // Rilascia il lock di navigazione dopo un ritardo
        timeoutRef.current = setTimeout(() => {
          isNavigatingRef.current = false;
          console.log("QuestionView: Navigation lock released");
          timeoutRef.current = null;
        }, 1500);
      }, 50);
    }
    
    // Imposta l'inizializzazione completata
    setIsInitialized(true);
    initCompletedRef.current = true;
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
