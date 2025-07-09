import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block, Question, FormResponse, FormState, FormAction } from '@/types/form';
import { 
  findNextQuestion, 
  findPreviousQuestion, 
  getActiveBlocks, 
  isFormComplete,
  processPlaceholder
} from '@/utils/formUtils';
import { validateBlockFlow } from '@/utils/blockValidation';
import { trackQuestionAnswered, trackBlockCompleted } from '@/utils/analytics';
import { toast } from 'sonner';

interface FormContextType {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  currentQuestion: Question | null;
  currentBlock: Block | null;
  goToNext: () => void;
  goToPrevious: () => void;
  goToQuestion: (blockId: string, questionId: string) => void;
  answerQuestion: (questionId: string, value: any) => void;
  completeForm: () => void;
  formSlug?: string;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_ACTIVE_QUESTION':
      return {
        ...state,
        activeQuestion: action.payload
      };

    case 'ANSWER_QUESTION': {
      const { questionId, value, blockId } = action.payload;
      const newResponses = { ...state.responses, [questionId]: value };
      
      // Add to answered questions set
      const newAnsweredQuestions = new Set(state.answeredQuestions);
      newAnsweredQuestions.add(questionId);
      
      return {
        ...state,
        responses: newResponses,
        answeredQuestions: newAnsweredQuestions
      };
    }

    case 'SET_ACTIVE_BLOCKS': {
      const { activeBlocks, dynamicBlocks = [] } = action.payload;
      return {
        ...state,
        activeBlocks,
        dynamicBlocks
      };
    }

    case 'COMPLETE_BLOCK': {
      const { blockId } = action.payload;
      const newCompletedBlocks = [...state.completedBlocks];
      if (!newCompletedBlocks.includes(blockId)) {
        newCompletedBlocks.push(blockId);
      }
      return {
        ...state,
        completedBlocks: newCompletedBlocks
      };
    }

    case 'UPDATE_NAVIGATION_HISTORY': {
      const { blockId, questionId } = action.payload;
      const newHistory = [...state.navigationHistory];
      const historyEntry = `${blockId}:${questionId}`;
      
      // Remove if already exists to avoid duplicates
      const existingIndex = newHistory.indexOf(historyEntry);
      if (existingIndex > -1) {
        newHistory.splice(existingIndex, 1);
      }
      
      // Add to end
      newHistory.push(historyEntry);
      
      // Keep only last 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return {
        ...state,
        navigationHistory: newHistory
      };
    }

    case 'RESET_FORM':
      return {
        activeBlocks: [],
        responses: {},
        completedBlocks: [],
        dynamicBlocks: [],
        activeQuestion: { block_id: '', question_id: '' },
        answeredQuestions: new Set(),
        navigationHistory: [],
        blockActivations: {},
        pendingRemovals: []
      };

    default:
      return state;
  }
}

