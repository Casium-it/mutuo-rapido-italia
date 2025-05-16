import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from "react";
import { Block, FormState, FormResponse, NavigationHistory, RepeatingGroupEntry, Question } from "@/types/form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

type FormContextType = {
  state: FormState;
  blocks: Block[];
  goToQuestion: (block_id: string, question_id: string, replace?: boolean) => void;
  setResponse: (question_id: string, placeholder_key: string, value: string | string[]) => void;
  getResponse: (question_id: string, placeholder_key: string) => string | string[] | undefined;
  addActiveBlock: (block_id: string) => void;
  isQuestionAnswered: (question_id: string) => boolean;
  navigateToNextQuestion: (currentQuestionId: string, leadsTo: string) => void;
  getProgress: () => number;
  resetForm: () => void;
  getNavigationHistoryFor: (questionId: string) => NavigationHistory | undefined;
  startLoopEntry: (loopId: string) => void;
  editLoopEntry: (loopId: string, entryIndex: number) => void;
  deleteLoopEntry: (loopId: string, entryIndex: number) => void;
  saveCurrentLoopEntry: () => void;
  cancelCurrentLoopEntry: () => void;
};

type Action =
  | { type: "GO_TO_QUESTION"; block_id: string; question_id: string }
  | { type: "SET_RESPONSE"; question_id: string; placeholder_key: string; value: string | string[] }
  | { type: "ADD_ACTIVE_BLOCK"; block_id: string }
  | { type: "MARK_QUESTION_ANSWERED"; question_id: string }
  | { type: "SET_FORM_STATE"; state: Partial<FormState> }
  | { type: "RESET_FORM" }
  | { type: "SET_NAVIGATING"; isNavigating: boolean }
  | { type: "ADD_NAVIGATION_HISTORY"; history: NavigationHistory }
  | { type: "START_LOOP_ENTRY"; loopId: string }
  | { type: "EDIT_LOOP_ENTRY"; loopId: string; entryIndex: number }
  | { type: "DELETE_LOOP_ENTRY"; loopId: string; entryIndex: number }
  | { type: "SAVE_LOOP_ENTRY" }
  | { type: "CANCEL_LOOP_ENTRY" };

const initialState: FormState = {
  activeBlocks: [],
  activeQuestion: {
    block_id: "introduzione",
    question_id: "soggetto_acquisto"
  },
  responses: {},
  answeredQuestions: new Set(),
  isNavigating: false,
  navigationHistory: [],
  repeatingGroups: {},
  currentLoop: null
};

