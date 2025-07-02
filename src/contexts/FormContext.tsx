import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef } from 'react';
import { FormState, Block, FormResponse, NavigationHistory, BlockActivationSource, PendingRemoval } from '@/types/form';
import { formBlocks } from '@/data/formBlocks';

// Action types
type FormAction = 
  | { type: 'SET_RESPONSE'; question_id: string; placeholder_key: string; value: string | string[] }
  | { type: 'LOAD_RESPONSES'; responses: FormResponse }
  | { type: 'SET_ACTIVE_BLOCKS'; blocks: string[] }
  | { type: 'ADD_ACTIVE_BLOCK'; block_id: string; source?: BlockActivationSource }
  | { type: 'REMOVE_ACTIVE_BLOCK'; block_id: string }
  | { type: 'SET_ACTIVE_QUESTION'; block_id: string; question_id: string; skipHistory?: boolean }
  | { type: 'MARK_QUESTION_ANSWERED'; question_id: string }
  | { type: 'UNMARK_QUESTION_ANSWERED'; question_id: string }
  | { type: 'SET_NAVIGATION_STATE'; isNavigating: boolean }
  | { type: 'ADD_DYNAMIC_BLOCK'; block: Block; source?: BlockActivationSource }
  | { type: 'REMOVE_DYNAMIC_BLOCK'; block_id: string }
  | { type: 'MARK_BLOCK_COMPLETED'; block_id: string }
  | { type: 'UNMARK_BLOCK_COMPLETED'; block_id: string }
  | { type: 'ADD_PENDING_REMOVAL'; questionId: string; blockId: string }
  | { type: 'REMOVE_PENDING_REMOVAL'; questionId: string }
  | { type: 'PROCESS_PENDING_REMOVALS' }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_FORM_STATE'; state: Partial<FormState> };

// Reducer function with optimized state updates
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_RESPONSE':
      // Optimize response setting with immutable updates
      const newResponses = {
        ...state.responses,
        [action.question_id]: {
          ...state.responses[action.question_id],
          [action.placeholder_key]: action.value
        }
      };
      
      return {
        ...state,
        responses: newResponses
      };

    case 'LOAD_RESPONSES':
      return {
        ...state,
        responses: action.responses
      };

    case 'SET_ACTIVE_BLOCKS':
      if (JSON.stringify(state.activeBlocks.sort()) === JSON.stringify(action.blocks.sort())) {
        return state; // No change needed
      }
      return {
        ...state,
        activeBlocks: action.blocks
      };

    case 'ADD_ACTIVE_BLOCK':
      if (state.activeBlocks.includes(action.block_id)) {
        return state; // Block already active
      }
      
      const newBlockActivations = action.source ? {
        ...state.blockActivations,
        [action.block_id]: [...(state.blockActivations[action.block_id] || []), action.source]
      } : state.blockActivations;
      
      return {
        ...state,
        activeBlocks: [...state.activeBlocks, action.block_id],
        blockActivations: newBlockActivations
      };

    case 'REMOVE_ACTIVE_BLOCK':
      return {
        ...state,
        activeBlocks: state.activeBlocks.filter(id => id !== action.block_id),
        blockActivations: {
          ...state.blockActivations,
          [action.block_id]: []
        }
      };

    case 'SET_ACTIVE_QUESTION':
      // Add navigation history if not skipping
      const newHistory = action.skipHistory ? state.navigationHistory : [
        ...state.navigationHistory,
        {
          from_block_id: state.activeQuestion.block_id,
          from_question_id: state.activeQuestion.question_id,
          to_block_id: action.block_id,
          to_question_id: action.question_id,
          timestamp: Date.now()
        }
      ];

      return {
        ...state,
        activeQuestion: {
          block_id: action.block_id,
          question_id: action.question_id
        },
        navigationHistory: newHistory,
        isNavigating: false
      };

    case 'MARK_QUESTION_ANSWERED':
      if (state.answeredQuestions.has(action.question_id)) {
        return state; // Already marked
      }
      return {
        ...state,
        answeredQuestions: new Set([...state.answeredQuestions, action.question_id])
      };

    case 'UNMARK_QUESTION_ANSWERED':
      if (!state.answeredQuestions.has(action.question_id)) {
        return state; // Not marked
      }
      const newAnsweredQuestions = new Set(state.answeredQuestions);
      newAnsweredQuestions.delete(action.question_id);
      return {
        ...state,
        answeredQuestions: newAnsweredQuestions
      };

    case 'SET_NAVIGATION_STATE':
      if (state.isNavigating === action.isNavigating) {
        return state; // No change
      }
      return {
        ...state,
        isNavigating: action.isNavigating
      };

    case 'ADD_DYNAMIC_BLOCK':
      // Check if block already exists
      if (state.dynamicBlocks.some(block => block.block_id === action.block.block_id)) {
        return state;
      }
      
      const newDynamicBlockActivations = action.source ? {
        ...state.blockActivations,
        [action.block.block_id]: [...(state.blockActivations[action.block.block_id] || []), action.source]
      } : state.blockActivations;
      
      return {
        ...state,
        dynamicBlocks: [...state.dynamicBlocks, action.block],
        blockActivations: newDynamicBlockActivations
      };

    case 'REMOVE_DYNAMIC_BLOCK':
      return {
        ...state,
        dynamicBlocks: state.dynamicBlocks.filter(block => block.block_id !== action.block_id),
        blockActivations: {
          ...state.blockActivations,
          [action.block_id]: []
        }
      };

    case 'MARK_BLOCK_COMPLETED':
      if (state.completedBlocks.includes(action.block_id)) {
        return state; // Already completed
      }
      return {
        ...state,
        completedBlocks: [...state.completedBlocks, action.block_id]
      };

    case 'UNMARK_BLOCK_COMPLETED':
      return {
        ...state,
        completedBlocks: state.completedBlocks.filter(id => id !== action.block_id)
      };

    case 'ADD_PENDING_REMOVAL':
      return {
        ...state,
        pendingRemovals: [
          ...state.pendingRemovals,
          {
            questionId: action.questionId,
            blockId: action.blockId,
            timestamp: Date.now()
          }
        ]
      };

    case 'REMOVE_PENDING_REMOVAL':
      return {
        ...state,
        pendingRemovals: state.pendingRemovals.filter(removal => removal.questionId !== action.questionId)
      };

    case 'PROCESS_PENDING_REMOVALS':
      const currentTime = Date.now();
      const validRemovals = state.pendingRemovals.filter(removal => 
        currentTime - removal.timestamp < 5000 // 5 second timeout
      );
      
      return {
        ...state,
        pendingRemovals: validRemovals
      };

    case 'RESET_FORM':
      return {
        activeBlocks: [],
        activeQuestion: { block_id: '', question_id: '' },
        responses: {},
        answeredQuestions: new Set(),
        isNavigating: false,
        navigationHistory: [],
        dynamicBlocks: [],
        blockActivations: {},
        completedBlocks: [],
        pendingRemovals: [],
        formSlug: state.formSlug
      };

    case 'LOAD_FORM_STATE':
      return {
        ...state,
        ...action.state,
        answeredQuestions: action.state.answeredQuestions ? 
          new Set(action.state.answeredQuestions) : state.answeredQuestions
      };

    default:
      return state;
  }
}

