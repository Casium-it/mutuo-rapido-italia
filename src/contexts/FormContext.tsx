import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from "react";
import { Block, FormState, FormResponse, NavigationHistory, Placeholder, SelectPlaceholder } from "@/types/form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ensureBlockHasPriority } from "@/utils/blockUtils";
import { 
  getPlaceholderLeadsTo, 
  isMultiBlockManagerQuestion, 
  isDynamicBlock, 
  getParentMultiBlockManager 
} from "@/utils/formUtils";

type FormContextType = {
  state: FormState;
  blocks: Block[];
  goToQuestion: (block_id: string, question_id: string, replace?: boolean) => void;
  setResponse: (question_id: string, placeholder_key: string, value: string | string[]) => void;
  getResponse: (question_id: string, placeholder_key: string) => string | string[] | undefined;
  addActiveBlock: (block_id: string) => void;
  removeActiveBlock: (block_id: string) => void;
  isQuestionAnswered: (question_id: string) => boolean;
  navigateToNextQuestion: (currentQuestionId: string, leadsTo: string) => void;
  getProgress: () => number;
  resetForm: () => void;
  getNavigationHistoryFor: (questionId: string) => NavigationHistory | undefined;
  createDynamicBlock: (blockBlueprintId: string) => string | null;
  deleteDynamicBlock: (blockId: string) => boolean;
  deleteQuestionResponses: (questionIds: string[]) => void;
  isBlockCompleted: (blockId: string) => boolean;
  markBlockAsCompleted: (blockId: string) => void;
  removeBlockFromCompleted: (blockId: string) => void;
};

type Action =
  | { type: "GO_TO_QUESTION"; block_id: string; question_id: string }
  | { type: "SET_RESPONSE"; question_id: string; placeholder_key: string; value: string | string[]; previousBlockAdded?: string }
  | { type: "ADD_ACTIVE_BLOCK"; block_id: string; sourceQuestionId?: string; sourcePlaceholderId?: string }
  | { type: "REMOVE_ACTIVE_BLOCK"; block_id: string }
  | { type: "MARK_QUESTION_ANSWERED"; question_id: string }
  | { type: "SET_FORM_STATE"; state: Partial<FormState> }
  | { type: "RESET_FORM" }
  | { type: "SET_NAVIGATING"; isNavigating: boolean }
  | { type: "ADD_NAVIGATION_HISTORY"; history: NavigationHistory }
  | { type: "ADD_DYNAMIC_BLOCK"; block: Block }
  | { type: "DELETE_DYNAMIC_BLOCK"; blockId: string }
  | { type: "DELETE_QUESTION_RESPONSES"; questionIds: string[] }
  | { type: "MARK_BLOCK_COMPLETED"; blockId: string }
  | { type: "REMOVE_BLOCK_FROM_COMPLETED"; blockId: string }
  | { type: "ADD_PENDING_REMOVAL"; questionId: string; blockId: string }
  | { type: "REMOVE_FROM_PENDING_REMOVAL"; questionId: string }
  | { type: "PROCESS_PENDING_REMOVALS"; currentBlockId: string };

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
  dynamicBlocks: [],
  blockActivations: {}, // Track which questions/placeholders activated which blocks
  completedBlocks: [], // Track completed blocks
  pendingRemovals: {} // Track questions pending removal
};