const FormContext = createContext<FormContextType | undefined>(undefined);

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "GO_TO_QUESTION":
      return {
        ...state,
        activeQuestion: {
          block_id: action.block_id,
          question_id: action.question_id
        }
      };
      
    case "SET_RESPONSE": {
      const newResponses = { ...state.responses };
      
      // Se siamo in un loop, salviamo le risposte temporanee nel currentLoop
      if (state.currentLoop) {
        const tempResponses = { 
          ...(state.currentLoop.tempResponses || {}) 
        };
        
        if (!tempResponses[action.question_id]) {
          tempResponses[action.question_id] = {};
        }
        
        tempResponses[action.question_id][action.placeholder_key] = action.value;
        
        return {
          ...state,
          currentLoop: {
            ...state.currentLoop,
            tempResponses
          }
        };
      }
      
      // Altrimenti, salviamo le risposte normalmente
      if (!newResponses[action.question_id]) {
        newResponses[action.question_id] = {};
      }
      
      newResponses[action.question_id][action.placeholder_key] = action.value;
      
      return {
        ...state,
        responses: newResponses
      };
    }
    
    case "ADD_ACTIVE_BLOCK": {
      if (state.activeBlocks.includes(action.block_id)) {
        return state;
      }
      return {
        ...state,
        activeBlocks: [...state.activeBlocks, action.block_id]
      };
    }
    
    case "MARK_QUESTION_ANSWERED": {
      const answeredQuestions = new Set(state.answeredQuestions);
      answeredQuestions.add(action.question_id);
      return {
        ...state,
        answeredQuestions
      };
    }
    
    case "SET_FORM_STATE": {
      return {
        ...state,
        ...action.state
      };
    }
    
    case "RESET_FORM": {
      return {
        ...initialState,
        activeBlocks: state.activeBlocks.filter(blockId => 
          initialState.activeBlocks.includes(blockId)),
        navigationHistory: [],
        repeatingGroups: {} // Reset anche i repeating groups
      };
    }
    
    case "SET_NAVIGATING": {
      return {
        ...state,
        isNavigating: action.isNavigating
      };
    }
    
    case "ADD_NAVIGATION_HISTORY": {
      // Filtriamo la cronologia per rimuovere eventuali duplicati
      const filteredHistory = state.navigationHistory.filter(item => 
        !(item.from_question_id === action.history.from_question_id && 
          item.to_question_id === action.history.to_question_id)
      );
      
      return {
        ...state,
        navigationHistory: [...filteredHistory, action.history]
      };
    }
    
    case "START_LOOP_ENTRY": {
      return {
        ...state,
        currentLoop: {
          loop_id: action.loopId,
          tempResponses: {}
        }
      };
    }
    
    case "EDIT_LOOP_ENTRY": {
      const loopId = action.loopId;
      const entryIndex = action.entryIndex;
      
      // Se il gruppo di ripetizione non esiste o l'indice non è valido, non fare nulla
      if (!state.repeatingGroups[loopId] || 
          !state.repeatingGroups[loopId].entries || 
          entryIndex >= state.repeatingGroups[loopId].entries.length) {
        return state;
      }
      
      // Ottieni l'elemento da modificare
      const entry = state.repeatingGroups[loopId].entries[entryIndex];
      
      return {
        ...state,
        currentLoop: {
          loop_id: loopId,
          tempResponses: { ...entry.responses }
        },
        repeatingGroups: {
          ...state.repeatingGroups,
          [loopId]: {
            ...state.repeatingGroups[loopId],
            currentEditIndex: entryIndex
          }
        }
      };
    }
    
    case "DELETE_LOOP_ENTRY": {
      const loopId = action.loopId;
      const entryIndex = action.entryIndex;
      
      // Se il gruppo di ripetizione non esiste o l'indice non è valido, non fare nulla
      if (!state.repeatingGroups[loopId] || 
          !state.repeatingGroups[loopId].entries || 
          entryIndex >= state.repeatingGroups[loopId].entries.length) {
        return state;
      }
      
      // Crea una nuova array di entries senza l'elemento rimosso
      const newEntries = [
        ...state.repeatingGroups[loopId].entries.slice(0, entryIndex),
        ...state.repeatingGroups[loopId].entries.slice(entryIndex + 1)
      ];
      
      return {
        ...state,
        repeatingGroups: {
          ...state.repeatingGroups,
          [loopId]: {
            ...state.repeatingGroups[loopId],
            entries: newEntries
          }
        }
      };
    }
    
    case "SAVE_LOOP_ENTRY": {
      // Se non siamo in un loop, non fare nulla
      if (!state.currentLoop) {
        return state;
      }
      
      const loopId = state.currentLoop.loop_id;
      const tempResponses = state.currentLoop.tempResponses;
      const currentEditIndex = state.repeatingGroups[loopId]?.currentEditIndex;
      
      // Inizializza il gruppo repeating se non esiste
      const repeatingGroup = state.repeatingGroups[loopId] || { entries: [] };
      let newEntries: RepeatingGroupEntry[];
      
      if (currentEditIndex !== undefined && currentEditIndex !== null) {
        // Modifica un elemento esistente
        newEntries = [...repeatingGroup.entries];
        newEntries[currentEditIndex] = {
          ...newEntries[currentEditIndex],
          responses: { ...tempResponses }
        };
      } else {
        // Aggiungi un nuovo elemento
        newEntries = [
          ...repeatingGroup.entries,
          {
            id: uuidv4(),
            responses: { ...tempResponses }
          }
        ];
      }
      
      return {
        ...state,
        currentLoop: null, // Esci dalla modalità loop
        repeatingGroups: {
          ...state.repeatingGroups,
          [loopId]: {
            entries: newEntries,
            currentEditIndex: null // Resetta l'indice di modifica
          }
        }
      };
    }
    
    case "CANCEL_LOOP_ENTRY": {
      // Se non siamo in un loop, non fare nulla
      if (!state.currentLoop) {
        return state;
      }
      
      const loopId = state.currentLoop.loop_id;
      
      return {
        ...state,
        currentLoop: null, // Esci dalla modalità loop
        repeatingGroups: {
          ...state.repeatingGroups,
          [loopId]: {
            ...state.repeatingGroups[loopId],
            currentEditIndex: null // Resetta l'indice di modifica
          }
        }
      };
    }
    
    default:
      return state;
  }
}