// Context type
interface FormContextType {
  state: FormState;
  getResponse: (question_id: string, placeholder_key: string) => string | string[] | undefined;
  setResponse: (question_id: string, placeholder_key: string, value: string | string[]) => void;
  loadResponses: (responses: FormResponse) => void;
  setActiveBlocks: (blocks: string[]) => void;
  addActiveBlock: (block_id: string, source?: BlockActivationSource) => void;
  removeActiveBlock: (block_id: string) => void;
  setActiveQuestion: (block_id: string, question_id: string, skipHistory?: boolean) => void;
  markQuestionAnswered: (question_id: string) => void;
  unmarkQuestionAnswered: (question_id: string) => void;
  setNavigationState: (isNavigating: boolean) => void;
  addDynamicBlock: (block: Block, source?: BlockActivationSource) => void;
  removeDynamicBlock: (block_id: string) => void;
  markBlockCompleted: (block_id: string) => void;
  unmarkBlockCompleted: (block_id: string) => void;
  addPendingRemoval: (questionId: string, blockId: string) => void;
  removePendingRemoval: (questionId: string) => void;
  processPendingRemovals: () => void;
  resetForm: () => void;
  loadFormState: (formState: Partial<FormState>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider component
interface FormProviderProps {
  children: React.ReactNode;
  initialState?: Partial<FormState>;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children, initialState }) => {
  // Initialize state with default values
  const defaultState: FormState = {
    activeBlocks: [],
    activeQuestion: { block_id: '', question_id: '' },
    responses: {},
    answeredQuestions: new Set(),
    isNavigating: false,
    navigationHistory: [],
    dynamicBlocks: [],
    blockActivations: {},
    completedBlocks: [],
    pendingRemovals: [],
    formSlug: initialState?.formSlug || ''
  };

  const [state, dispatch] = useReducer(formReducer, {
    ...defaultState,
    ...initialState,
    answeredQuestions: initialState?.answeredQuestions ? 
      new Set(initialState.answeredQuestions) : new Set()
  });

  // Use refs to prevent recursive updates
  const isUpdatingRef = useRef(false);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<FormAction[]>([]);

  // Batch dispatch function to prevent cascading updates
  const batchDispatch = useCallback((action: FormAction) => {
    if (isUpdatingRef.current) {
      // Queue the action if we're already updating
      pendingUpdatesRef.current.push(action);
      return;
    }

    pendingUpdatesRef.current.push(action);
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    batchTimeoutRef.current = setTimeout(() => {
      if (pendingUpdatesRef.current.length === 0) return;
      
      isUpdatingRef.current = true;
      const actionsToProcess = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      
      try {
        // Process all queued actions
        actionsToProcess.forEach(action => {
          dispatch(action);
        });
      } finally {
        isUpdatingRef.current = false;
        batchTimeoutRef.current = null;
      }
    }, 0);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    getResponse: useCallback((question_id: string, placeholder_key: string): string | string[] | undefined => {
      return state.responses[question_id]?.[placeholder_key];
    }, [state.responses]),
    setResponse: useCallback((question_id: string, placeholder_key: string, value: string | string[]) => {
      // Prevent recursive calls during form operations
      if (isUpdatingRef.current) {
        console.warn('Preventing recursive setResponse call during batch update');
        return;
      }

      // Check if value actually changed to prevent unnecessary updates
      const currentValue = state.responses[question_id]?.[placeholder_key];
      if (currentValue === value) {
        return; // No change needed
      }

      console.log('📝 Setting response:', { question_id, placeholder_key, value });
      
      // Batch the response update with question marking
      batchDispatch({ type: 'SET_RESPONSE', question_id, placeholder_key, value });
      batchDispatch({ type: 'MARK_QUESTION_ANSWERED', question_id });
    }, [state.responses, batchDispatch]),
    loadResponses: useCallback((responses: FormResponse) => {
      dispatch({ type: 'LOAD_RESPONSES', responses });
    }, []),
    setActiveBlocks: useCallback((blocks: string[]) => {
      dispatch({ type: 'SET_ACTIVE_BLOCKS', blocks });
    }, []),
    addActiveBlock: useCallback((block_id: string, source?: BlockActivationSource) => {
      console.log('🔄 Adding active block:', block_id, source ? 'with source' : 'without source');
      batchDispatch({ type: 'ADD_ACTIVE_BLOCK', block_id, source });
    }, [batchDispatch]),
    removeActiveBlock: useCallback((block_id: string) => {
      dispatch({ type: 'REMOVE_ACTIVE_BLOCK', block_id });
    }, []),
    setActiveQuestion: useCallback((block_id: string, question_id: string, skipHistory = false) => {
      dispatch({ type: 'SET_ACTIVE_QUESTION', block_id, question_id, skipHistory });
    }, []),
    markQuestionAnswered: useCallback((question_id: string) => {
      batchDispatch({ type: 'MARK_QUESTION_ANSWERED', question_id });
    }, [batchDispatch]),
    unmarkQuestionAnswered: useCallback((question_id: string) => {
      dispatch({ type: 'UNMARK_QUESTION_ANSWERED', question_id });
    }, []),
    setNavigationState: useCallback((isNavigating: boolean) => {
      dispatch({ type: 'SET_NAVIGATION_STATE', isNavigating });
    }, []),
    addDynamicBlock: useCallback((block: Block, source?: BlockActivationSource) => {
      console.log('🔄 Adding dynamic block:', block.block_id, source ? 'with source' : 'without source');
      batchDispatch({ type: 'ADD_DYNAMIC_BLOCK', block, source });
    }, [batchDispatch]),
    removeDynamicBlock: useCallback((block_id: string) => {
      dispatch({ type: 'REMOVE_DYNAMIC_BLOCK', block_id });
    }, []),
    markBlockCompleted: useCallback((block_id: string) => {
      dispatch({ type: 'MARK_BLOCK_COMPLETED', block_id });
    }, []),
    unmarkBlockCompleted: useCallback((block_id: string) => {
      dispatch({ type: 'UNMARK_BLOCK_COMPLETED', block_id });
    }, []),
    addPendingRemoval: useCallback((questionId: string, blockId: string) => {
      dispatch({ type: 'ADD_PENDING_REMOVAL', questionId, blockId });
    }, []),
    removePendingRemoval: useCallback((questionId: string) => {
      dispatch({ type: 'REMOVE_PENDING_REMOVAL', questionId });
    }, []),
    processPendingRemovals: useCallback(() => {
      dispatch({ type: 'PROCESS_PENDING_REMOVALS' });
    }, []),
    resetForm: useCallback(() => {
      dispatch({ type: 'RESET_FORM' });
    }, []),
    loadFormState: useCallback((formState: Partial<FormState>) => {
      dispatch({ type: 'LOAD_FORM_STATE', state: formState });
    }, [])
  }), [
    state,
    getResponse,
    setResponse,
    loadResponses,
    setActiveBlocks,
    addActiveBlock,
    removeActiveBlock,
    setActiveQuestion,
    markQuestionAnswered,
    unmarkQuestionAnswered,
    setNavigationState,
    addDynamicBlock,
    removeDynamicBlock,
    markBlockCompleted,
    unmarkBlockCompleted,
    addPendingRemoval,
    removePendingRemoval,
    processPendingRemovals,
    resetForm,
    loadFormState
  ]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Hook to use the form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