const FormContext = createContext<FormContextType | undefined>(undefined);

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "GO_TO_QUESTION":
      const pendingRemovals = { ...state.pendingRemovals };
      Object.keys(pendingRemovals).forEach(blockId => {
        pendingRemovals[blockId] = pendingRemovals[blockId].filter(
          qId => qId !== action.question_id
        );
      });
      
      return {
        ...state,
        activeQuestion: {
          block_id: action.block_id,
          question_id: action.question_id
        },
        pendingRemovals
      };
    case "SET_RESPONSE": {
      const newResponses = { ...state.responses };
      if (!newResponses[action.question_id]) {
        newResponses[action.question_id] = {};
      }
      newResponses[action.question_id][action.placeholder_key] = action.value;
      return {
        ...state,
        responses: newResponses
      };
    }
    case "ADD_PENDING_REMOVAL": {
      const pendingRemovals = { ...state.pendingRemovals };
      if (!pendingRemovals[action.blockId]) {
        pendingRemovals[action.blockId] = [];
      }
      if (!pendingRemovals[action.blockId].includes(action.questionId)) {
        pendingRemovals[action.blockId] = [...pendingRemovals[action.blockId], action.questionId];
      }
      return {
        ...state,
        pendingRemovals
      };
    }
    case "REMOVE_FROM_PENDING_REMOVAL": {
      const pendingRemovals = { ...state.pendingRemovals };
      Object.keys(pendingRemovals).forEach(blockId => {
        pendingRemovals[blockId] = pendingRemovals[blockId].filter(
          qId => qId !== action.questionId
        );
      });
      return {
        ...state,
        pendingRemovals
      };
    }
    case "PROCESS_PENDING_REMOVALS": {
      const pendingRemovals = { ...state.pendingRemovals };
      let questionsToRemove: string[] = [];
      
      Object.keys(pendingRemovals).forEach(blockId => {
        if (blockId !== action.currentBlockId) {
          questionsToRemove = [...questionsToRemove, ...pendingRemovals[blockId]];
          delete pendingRemovals[blockId];
        }
      });
      
      if (questionsToRemove.length === 0) {
        return state;
      }
      
      const updatedResponses = { ...state.responses };
      questionsToRemove.forEach(questionId => {
        delete updatedResponses[questionId];
      });
      
      const updatedAnsweredQuestions = new Set(state.answeredQuestions);
      questionsToRemove.forEach(questionId => {
        updatedAnsweredQuestions.delete(questionId);
      });
      
      return {
        ...state,
        responses: updatedResponses,
        answeredQuestions: updatedAnsweredQuestions,
        pendingRemovals
      };
    }
    case "ADD_ACTIVE_BLOCK": {
      if (state.activeBlocks.includes(action.block_id)) {
        return state;
      }
      
      const updatedBlockActivations = { ...state.blockActivations };
      if (action.sourceQuestionId && action.sourcePlaceholderId) {
        if (!updatedBlockActivations[action.block_id]) {
          updatedBlockActivations[action.block_id] = [];
        }
        
        const exists = updatedBlockActivations[action.block_id].some(
          source => source.questionId === action.sourceQuestionId && 
                   source.placeholderId === action.sourcePlaceholderId
        );
        
        if (!exists) {
          updatedBlockActivations[action.block_id].push({
            questionId: action.sourceQuestionId,
            placeholderId: action.sourcePlaceholderId
          });
        }
      }
      
      return {
        ...state,
        activeBlocks: [...state.activeBlocks, action.block_id],
        blockActivations: updatedBlockActivations
      };
    }
    case "REMOVE_ACTIVE_BLOCK": {
      if (!state.activeBlocks.includes(action.block_id)) {
        return state;
      }
      
      const allBlocks = [...state.dynamicBlocks];
      const blockToRemove = allBlocks.find(b => b.block_id === action.block_id);
      
      const updatedState = {
        ...state,
        activeBlocks: state.activeBlocks.filter(id => id !== action.block_id),
        blockActivations: { ...state.blockActivations }
      };
      
      delete updatedState.blockActivations[action.block_id];
      
      if (blockToRemove) {
        const questionIdsToRemove = blockToRemove.questions.map(q => q.question_id);
        
        const updatedResponses = { ...state.responses };
        questionIdsToRemove.forEach(questionId => {
          delete updatedResponses[questionId];
        });
        updatedState.responses = updatedResponses;
        
        const updatedAnsweredQuestions = new Set(state.answeredQuestions);
        questionIdsToRemove.forEach(questionId => {
          updatedAnsweredQuestions.delete(questionId);
        });
        updatedState.answeredQuestions = updatedAnsweredQuestions;
      }
      
      return updatedState;
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
        dynamicBlocks: [],
        blockActivations: {},
        completedBlocks: []
      };
    }
    case "SET_NAVIGATING": {
      return {
        ...state,
        isNavigating: action.isNavigating
      };
    }
    case "ADD_NAVIGATION_HISTORY": {
      const filteredHistory = state.navigationHistory.filter(item => 
        !(item.from_question_id === action.history.from_question_id && 
          item.to_question_id === action.history.to_question_id)
      );
      
      return {
        ...state,
        navigationHistory: [...filteredHistory, action.history]
      };
    }
    case "ADD_DYNAMIC_BLOCK": {
      return {
        ...state,
        dynamicBlocks: [...state.dynamicBlocks, action.block],
        activeBlocks: [...state.activeBlocks, action.block.block_id]
      };
    }
    case "DELETE_DYNAMIC_BLOCK": {
      const blockToDelete = state.dynamicBlocks.find(block => block.block_id === action.blockId);
      const questionIdsToRemove = blockToDelete ? blockToDelete.questions.map(q => q.question_id) : [];
      const updatedDynamicBlocks = state.dynamicBlocks.filter(
        block => block.block_id !== action.blockId
      );
      const updatedActiveBlocks = state.activeBlocks.filter(
        blockId => blockId !== action.blockId
      );
      const updatedResponses = { ...state.responses };
      questionIdsToRemove.forEach(questionId => {
        delete updatedResponses[questionId];
      });
      const updatedAnsweredQuestions = new Set(state.answeredQuestions);
      questionIdsToRemove.forEach(questionId => {
        updatedAnsweredQuestions.delete(questionId);
      });
      
      const updatedBlockActivations = { ...state.blockActivations };
      delete updatedBlockActivations[action.blockId];
      
      return {
        ...state,
        dynamicBlocks: updatedDynamicBlocks,
        activeBlocks: updatedActiveBlocks,
        responses: updatedResponses,
        answeredQuestions: updatedAnsweredQuestions,
        blockActivations: updatedBlockActivations
      };
    }
    case "DELETE_QUESTION_RESPONSES": {
      const updatedResponses = { ...state.responses };
      action.questionIds.forEach(questionId => {
        delete updatedResponses[questionId];
      });
      const updatedAnsweredQuestions = new Set(state.answeredQuestions);
      action.questionIds.forEach(questionId => {
        updatedAnsweredQuestions.delete(questionId);
      });
      
      return {
        ...state,
        responses: updatedResponses,
        answeredQuestions: updatedAnsweredQuestions
      };
    }
    case "MARK_BLOCK_COMPLETED": {
      if (state.completedBlocks.includes(action.blockId)) {
        return state;
      }
      
      return {
        ...state,
        completedBlocks: [...state.completedBlocks, action.blockId]
      };
    }
    case "REMOVE_BLOCK_FROM_COMPLETED": {
      return {
        ...state,
        completedBlocks: state.completedBlocks.filter(blockId => blockId !== action.blockId)
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
  const previousBlockIdRef = useRef<string | null>(null);
  const previousQuestionIdRef = useRef<string | null>(null);
  const isNavigatingRef = useRef<boolean | undefined>(false);
  const usedNextBlockNavRef = useRef<boolean>(false);
  
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
  
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    activeBlocks: sortedBlocks.filter(b => b.default_active).map(b => b.block_id),
    dynamicBlocks: [],
    blockActivations: {},
    completedBlocks: []
  });

  const findBlockByQuestionId = useCallback((questionId: string): string | null => {
    for (const block of sortedBlocks) {
      const hasQuestion = block.questions.some(q => q.question_id === questionId);
      if (hasQuestion) {
        return block.block_id;
      }
    }
    
    for (const block of state.dynamicBlocks) {
      const hasQuestion = block.questions.some(q => q.question_id === questionId);
      if (hasQuestion) {
        return block.block_id;
      }
    }
    
    return null;
  }, [sortedBlocks, state.dynamicBlocks]);

  const markBlockAsCompleted = useCallback((blockId: string) => {
    if (blockId && !state.completedBlocks.includes(blockId)) {
      dispatch({ type: "MARK_BLOCK_COMPLETED", blockId });
    }
  }, [state.completedBlocks]);

  const removeBlockFromCompleted = useCallback((blockId: string) => {
    if (blockId && state.completedBlocks.includes(blockId)) {
      dispatch({ type: "REMOVE_BLOCK_FROM_COMPLETED", blockId });
    }
  }, [state.completedBlocks]);

  useEffect(() => {
    if (params.blockType) {
      const stateToSave = {
        ...state,
        answeredQuestions: Array.from(state.answeredQuestions)
      };
      localStorage.setItem(`form-state-${params.blockType}`, JSON.stringify(stateToSave));
    }
  }, [state, params.blockType]);

  const resetForm = useCallback(() => {
    if (params.blockType) {
      localStorage.removeItem(`form-state-${params.blockType}`);
    }
    
    dispatch({ type: "RESET_FORM" });
    
    navigate("/simulazione/pensando/introduzione/soggetto_acquisto", { replace: true });
  }, [params.blockType, navigate]);

  const goToQuestion = useCallback((block_id: string, question_id: string, replace = false) => {
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    const fromBlockId = state.activeQuestion.block_id;
    const fromQuestionId = state.activeQuestion.question_id;

    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
    
    dispatch({ 
      type: "ADD_NAVIGATION_HISTORY", 
      history: {
        from_block_id: fromBlockId,
        from_question_id: fromQuestionId,
        to_block_id: block_id,
        to_question_id: question_id,
        timestamp: Date.now()
      }
    });
    
    const blockType = params.blockType || "funnel";
    const newPath = `/simulazione/${blockType}/${block_id}/${question_id}`;
    
    if (replace) {
      navigate(newPath, { replace: true });
    } else {
      navigate(newPath);
    }
    
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [params.blockType, navigate, state.activeQuestion]);

  const setResponse = useCallback((question_id: string, placeholder_key: string, value: string | string[]) => {
    const previousValue = state.responses[question_id]?.[placeholder_key];
    
    const blockId = findBlockByQuestionId(question_id);
    
    if (blockId && state.completedBlocks.includes(blockId)) {
      dispatch({ type: "REMOVE_BLOCK_FROM_COMPLETED", blockId });
    }
    
    const allBlocks = [
      ...sortedBlocks,
      ...state.dynamicBlocks
    ];
    
    let questionObj = null;
    let foundBlock = null;
    
    for (const block of allBlocks) {
      const question = block.questions.find(q => q.question_id === question_id);
      if (question) {
        questionObj = question;
        foundBlock = block;
        break;
      }
    }
    
    if (questionObj && previousValue !== undefined && previousValue !== value) {
      const previousLeadsTo = getPlaceholderLeadsTo(questionObj, placeholder_key, previousValue);
      const newLeadsTo = getPlaceholderLeadsTo(questionObj, placeholder_key, value);
      
      if (previousLeadsTo && previousLeadsTo !== newLeadsTo) {
        const isInDynamicBlock = blockId && isDynamicBlock(blockId);
        
        const isMultiBlockManager = isMultiBlockManagerQuestion(allBlocks, previousLeadsTo);
        
        let shouldSkipRemoval = false;
        
        if (isInDynamicBlock && isMultiBlockManager && blockId) {
          const parentManagerId = getParentMultiBlockManager(allBlocks, blockId);
          
          if (parentManagerId === previousLeadsTo) {
            shouldSkipRemoval = true;
          }
        }
        
        if (!shouldSkipRemoval) {
          let targetBlockId = null;
          for (const block of allBlocks) {
            if (block.questions.some(q => q.question_id === previousLeadsTo)) {
              targetBlockId = block.block_id;
              break;
            }
          }
          
          if (targetBlockId) {
            dispatch({ 
              type: "ADD_PENDING_REMOVAL", 
              questionId: previousLeadsTo,
              blockId: targetBlockId
            });
          }
        }
      }
    }
    
    dispatch({ type: "REMOVE_FROM_PENDING_REMOVAL", questionId: question_id });
    
    dispatch({ type: "SET_RESPONSE", question_id, placeholder_key, value });
    dispatch({ type: "MARK_QUESTION_ANSWERED", question_id });
  }, [state.responses, state.dynamicBlocks, state.activeBlocks, sortedBlocks, state.completedBlocks, findBlockByQuestionId]);

  const getResponse = useCallback((question_id: string, placeholder_key: string) => {
    if (!state.responses[question_id]) return undefined;
    return state.responses[question_id][placeholder_key];
  }, [state.responses]);

  const addActiveBlock = useCallback((block_id: string) => {
    dispatch({ type: "ADD_ACTIVE_BLOCK", block_id });
  }, []);

  const removeActiveBlock = useCallback((block_id: string) => {
    dispatch({ type: "REMOVE_ACTIVE_BLOCK", block_id });
  }, []);

  const isQuestionAnswered = useCallback((question_id: string) => {
    return state.answeredQuestions.has(question_id);
  }, [state.answeredQuestions]);

  const getProgress = useCallback(() => {
    const visibleActiveBlocks = state.activeBlocks
      .map(blockId => [...sortedBlocks, ...state.dynamicBlocks].find(b => b.block_id === blockId))
      .filter(block => block && !block.invisible) as Block[];
    
    if (visibleActiveBlocks.length === 0) return 0;
    
    const blockWeight = 100 / visibleActiveBlocks.length;
    
    let totalProgress = 0;
    
    visibleActiveBlocks.forEach(block => {
      if (state.completedBlocks.includes(block.block_id)) {
        totalProgress += blockWeight;
      } else {
        const totalQuestions = block.questions.length;
        let answeredQuestions = 0;
        
        block.questions.forEach(question => {
          if (state.answeredQuestions.has(question.question_id)) {
            answeredQuestions++;
          }
        });
        
        if (totalQuestions > 0) {
          const blockProgress = (answeredQuestions / totalQuestions) * blockWeight;
          totalProgress += blockProgress;
        }
      }
    });
    
    return Math.round(totalProgress);
  }, [state.activeBlocks, state.answeredQuestions, state.completedBlocks, state.dynamicBlocks, sortedBlocks]);

  const getNavigationHistoryFor = useCallback((questionId: string): NavigationHistory | undefined => {
    const sortedHistory = [...state.navigationHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    return sortedHistory.find(item => item.to_question_id === questionId);
  }, [state.navigationHistory]);

  const deleteDynamicBlock = useCallback((blockId: string): boolean => {
    try {
      const blockExists = state.dynamicBlocks.some(b => b.block_id === blockId);
      
      if (!blockExists) {
        return false;
      }
      
      dispatch({ type: "DELETE_DYNAMIC_BLOCK", blockId });
      return true;
    } catch (error) {
      return false;
    }
  }, [state.dynamicBlocks]);
  
  const deleteQuestionResponses = useCallback((questionIds: string[]) => {
    if (!questionIds || questionIds.length === 0) return;
    dispatch({ type: "DELETE_QUESTION_RESPONSES", questionIds });
  }, []);

  return (
    <FormContext.Provider
      value={{
        state,
        blocks: [
          ...sortedBlocks,
          ...state.dynamicBlocks
        ].sort((a, b) => a.priority - b.priority), 
        goToQuestion,
        setResponse,
        getResponse,
        addActiveBlock,
        removeActiveBlock,
        isQuestionAnswered,
        navigateToNextQuestion,
        getProgress,
        resetForm,
        getNavigationHistoryFor,
        createDynamicBlock,
        deleteDynamicBlock,
        deleteQuestionResponses,
        isBlockCompleted,
        markBlockAsCompleted,
        removeBlockFromCompleted
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