export const FormProvider: React.FC<{ children: ReactNode; blocks: Block[] }> = ({ children, blocks }) => {
  const navigate = useNavigate();
  const params = useParams<{ blockType?: string; blockId?: string; questionId?: string }>();
  const location = useLocation();
  
  // Ordina i blocchi per priorità
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
  
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    activeBlocks: sortedBlocks.filter(b => b.default_active).map(b => b.block_id),
    repeatingGroups: {}
  });

  // Inizializza o aggiorna i blocchi attivi dal JSON
  useEffect(() => {
    // Prima attiva tutti i blocchi che dovrebbero essere attivi per default
    const defaultActiveBlockIds = blocks
      .filter(b => b.default_active)
      .map(b => b.block_id);
    
    // Aggiungi tutti i blocchi default_active che non sono già attivi
    defaultActiveBlockIds.forEach(blockId => {
      if (!state.activeBlocks.includes(blockId)) {
        dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
      }
    });
  }, [blocks]);

  // Funzione per reimpostare il form
  const resetForm = useCallback(() => {
    // Rimuovi i dati salvati dal localStorage
    if (params.blockType) {
      localStorage.removeItem(`form-state-${params.blockType}`);
    }
    
    // Reimposta lo stato del form
    dispatch({ type: "RESET_FORM" });
    
    // Torna alla prima domanda (aggiornato per utilizzare introduzione/soggetto_acquisto)
    navigate("/simulazione/pensando/introduzione/soggetto_acquisto", { replace: true });
  }, [params.blockType, navigate]);

  // Sincronizza lo stato del form con i parametri URL quando l'URL cambia
  useEffect(() => {
    const { blockId, questionId } = params;
    
    if (blockId && questionId) {
      // Se entrambi sono specificati nell'URL, aggiorna lo stato del form
      dispatch({ 
        type: "GO_TO_QUESTION", 
        block_id: blockId, 
        question_id: questionId 
      });
      
      if (!state.activeBlocks.includes(blockId)) {
        dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
      }
    } else if (blockId) {
      // Se solo blockId è specificato, trova la prima domanda nel blocco
      const block = blocks.find(b => b.block_id === blockId);
      if (block && block.questions.length > 0) {
        const firstQuestionId = block.questions[0].question_id;
        dispatch({ 
          type: "GO_TO_QUESTION", 
          block_id: blockId, 
          question_id: firstQuestionId 
        });
        
        if (!state.activeBlocks.includes(blockId)) {
          dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
        }
        
        // Aggiorna l'URL per includere anche l'ID della domanda
        navigate(`/simulazione/${params.blockType}/${blockId}/${firstQuestionId}`, { replace: true });
      }
    } else if (params.blockType) {
      // Se solo il tipo è specificato (pensando, cercando, ecc.), trova il blocco iniziale
      const entryBlock = blocks.find(b => b.block_id === "introduzione");
      if (entryBlock && entryBlock.questions.length > 0) {
        dispatch({ 
          type: "GO_TO_QUESTION", 
          block_id: "introduzione", 
          question_id: "soggetto_acquisto" 
        });
      }
    }
    
    // Carica lo stato salvato dal localStorage, se disponibile
    const savedState = localStorage.getItem(`form-state-${params.blockType}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Converti answeredQuestions da array a Set
        if (Array.isArray(parsedState.answeredQuestions)) {
          parsedState.answeredQuestions = new Set(parsedState.answeredQuestions);
        } else {
          parsedState.answeredQuestions = new Set();
        }
        
        // Applica lo stato salvato
        dispatch({ type: "SET_FORM_STATE", state: parsedState });
        
        // Assicurati che tutti i blocchi necessari siano attivati in base alle risposte
        if (parsedState.activeBlocks) {
          // Attiva tutti i blocchi che erano attivi nel savedState
          parsedState.activeBlocks.forEach((blockId: string) => {
            if (!state.activeBlocks.includes(blockId)) {
              dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
            }
          });
        }
        
        // Anche se non ci sono blocchi attivi salvati, verifica le risposte
        if (parsedState.responses) {
          activateRequiredBlocksBasedOnResponses(parsedState.responses);
        }
      } catch (e) {
        console.error("Errore nel caricamento dello stato salvato:", e);
      }
    }
  }, [params.blockId, params.questionId, params.blockType, blocks, navigate]);

  // Salva lo stato in localStorage quando cambia
  useEffect(() => {
    if (params.blockType) {
      // Converti Set a array per JSON serialization
      const stateToSave = {
        ...state,
        answeredQuestions: Array.from(state.answeredQuestions),
        // Assicurati che repeatingGroups sia sempre incluso nel salvataggio
        repeatingGroups: state.repeatingGroups
      };
      
      console.log("[FormContext] Saving state to localStorage:", stateToSave);
      localStorage.setItem(`form-state-${params.blockType}`, JSON.stringify(stateToSave));
    }
  }, [state, params.blockType]);

  // Attiva i blocchi necessari in base alle risposte salvate
  const activateRequiredBlocksBasedOnResponses = (responses: FormResponse) => {
    // Itera su tutte le domande per trovare opzioni che richiedono l'attivazione di blocchi
    for (const questionId of Object.keys(responses)) {
      for (const blockObj of blocks) {
        const question = blockObj.questions.find(q => q.question_id === questionId);
        if (!question) continue;

        for (const [placeholderKey, value] of Object.entries(responses[questionId])) {
          if (question.placeholders[placeholderKey].type === "select") {
            const options = (question.placeholders[placeholderKey] as any).options;
            if (!Array.isArray(value)) { // Per selezione singola
              const selectedOption = options.find((opt: any) => opt.id === value);
              if (selectedOption?.add_block && !state.activeBlocks.includes(selectedOption.add_block)) {
                dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: selectedOption.add_block });
              }
            } else { // Per selezione multipla
              for (const optionId of value) {
                const selectedOption = options.find((opt: any) => opt.id === optionId);
                if (selectedOption?.add_block && !state.activeBlocks.includes(selectedOption.add_block)) {
                  dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: selectedOption.add_block });
                }
              }
            }
          }
        }
      }
    }
  };

  const goToQuestion = useCallback((block_id: string, question_id: string, replace = false) => {
    const previousBlockId = state.activeQuestion.block_id;
    const previousQuestionId = state.activeQuestion.question_id;

    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
    
    // Aggiungi la navigazione alla cronologia
    dispatch({ 
      type: "ADD_NAVIGATION_HISTORY", 
      history: {
        from_block_id: previousBlockId,
        from_question_id: previousQuestionId,
        to_block_id: block_id,
        to_question_id: question_id,
        timestamp: Date.now()
      }
    });
    
    // Set navigating state when navigating
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    // Aggiorna l'URL per riflettere la nuova domanda
    const blockType = params.blockType || "funnel";
    const newPath = `/simulazione/${blockType}/${block_id}/${question_id}`;
    
    if (replace) {
      navigate(newPath, { replace: true });
    } else {
      navigate(newPath);
    }
    
    // Reset navigating state after a short delay
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [params.blockType, navigate, state.activeQuestion]);

  const setResponse = useCallback((question_id: string, placeholder_key: string, value: string | string[]) => {
    dispatch({ type: "SET_RESPONSE", question_id, placeholder_key, value });
    dispatch({ type: "MARK_QUESTION_ANSWERED", question_id });
  }, []);

  const getResponse = useCallback((question_id: string, placeholder_key: string) => {
    // Se siamo in un loop, prendi la risposta dal currentLoop
    if (state.currentLoop?.tempResponses && state.currentLoop.tempResponses[question_id]) {
      return state.currentLoop.tempResponses[question_id][placeholder_key];
    }
    
    // Altrimenti, prendi dalle risposte normali
    if (!state.responses[question_id]) return undefined;
    return state.responses[question_id][placeholder_key];
  }, [state.responses, state.currentLoop]);

  const addActiveBlock = useCallback((block_id: string) => {
    dispatch({ type: "ADD_ACTIVE_BLOCK", block_id });
  }, []);

  const isQuestionAnswered = useCallback((question_id: string) => {
    return state.answeredQuestions.has(question_id);
  }, [state.answeredQuestions]);

  const findQuestionById = useCallback((questionId: string): { block: Block; question: Question } | null => {
    for (const block of sortedBlocks) {
      for (const question of block.questions) {
        if (question.question_id === questionId) {
          return { block, question };
        }
      }
    }
    return null;
  }, [sortedBlocks]);

  // Nuove funzioni per gestire i loop
  const startLoopEntry = useCallback((loopId: string) => {
    dispatch({ type: "START_LOOP_ENTRY", loopId });
  }, []);

  const editLoopEntry = useCallback((loopId: string, entryIndex: number) => {
    dispatch({ type: "EDIT_LOOP_ENTRY", loopId, entryIndex });
  }, []);

  const deleteLoopEntry = useCallback((loopId: string, entryIndex: number) => {
    dispatch({ type: "DELETE_LOOP_ENTRY", loopId, entryIndex });
  }, []);

  const saveCurrentLoopEntry = useCallback(() => {
    dispatch({ type: "SAVE_LOOP_ENTRY" });
  }, []);

  const cancelCurrentLoopEntry = useCallback(() => {
    dispatch({ type: "CANCEL_LOOP_ENTRY" });
  }, []);

  const isInLoop = useCallback((questionId: string): boolean => {
    // Trova la domanda
    const foundQuestion = findQuestionById(questionId)?.question;
    
    // Verifica se questa domanda fa parte di un loop
    return !!foundQuestion?.loop;
  }, [findQuestionById]);

  const getLoopIdForQuestion = useCallback((questionId: string): string | undefined => {
    const foundQuestion = findQuestionById(questionId)?.question;
    return foundQuestion?.loop;
  }, [findQuestionById]);

  const findLoopManagerQuestion = useCallback((loopId: string): Question | undefined => {
    for (const block of sortedBlocks) {
      for (const question of block.questions) {
        if (question.loop_manager && question.loop_id === loopId) {
          return question;
        }
      }
    }
    return undefined;
  }, [sortedBlocks]);

  const navigateToNextQuestion = useCallback((currentQuestionId: string, leadsTo: string) => {
    // Salva la domanda corrente prima di navigare
    const currentBlockId = state.activeQuestion.block_id;
    
    // Set navigating state when navigating
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    // Debug
    console.log(`[navigateToNextQuestion] From question ${currentQuestionId} to ${leadsTo}`);
    
    // Trova la domanda corrente
    const currentQuestion = findQuestionById(currentQuestionId)?.question;
    
    // Debug
    console.log("[navigateToNextQuestion] Current Question:", currentQuestion);
    console.log("[navigateToNextQuestion] Current Loop State:", state.currentLoop);
    
    // Verifica se la domanda corrente fa parte di un loop
    const currentLoopId = currentQuestion?.loop;
    let targetQuestion: Question | undefined;
    
    // Se c'è un currentLoopId, allora siamo in un loop
    if (currentLoopId) {
      console.log(`[navigateToNextQuestion] Current question is part of loop: ${currentLoopId}`);
    }
    
    // Trova la domanda di destinazione se non è "next_block"
    if (leadsTo !== "next_block") {
      targetQuestion = findQuestionById(leadsTo)?.question;
      console.log("[navigateToNextQuestion] Target question:", targetQuestion);
    }
    
    // Controlla se stiamo uscendo da un loop
    if (currentLoopId && (!targetQuestion || !targetQuestion.loop || targetQuestion.loop !== currentLoopId)) {
      console.log("[navigateToNextQuestion] Exiting loop:", currentLoopId);
      console.log("[navigateToNextQuestion] Target has loop:", targetQuestion?.loop);
      
      // Verifica se stiamo tornando al loop manager
      const loopManagerQuestion = findLoopManagerQuestion(currentLoopId);
      console.log("[navigateToNextQuestion] Loop manager question:", loopManagerQuestion);
      
      // Se la destinazione è il loop manager, dobbiamo salvare l'entry corrente
      if (loopManagerQuestion && loopManagerQuestion.question_id === leadsTo) {
        console.log("[navigateToNextQuestion] Returning to loop manager, saving entry");
        saveCurrentLoopEntry();
      } 
      // Altrimenti verifica se è l'ultima domanda nel loop prima di uscire
      else if (state.currentLoop) {
        console.log("[navigateToNextQuestion] Potentially exiting loop from last question, saving entry");
        saveCurrentLoopEntry();
      }
    }
    
    // Controlla se la domanda corrente è un loop manager e stiamo aggiungendo un nuovo elemento
    if (currentQuestion?.loop_manager) {
      if (leadsTo === currentQuestion.add_leads_to) {
        console.log("[navigateToNextQuestion] Starting new loop entry from loop manager");
        // La funzione startNewLoopEntry è già stata chiamata dal componente LoopManager
        // Non serve richiamarla qui
      } else if (leadsTo === currentQuestion.next_leads_to || leadsTo === "next_block") {
        console.log("[navigateToNextQuestion] Continuing to next block from loop manager");
        // Continuiamo al prossimo blocco/domanda normalmente
      }
    }
    
    // Normale logica di navigazione...
    if (leadsTo === "next_block") {
      // Trova il blocco corrente
      let currentBlock = null;
      let currentBlockIndex = -1;
      
      // Cerca quale blocco contiene la domanda corrente
      for (let i = 0; i < sortedBlocks.length; i++) { // Usa blocchi ordinati
        const block = sortedBlocks[i];
        const hasQuestion = block.questions.some(q => q.question_id === currentQuestionId);
        if (hasQuestion) {
          currentBlockIndex = i;
          currentBlock = block;
          break;
        }
      }

      if (currentBlockIndex !== -1 && currentBlock) {
        console.log(`Navigating from block ${currentBlock.block_id} (index ${currentBlockIndex}) to next active block`);
        console.log(`Active blocks: ${state.activeBlocks.join(', ')}`);
        
        // Trova il prossimo blocco attivo
        let foundNextActiveBlock = false;
        
        // Ordina i blocchi attivi per priorità
        const activeBlocksWithPriority = state.activeBlocks
          .map(blockId => sortedBlocks.find(b => b.block_id === blockId))
          .filter(Boolean)
          .sort((a, b) => a!.priority - b!.priority);
        
        // Trova la posizione del blocco corrente nella lista di blocchi attivi ordinati per priorità
        const currentActiveIndex = activeBlocksWithPriority.findIndex(b => b!.block_id === currentBlock.block_id);
        
        // Cerca il prossimo blocco attivo con priorità maggiore
        if (currentActiveIndex !== -1) {
          for (let i = currentActiveIndex + 1; i < activeBlocksWithPriority.length; i++) {
            const nextBlock = activeBlocksWithPriority[i];
            if (nextBlock && nextBlock.questions.length > 0) {
              console.log(`Found next active block: ${nextBlock.block_id}`);
              foundNextActiveBlock = true;
              goToQuestion(nextBlock.block_id, nextBlock.questions[0].question_id);
              break;
            }
          }
        }
        
        // Se non è stato trovato un blocco attivo successivo, cerca se c'è qualche domanda successiva nello stesso blocco
        if (!foundNextActiveBlock) {
          console.log(`No next active block found after ${currentBlock.block_id}`);
          
          // Trova la posizione della domanda corrente nel blocco
          const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === currentQuestionId);
          
          // Cerca la prossima domanda nel blocco corrente (senza distinguere inline o non)
          if (currentQuestionIndex < currentBlock.questions.length - 1) {
            const nextQuestion = currentBlock.questions[currentQuestionIndex + 1];
            console.log(`No next active block, but found next question in current block: ${nextQuestion.question_id}`);
            goToQuestion(currentBlock.block_id, nextQuestion.question_id);
            return;
          }
          
          // Se arriviamo qui, siamo all'ultima domanda dell'ultimo blocco attivo
          console.log("Reached end of active blocks");
        }
      }
    } else {
      // Naviga a una domanda specifica
      const found = findQuestionById(leadsTo);
      if (found) {
        console.log(`Navigating to specific question: ${found.question.question_id} in block ${found.block.block_id}`);
        
        // Aggiungi la navigazione alla cronologia
        dispatch({ 
          type: "ADD_NAVIGATION_HISTORY", 
          history: {
            from_block_id: currentBlockId,
            from_question_id: currentQuestionId,
            to_block_id: found.block.block_id,
            to_question_id: found.question.question_id,
            timestamp: Date.now()
          }
        });
        
        goToQuestion(found.block.block_id, found.question.question_id);
      } else {
        console.log(`Question ID ${leadsTo} not found`);
      }
    }
    
    // Reset navigating state in case navigation fails
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [
    sortedBlocks, 
    state.activeBlocks, 
    goToQuestion, 
    findQuestionById, 
    state.activeQuestion.block_id, 
    findLoopManagerQuestion,
    saveCurrentLoopEntry,
    state.currentLoop
  ]);

  // Calcola il progresso complessivo del form
  const getProgress = useCallback(() => {
    // Conta tutte le domande nei blocchi attivi (senza distinzione per inline)
    let totalQuestions = 0;
    let answeredCount = 0;
    
    for (const blockId of state.activeBlocks) {
      const block = blocks.find(b => b.block_id === blockId);
      if (block) {
        // Conta tutte le domande per il totale
        totalQuestions += block.questions.length;
        
        // Conta le domande già risposte in questo blocco
        block.questions.forEach(q => {
          if (state.answeredQuestions.has(q.question_id)) {
            answeredCount++;
          }
        });
      }
    }
    
    return totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  }, [state.activeBlocks, state.answeredQuestions, blocks]);

  // Nuova funzione per ottenere la cronologia di navigazione per una domanda specifica
  const getNavigationHistoryFor = useCallback((questionId: string): NavigationHistory | undefined => {
    // Ordina la cronologia dal più recente al meno recente
    const sortedHistory = [...state.navigationHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    // Trova la voce più recente che ha navigato a questa domanda
    return sortedHistory.find(item => item.to_question_id === questionId);
  }, [state.navigationHistory]);

  return (
    <FormContext.Provider
      value={{
        state,
        blocks: sortedBlocks, // Restituisci i blocchi ordinati per priorità
        goToQuestion,
        setResponse,
        getResponse,
        addActiveBlock,
        isQuestionAnswered,
        navigateToNextQuestion,
        getProgress,
        resetForm,
        getNavigationHistoryFor,
        startLoopEntry,
        editLoopEntry,
        deleteLoopEntry,
        saveCurrentLoopEntry,
        cancelCurrentLoopEntry
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