interface FormProviderProps {
  children: ReactNode;
  blocks: Block[];
  formSlug?: string;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children, blocks, formSlug }) => {
  const navigate = useNavigate();
  const { blockId, questionId } = useParams<{ blockId: string; questionId: string }>();
  
  const initialState: FormState = {
    activeBlocks: [],
    responses: {},
    completedBlocks: [],
    dynamicBlocks: [],
    activeQuestion: { block_id: blockId || '', question_id: questionId || '' },
    answeredQuestions: new Set(),
    navigationHistory: [],
    blockActivations: {},
    pendingRemovals: []
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    if (blocks.length === 0) return;

    console.log('FormProvider: Initializing with blocks:', blocks.length);
    console.log('FormProvider: Current URL params - blockId:', blockId, 'questionId:', questionId);
    
    // Get initial active blocks
    const initialActiveBlocks = getActiveBlocks(blocks, {});
    console.log('FormProvider: Initial active blocks:', initialActiveBlocks);
    
    dispatch({
      type: 'SET_ACTIVE_BLOCKS',
      payload: { activeBlocks: initialActiveBlocks }
    });

    // Validate URL parameters
    if (blockId && questionId) {
      const targetBlock = blocks.find(b => b.id === blockId);
      const targetQuestion = targetBlock?.questions.find(q => q.id === questionId);
      
      if (!targetBlock || !targetQuestion) {
        console.warn('FormProvider: Invalid URL parameters, redirecting to first question');
        const firstBlock = blocks.find(b => initialActiveBlocks.includes(b.id));
        if (firstBlock && firstBlock.questions.length > 0) {
          const firstQuestion = firstBlock.questions[0];
          navigate(`/simulazione/${formSlug || 'simulazione-mutuo'}/${firstBlock.id}/${firstQuestion.id}`, { replace: true });
        }
        return;
      }

      // Set the active question from URL
      dispatch({
        type: 'SET_ACTIVE_QUESTION',
        payload: { block_id: blockId, question_id: questionId }
      });
    } else if (initialActiveBlocks.length > 0) {
      // No URL params, go to first question
      const firstBlock = blocks.find(b => initialActiveBlocks.includes(b.id));
      if (firstBlock && firstBlock.questions.length > 0) {
        const firstQuestion = firstBlock.questions[0];
        navigate(`/simulazione/${formSlug || 'simulazione-mutuo'}/${firstBlock.id}/${firstQuestion.id}`, { replace: true });
      }
    }
  }, [blocks, blockId, questionId, navigate, formSlug]);

  useEffect(() => {
    if (blocks.length === 0) return;
    
    const newActiveBlocks = getActiveBlocks(blocks, state.responses, state.dynamicBlocks);
    const currentActiveBlocks = state.activeBlocks;
    
    // Check if active blocks have changed
    if (JSON.stringify(newActiveBlocks.sort()) !== JSON.stringify(currentActiveBlocks.sort())) {
      console.log('FormProvider: Active blocks changed from', currentActiveBlocks, 'to', newActiveBlocks);
      
      dispatch({
        type: 'SET_ACTIVE_BLOCKS',
        payload: { 
          activeBlocks: newActiveBlocks,
          dynamicBlocks: state.dynamicBlocks 
        }
      });
    }
  }, [state.responses, blocks, state.activeBlocks, state.dynamicBlocks]);

  const currentBlock = blocks.find(b => b.id === state.activeQuestion.block_id) || null;
  const currentQuestion = currentBlock?.questions.find(q => q.id === state.activeQuestion.question_id) || null;

  const goToNext = () => {
    if (!currentQuestion || !currentBlock) return;

    // Track question answered
    const response = state.responses[currentQuestion.id];
    if (response !== undefined) {
      trackQuestionAnswered(currentQuestion.id, currentBlock.id, response);
    }

    const allAvailableBlocks = [...blocks, ...state.dynamicBlocks];
    const nextQuestion = findNextQuestion(currentBlock, currentQuestion, state.responses, allAvailableBlocks, state.activeBlocks);
    
    if (nextQuestion) {
      console.log('FormProvider: Moving to next question:', nextQuestion);
      
      // Update navigation history
      dispatch({
        type: 'UPDATE_NAVIGATION_HISTORY',
        payload: { blockId: nextQuestion.blockId, questionId: nextQuestion.questionId }
      });
      
      // Check if current block is complete
      const isBlockComplete = currentBlock.questions.every(q => 
        state.responses[q.id] !== undefined || q.required === false
      );
      
      if (isBlockComplete && !state.completedBlocks.includes(currentBlock.id)) {
        console.log('FormProvider: Block completed:', currentBlock.id);
        dispatch({
          type: 'COMPLETE_BLOCK',
          payload: { blockId: currentBlock.id }
        });
        trackBlockCompleted(currentBlock.id);
      }
      
      navigate(`/simulazione/${formSlug || 'simulazione-mutuo'}/${nextQuestion.blockId}/${nextQuestion.questionId}`);
    } else {
      console.log('FormProvider: No next question found, form might be complete');
      completeForm();
    }
  };

  const goToPrevious = () => {
    if (!currentQuestion || !currentBlock) return;

    const allAvailableBlocks = [...blocks, ...state.dynamicBlocks];
    const prevQuestion = findPreviousQuestion(currentBlock, currentQuestion, state.responses, allAvailableBlocks, state.activeBlocks);
    
    if (prevQuestion) {
      console.log('FormProvider: Moving to previous question:', prevQuestion);
      navigate(`/simulazione/${formSlug || 'simulazione-mutuo'}/${prevQuestion.blockId}/${prevQuestion.questionId}`);
    }
  };

  const goToQuestion = (targetBlockId: string, targetQuestionId: string) => {
    console.log('FormProvider: Navigating to specific question:', targetBlockId, targetQuestionId);
    navigate(`/simulazione/${formSlug || 'simulazione-mutuo'}/${targetBlockId}/${targetQuestionId}`);
  };

  const answerQuestion = (questionId: string, value: any) => {
    console.log('FormProvider: Answering question:', questionId, 'with value:', value);
    
    if (!currentBlock) {
      console.error('FormProvider: No current block when answering question');
      return;
    }

    // Process placeholder if value is a placeholder
    let processedValue = value;
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      processedValue = processPlaceholder(value, state.responses);
      console.log('FormProvider: Processed placeholder:', value, '->', processedValue);
    }

    dispatch({
      type: 'ANSWER_QUESTION',
      payload: { questionId, value: processedValue, blockId: currentBlock.id }
    });
  };

  const completeForm = () => {
    console.log('FormProvider: Form completion initiated');
    
    const allAvailableBlocks = [...blocks, ...state.dynamicBlocks];
    const isComplete = isFormComplete(state.activeBlocks, state.responses, allAvailableBlocks);
    
    if (!isComplete) {
      console.warn('FormProvider: Form not complete, showing warning');
      toast.error("Completa tutte le domande obbligatorie prima di procedere");
      return;
    }

    // Validate block flow before completion
    const flowValidation = validateBlockFlow(allAvailableBlocks, state.responses);
    if (!flowValidation.isValid) {
      console.error('FormProvider: Block flow validation failed:', flowValidation.errors);
      toast.error("Errore nella logica del form. Contatta il supporto.");
      return;
    }

    console.log('FormProvider: Form is complete and valid, navigating to loading page');
    
    // Navigate to loading page with form data
    navigate('/form-loading', {
      state: {
        formData: {
          responses: state.responses,
          activeBlocks: state.activeBlocks,
          completedBlocks: state.completedBlocks,
          dynamicBlocks: state.dynamicBlocks,
          formSlug: formSlug
        }
      }
    });
  };

  const contextValue: FormContextType = {
    state,
    dispatch,
    currentQuestion,
    currentBlock,
    goToNext,
    goToPrevious,
    goToQuestion,
    answerQuestion,
    completeForm,
    formSlug
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
