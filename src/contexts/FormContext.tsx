import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from "react";
import { Block, FormState, FormResponse, NavigationHistory, Placeholder, SelectPlaceholder, PendingRemoval, SessionType } from "@/types/form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ensureBlockHasPriority } from "@/utils/blockUtils";
import { 
  getPlaceholderLeadsTo, 
  isMultiBlockManagerQuestion, 
  isDynamicBlock, 
  getParentMultiBlockManager,
  getQuestionsAfterInBlock
} from "@/utils/formUtils";
import { supabase } from "@/integrations/supabase/client";
import { SaveSimulationData, SaveSimulationResult } from "@/services/saveSimulationService";
import { resumeSimulation } from "@/services/resumeSimulationService";
import { generateSimulationId } from "@/utils/simulationId";
import { autoSave, manualSave } from "@/services/smartSaveService";

type FormContextType = {
  state: FormState;
  blocks: Block[];
  formSlug?: string;
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
  isQuestionPendingRemoval: (questionId: string) => boolean;
  handleSaveSimulation: (contactData: Omit<SaveSimulationData, 'percentage'>) => Promise<SaveSimulationResult>;
  handleResumeSimulation: (resumeCode: string) => Promise<{ success: boolean; error?: string }>;
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
  | { type: "ADD_TO_PENDING_REMOVALS"; pendingRemovals: PendingRemoval[] }
  | { type: "REMOVE_FROM_PENDING_REMOVALS"; questionIds: string[] }
  | { type: "PROCESS_PENDING_REMOVALS"; currentBlockId: string };

const initialState: FormState = {
  simulationId: '', // Will be set when FormProvider initializes
  sessionType: 'new' as SessionType,
  formSlug: undefined, // Will be set when FormProvider initializes
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
  pendingRemovals: [] // Track questions pending removal
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
      
      // Track which question/placeholder activated this block
      const updatedBlockActivations = { ...state.blockActivations };
      if (action.sourceQuestionId && action.sourcePlaceholderId) {
        if (!updatedBlockActivations[action.block_id]) {
          updatedBlockActivations[action.block_id] = [];
        }
        
        // Check if this activation source is already recorded
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
      
      // Find block to get its questions
      const allBlocks = [...state.dynamicBlocks];
      const blockToRemove = allBlocks.find(b => b.block_id === action.block_id);
      
      // Create updated state
      const updatedState = {
        ...state,
        activeBlocks: state.activeBlocks.filter(id => id !== action.block_id),
        blockActivations: { ...state.blockActivations }
      };
      
      // Remove from blockActivations
      delete updatedState.blockActivations[action.block_id];
      
      // If it's a static block, we need to clean up responses and answered questions manually
      if (blockToRemove) {
        const questionIdsToRemove = blockToRemove.questions.map(q => q.question_id);
        
        // Remove responses
        const updatedResponses = { ...state.responses };
        questionIdsToRemove.forEach(questionId => {
          delete updatedResponses[questionId];
        });
        updatedState.responses = updatedResponses;
        
        // Remove from answered questions
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
        completedBlocks: [],
        pendingRemovals: []
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
      
      // Also clean up blockActivations
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
      // Don't add duplicates
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
    // New actions for pending removals
    case "ADD_TO_PENDING_REMOVALS": {
      // Add new pending removals, avoiding duplicates
      const existingIds = state.pendingRemovals.map(item => item.questionId);
      const newRemovals = action.pendingRemovals.filter(
        item => !existingIds.includes(item.questionId)
      );
      
      return {
        ...state,
        pendingRemovals: [...state.pendingRemovals, ...newRemovals]
      };
    }
    case "REMOVE_FROM_PENDING_REMOVALS": {
      return {
        ...state,
        pendingRemovals: state.pendingRemovals.filter(
          item => !action.questionIds.includes(item.questionId)
        )
      };
    }
    case "PROCESS_PENDING_REMOVALS": {
      // Process pending removals for blocks other than the current one
      const removalsByBlock = state.pendingRemovals.filter(
        item => item.blockId !== action.currentBlockId
      );
      
      if (removalsByBlock.length === 0) {
        return state;
      }
      
      // Get question IDs to remove
      const questionIdsToRemove = removalsByBlock.map(item => item.questionId);
      
      // Update responses and answered questions
      const updatedResponses = { ...state.responses };
      const updatedAnsweredQuestions = new Set(state.answeredQuestions);
      
      questionIdsToRemove.forEach(questionId => {
        delete updatedResponses[questionId];
        updatedAnsweredQuestions.delete(questionId);
      });
      
      console.log(`Removing ${questionIdsToRemove.length} questions from responses and answeredQuestions:`, questionIdsToRemove);
      
      // Remove processed items from pendingRemovals
      const updatedPendingRemovals = state.pendingRemovals.filter(
        item => item.blockId === action.currentBlockId
      );
      
      return {
        ...state,
        responses: updatedResponses,
        answeredQuestions: updatedAnsweredQuestions,
        pendingRemovals: updatedPendingRemovals
      };
    }
    default:
      return state;
  }
}

export const FormProvider: React.FC<{ children: ReactNode; blocks: Block[]; formSlug?: string }> = ({ children, blocks, formSlug }) => {
  const navigate = useNavigate();
  const params = useParams<{ formSlug?: string; blockId?: string; questionId?: string }>();
  const location = useLocation();
  const previousBlockIdRef = useRef<string | null>(null);
  const previousQuestionIdRef = useRef<string | null>(null);
  const isNavigatingRef = useRef<boolean | undefined>(false);
  const usedNextBlockNavRef = useRef<boolean>(false);
  
  // Auto-save refs and state
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<number>(0);
  const hasInitialAutoSaveRef = useRef<boolean>(false);
  const isManualSavingRef = useRef<boolean>(false);
  
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);

  // Initialize session detection
  const isResumedSession = location.state?.isResumedSession === true;
  const resumedSimulationId = location.state?.simulationId as string;
  
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    simulationId: resumedSimulationId || generateSimulationId(),
    sessionType: isResumedSession ? 'resumed' : 'new',
    formSlug: formSlug, // Store the form slug in state
    activeBlocks: sortedBlocks.filter(b => b.default_active).map(b => b.block_id),
    dynamicBlocks: [],
    blockActivations: {},
    completedBlocks: [],
    pendingRemovals: []
  });

  // Funzione per trovare a quale blocco appartiene una domanda specifica
  const findBlockByQuestionId = useCallback((questionId: string): string | null => {
    // Cerca prima nei blocchi normali
    for (const block of sortedBlocks) {
      const hasQuestion = block.questions.some(q => q.question_id === questionId);
      if (hasQuestion) {
        return block.block_id;
      }
    }
    
    // Se non trovato, cerca nei blocchi dinamici
    for (const block of state.dynamicBlocks) {
      const hasQuestion = block.questions.some(q => q.question_id === questionId);
      if (hasQuestion) {
        return block.block_id;
      }
    }
    
    return null;
  }, [sortedBlocks, state.dynamicBlocks]);

  // Find a question by its ID
  const findQuestionById = useCallback((questionId: string): { block: Block; question: any } | null => {
    const allBlocks = [
      ...sortedBlocks,
      ...state.dynamicBlocks
    ];
    
    for (const block of allBlocks) {
      for (const question of block.questions) {
        if (question.question_id === questionId) {
          return { block, question };
        }
      }
    }
    return null;
  }, [sortedBlocks, state.dynamicBlocks]);

  // Trova il lead_to di un placeholder in una domanda
  const findPlaceholderLeadsTo = useCallback((question: any, placeholderKey: string, value: string | string[]): string | null => {
    if (!question || !question.placeholders || !question.placeholders[placeholderKey]) {
      return null;
    }
    
    const placeholder = question.placeholders[placeholderKey];
    
    // Per i placeholder di tipo select
    if (placeholder.type === "select") {
      if (Array.isArray(value)) {
        // Se è una selezione multipla, non gestiamo lead_to (di solito non usato in multi-select)
        return null;
      } else {
        // Trova l'opzione selezionata
        const selectedOption = placeholder.options.find((opt: any) => opt.id === value);
        return selectedOption?.leads_to || null;
      }
    }
    
    // Per i placeholder di tipo input o altro con lead_to diretto
    if (placeholder.leads_to) {
      return placeholder.leads_to;
    }
    
    return null;
  }, []);

  // Check if a question is pending removal
  const isQuestionPendingRemoval = useCallback((questionId: string): boolean => {
    return state.pendingRemovals.some(item => item.questionId === questionId);
  }, [state.pendingRemovals]);

  // Mark a block as completed
  const markBlockAsCompleted = useCallback((blockId: string) => {
    if (blockId && !state.completedBlocks.includes(blockId)) {
      console.log(`Marking block as completed: ${blockId}`);
      dispatch({ type: "MARK_BLOCK_COMPLETED", blockId });
    }
  }, [state.completedBlocks]);

  // Remove a block from completed blocks
  const removeBlockFromCompleted = useCallback((blockId: string) => {
    if (blockId && state.completedBlocks.includes(blockId)) {
      console.log(`Removing block from completed: ${blockId}`);
      dispatch({ type: "REMOVE_BLOCK_FROM_COMPLETED", blockId });
    }
  }, [state.completedBlocks]);

  // Keep track of navigation for correct block completion
  useEffect(() => {
    // Only execute when isNavigating transitions from true to false (navigation completed)
    if (isNavigatingRef.current === true && state.isNavigating === false) {
      // We store the blockId that we're coming FROM (previous block)
      const blockWeLeavingFrom = previousBlockIdRef.current;
      
      // Make sure we have a valid previous block and it's different from the current one
      if (blockWeLeavingFrom && 
          blockWeLeavingFrom !== state.activeQuestion.block_id && 
          blockWeLeavingFrom !== null &&
          usedNextBlockNavRef.current) {
        // Mark the block we're coming from as completed - but only if we used "next_block" navigation
        markBlockAsCompleted(blockWeLeavingFrom);
        
        // Reset the flag after completion
        usedNextBlockNavRef.current = false;
      }
    }
    
    // Update refs for next comparison - these should run AFTER the above completion logic
    if (state.isNavigating === false) {
      previousQuestionIdRef.current = state.activeQuestion.question_id;
      previousBlockIdRef.current = state.activeQuestion.block_id;
    }
    
    // Always update the navigation state ref
    isNavigatingRef.current = state.isNavigating;
  }, [state.isNavigating, state.activeQuestion.block_id, state.activeQuestion.question_id, markBlockAsCompleted]);

  const createDynamicBlock = useCallback((blockBlueprintId: string): string | null => {
    const blueprintBlock = blocks.find(b => b.block_id === blockBlueprintId && b.multiBlock === true);
    
    if (!blueprintBlock) {
      console.error(`Blueprint block ${blockBlueprintId} not found or is not a multiBlock`);
      return null;
    }
    
    const existingCopies = state.dynamicBlocks
      .filter(block => block.blueprint_id === blockBlueprintId)
      .map(block => block.copy_number || 0);
    
    const nextCopyNumber = existingCopies.length > 0 ? Math.max(...existingCopies) + 1 : 1;
    
    const newBlockId = blockBlueprintId.replace('{copyNumber}', nextCopyNumber.toString());
    
    const newBlock: Block = {
      ...JSON.parse(JSON.stringify(blueprintBlock)),
      block_id: newBlockId,
      blueprint_id: blockBlueprintId,
      copy_number: nextCopyNumber,
      title: `${blueprintBlock.title} ${nextCopyNumber}`,
    };
    
    newBlock.questions = newBlock.questions.map(question => {
      const updatedQuestion = {
        ...question,
        question_id: question.question_id.replace('{copyNumber}', nextCopyNumber.toString())
      };
      
      for (const placeholderKey in updatedQuestion.placeholders) {
        const placeholder = updatedQuestion.placeholders[placeholderKey];
        
        if (placeholder.type === "select") {
          placeholder.options = placeholder.options.map(option => ({
            ...option,
            leads_to: option.leads_to.replace('{copyNumber}', nextCopyNumber.toString())
          }));
        }
        
        if (placeholder.type === "input" && placeholder.leads_to) {
          placeholder.leads_to = placeholder.leads_to.replace('{copyNumber}', nextCopyNumber.toString());
        }
        
        if (placeholder.type === "MultiBlockManager" && placeholder.leads_to) {
          placeholder.leads_to = placeholder.leads_to.replace('{copyNumber}', nextCopyNumber.toString());
        }
      }
      
      return updatedQuestion;
    });
    
    dispatch({ type: "ADD_DYNAMIC_BLOCK", block: newBlock });
    
    const blockWithPriority = ensureBlockHasPriority(newBlock);
    dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: newBlockId });
    
    return newBlockId;
  }, [blocks, state.dynamicBlocks]);

  useEffect(() => {
    const defaultActiveBlockIds = blocks
      .filter(b => b.default_active)
      .map(b => b.block_id);
    
    defaultActiveBlockIds.forEach(blockId => {
      if (!state.activeBlocks.includes(blockId)) {
        dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
      }
    });
  }, [blocks]);

  const resetForm = useCallback(() => {
    // Clear simulation-specific localStorage
    if (state.simulationId) {
      localStorage.removeItem(`form-state-${state.simulationId}`);
    }
    
    // Clear old localStorage keys as well for cleanup
    if (params.formSlug) {
      localStorage.removeItem(`form-state-${params.formSlug}`);
    }
    
    dispatch({ type: "RESET_FORM" });
    
    navigate("/simulazione/simulazione-mutuo/introduzione/soggetto_acquisto", { replace: true });
  }, [params.formSlug, navigate, state.simulationId]);

  useEffect(() => {
    const { blockId, questionId } = params;
    
    if (blockId && questionId) {
      dispatch({ 
        type: "GO_TO_QUESTION", 
        block_id: blockId, 
        question_id: questionId 
      });
      
      if (!state.activeBlocks.includes(blockId)) {
        dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
      }
    } else if (blockId) {
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
        
        navigate(`/simulazione/${params.formSlug}/${blockId}/${firstQuestionId}`, { replace: true });
      }
    } else if (params.formSlug) {
      const entryBlock = blocks.find(b => b.block_id === "introduzione");
      if (entryBlock && entryBlock.questions.length > 0) {
        dispatch({ 
          type: "GO_TO_QUESTION", 
          block_id: "introduzione", 
          question_id: "soggetto_acquisto" 
        });
      }
    }
    
    // Load state based on session type
    if (state.sessionType === 'new') {
      console.log('🆕 New simulation session, clearing old localStorage');
      
      // Clear old localStorage entries for fresh start
      localStorage.removeItem(`form-state-${params.formSlug}`);
      localStorage.removeItem('form-state-mutuo'); // Legacy cleanup
      
      // Also clear resume metadata for truly new sessions (not resumed)
      if (!isResumedSession) {
        localStorage.removeItem('resumeMetadata');
        localStorage.removeItem('contactInfo');
      }
      
    } else if (state.sessionType === 'resumed') {
      console.log('🔄 Resumed simulation session');
      
      // Try to load simulation-specific state first
      let savedState = localStorage.getItem(`form-state-${state.simulationId}`);
      
      if (!savedState) {
        // Fallback to old formSlug-based keys for backward compatibility
        savedState = localStorage.getItem(`form-state-${params.formSlug}`);
        if (!savedState && params.formSlug === 'simulazione-mutuo') {
          savedState = localStorage.getItem('form-state-mutuo');
        }
        
        // If we found old state, migrate it to the new simulation ID format
        if (savedState) {
          console.log('🔄 Migrating saved state to simulation ID format');
          localStorage.setItem(`form-state-${state.simulationId}`, savedState);
          
          // Clean up old keys
          localStorage.removeItem(`form-state-${params.formSlug}`);
          localStorage.removeItem('form-state-mutuo');
        }
      }
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          
          if (Array.isArray(parsedState.answeredQuestions)) {
            parsedState.answeredQuestions = new Set(parsedState.answeredQuestions);
          } else {
            parsedState.answeredQuestions = new Set();
          }
          
          if (Array.isArray(parsedState.dynamicBlocks)) {
            parsedState.dynamicBlocks = parsedState.dynamicBlocks.map(block => 
              ensureBlockHasPriority(block)
            );
          } else {
            parsedState.dynamicBlocks = [];
          }
          
          // Initialize pendingRemovals if not present
          if (!parsedState.pendingRemovals) {
            parsedState.pendingRemovals = [];
          }
          
          // Ensure the loaded state maintains the correct simulation ID
          parsedState.simulationId = state.simulationId;
          parsedState.sessionType = 'resumed';
          
          dispatch({ type: "SET_FORM_STATE", state: parsedState });
          
          if (parsedState.activeBlocks) {
            parsedState.activeBlocks.forEach((blockId: string) => {
              if (!state.activeBlocks.includes(blockId)) {
                dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
              }
            });
          }
          
          if (parsedState.responses) {
            activateRequiredBlocksBasedOnResponses(parsedState.responses);
          }
        } catch (e) {
          console.error("Errore nel caricamento dello stato salvato:", e);
        }
      }
    }
  }, [params.blockId, params.questionId, params.formSlug, blocks, navigate]);


  // Auto-save state using simulation ID (localStorage)
  useEffect(() => {
    if (state.simulationId) {
      const stateToSave = {
        ...state,
        answeredQuestions: Array.from(state.answeredQuestions)
      };
      localStorage.setItem(`form-state-${state.simulationId}`, JSON.stringify(stateToSave));
      
      console.log(`💾 Auto-saved form state for simulation: ${state.simulationId}`);
    }
  }, [state]);


  const activateRequiredBlocksBasedOnResponses = (responses: FormResponse) => {
    for (const questionId of Object.keys(responses)) {
      for (const blockObj of blocks) {
        const question = blockObj.questions.find(q => q.question_id === questionId);
        if (!question) continue;

        for (const [placeholderKey, value] of Object.entries(responses[questionId])) {
          if (question.placeholders[placeholderKey].type === "select") {
            const options = (question.placeholders[placeholderKey] as any).options;
            if (!Array.isArray(value)) {
              const selectedOption = options.find((opt: any) => opt.id === value);
              
              if (selectedOption?.add_block && !state.activeBlocks.includes(selectedOption.add_block)) {
                dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: selectedOption.add_block });
              }
            } else {
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

  // Check if a block is completed
  const isBlockCompleted = useCallback((blockId: string): boolean => {
    return state.completedBlocks.includes(blockId);
  }, [state.completedBlocks]);

  const goToQuestion = useCallback((block_id: string, question_id: string, replace = false) => {
    // Check if the question is in pending removals, if so, remove it
    if (isQuestionPendingRemoval(question_id)) {
      console.log(`Question ${question_id} was pending removal but is now being navigated to - removing from pending removals`);
      dispatch({ type: "REMOVE_FROM_PENDING_REMOVALS", questionIds: [question_id] });
    }
    
    // Check if we're navigating to a new block, if so, process pending removals for other blocks
    if (block_id !== state.activeQuestion.block_id) {
      console.log(`Navigating to a new block: ${block_id} - processing pending removals for other blocks`);
      dispatch({ type: "PROCESS_PENDING_REMOVALS", currentBlockId: block_id });
    }
    
    // Set navigating state to true
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    // Store the current question and block before changing
    const fromBlockId = state.activeQuestion.block_id;
    const fromQuestionId = state.activeQuestion.question_id;

    // Update active question
    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
    
    // Record navigation history
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
    
    // Handle URL navigation
    const formSlug = params.formSlug || "simulazione-mutuo";
    const newPath = `/simulazione/${formSlug}/${block_id}/${question_id}`;
    
    if (replace) {
      navigate(newPath, { replace: true });
    } else {
      navigate(newPath);
    }
    
    // Set navigating to false after a short delay to allow for rendering
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [params.formSlug, navigate, state.activeQuestion, isQuestionPendingRemoval]);

  const setResponse = useCallback((question_id: string, placeholder_key: string, value: string | string[]) => {
    const previousValue = state.responses[question_id]?.[placeholder_key];
    
    // Trova il blocco a cui appartiene questa domanda
    const blockId = findBlockByQuestionId(question_id);
    
    // Se il blocco è completato, rimuovilo dalla lista dei completati
    // perché l'utente sta cambiando una risposta
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
    
    // Gestione del cambiamento del lead_to
    if (questionObj && foundBlock && previousValue !== undefined && previousValue !== value) {
      const previousLeadsTo = findPlaceholderLeadsTo(questionObj, placeholder_key, previousValue);
      const newLeadsTo = findPlaceholderLeadsTo(questionObj, placeholder_key, value);
      
      // Log per il debug
      console.log(`Cambio risposta rilevato in questione ${question_id}, blocco ${blockId || "sconosciuto"}`);
      console.log(`Valore precedente: ${previousValue}, Nuovo valore: ${value}`);
      console.log(`Lead_to precedente: ${previousLeadsTo}, Nuovo lead_to: ${newLeadsTo}`);
      
      // Se il lead_to è cambiato, gestisci le domande che devono essere rimosse
      if (previousLeadsTo && previousLeadsTo !== newLeadsTo) {
        console.log(`Lead_to cambiato da ${previousLeadsTo} a ${newLeadsTo}`);
        
        // Verifica se siamo in un blocco dinamico
        const isInDynamicBlock = blockId && isDynamicBlock(blockId);
        console.log(`Siamo in un blocco dinamico? ${isInDynamicBlock ? "Sì" : "No"}`);
        
        // Verifica se la domanda lead_to precedente è un multiblockmanager
        const isMultiBlockManager = isMultiBlockManagerQuestion(allBlocks, previousLeadsTo);
        console.log(`La domanda lead_to precedente è un MultiBlockManager? ${isMultiBlockManager ? "Sì" : "No"}`);
        
        let shouldSkipRemoval = false;
        
        // Se siamo in un blocco dinamico e il lead_to precedente è un multiblockmanager,
        // verifichiamo se è il parent multiblockmanager di questo blocco dinamico
        if (isInDynamicBlock && isMultiBlockManager && blockId) {
          const parentManagerId = getParentMultiBlockManager(allBlocks, blockId);
          console.log(`Parent MultiBlockManager per questo blocco dinamico: ${parentManagerId}`);
          
          if (parentManagerId === previousLeadsTo) {
            console.log(`PROTEZIONE ATTIVATA: Non rimuoveremo ${previousLeadsTo} da answeredQuestions perché è il parent manager di questo blocco dinamico`);
            shouldSkipRemoval = true;
          }
        }
        
        if (!shouldSkipRemoval) {
          console.log(`Preparando la rimozione di ${previousLeadsTo} e domande successive nello stesso blocco`);
          
          // Trova il blocco della domanda precedente
          const targetQuestionInfo = findQuestionById(previousLeadsTo);
          
          if (targetQuestionInfo) {
            const targetBlockId = targetQuestionInfo.block.block_id;
            
            // Trova tutte le domande che seguono nella domanda nel blocco
            const questionsAfter = getQuestionsAfterInBlock(
              allBlocks,
              targetBlockId,
              previousLeadsTo
            );
            
            // Aggiungi la domanda target e tutte quelle successive nel blocco a pendingRemovals
            const pendingRemovals: PendingRemoval[] = [
              {
                questionId: previousLeadsTo,
                blockId: targetBlockId,
                timestamp: Date.now()
              },
              ...questionsAfter.map(q => ({
                questionId: q.question_id,
                blockId: targetBlockId,
                timestamp: Date.now()
              }))
            ];
            
            console.log(`Aggiungendo ${pendingRemovals.length} domande a pendingRemovals:`, 
              pendingRemovals.map(r => r.questionId));
            
            dispatch({ type: "ADD_TO_PENDING_REMOVALS", pendingRemovals });
          } else {
            console.log(`Non è stato possibile trovare la domanda ${previousLeadsTo} per prepararne la rimozione`);
          }
        }
      }
    }
    
    // Continua con la logica esistente per la gestione di add_block
    if (questionObj && foundBlock && 
        questionObj.placeholders[placeholder_key] && 
        questionObj.placeholders[placeholder_key].type === "select") {
      
      const placeholder = questionObj.placeholders[placeholder_key] as SelectPlaceholder;
      
      if (previousValue && previousValue !== value) {
        if (typeof previousValue === 'string') {
          const prevOption = placeholder.options.find(opt => opt.id === previousValue);
          
          if (prevOption?.add_block) {
            let newOptionKeepsBlock = false;
            
            if (Array.isArray(value)) {
              newOptionKeepsBlock = value.some(optId => {
                const option = placeholder.options.find(opt => opt.id === optId);
                return option?.add_block === prevOption.add_block;
              });
            } else {
              const newOption = placeholder.options.find(opt => opt.id === value);
              newOptionKeepsBlock = newOption?.add_block === prevOption.add_block;
            }
            
            if (!newOptionKeepsBlock) {
              const blockToRemove = prevOption.add_block;
              const isDynamicBlock = state.dynamicBlocks.some(b => b.block_id === blockToRemove);
              
              // Handle both dynamic and static blocks
              if (isDynamicBlock) {
                dispatch({ type: "DELETE_DYNAMIC_BLOCK", blockId: blockToRemove });
              } else if (state.activeBlocks.includes(blockToRemove)) {
                // For static blocks, we just need to remove them from activeBlocks
                dispatch({ type: "REMOVE_ACTIVE_BLOCK", block_id: blockToRemove });
              }
            }
          }
        } else if (Array.isArray(previousValue) && Array.isArray(value)) {
          const removedOptionIds = previousValue.filter(id => !value.includes(id));
          
          removedOptionIds.forEach(optId => {
            const option = placeholder.options.find(opt => opt.id === optId);
            if (option?.add_block) {
              const blockStillNeeded = value.some(remainingId => {
                const remainingOpt = placeholder.options.find(opt => opt.id === remainingId);
                return remainingOpt?.add_block === option.add_block;
              });
              
              if (!blockStillNeeded) {
                const blockToRemove = option.add_block;
                const isDynamicBlock = state.dynamicBlocks.some(b => b.block_id === blockToRemove);
                
                // Handle both dynamic and static blocks
                if (isDynamicBlock) {
                  dispatch({ type: "DELETE_DYNAMIC_BLOCK", blockId: blockToRemove });
                } else if (state.activeBlocks.includes(blockToRemove)) {
                  dispatch({ type: "REMOVE_ACTIVE_BLOCK", block_id: blockToRemove });
                }
              }
            }
          });
        }
      }
    }
    
    dispatch({ type: "SET_RESPONSE", question_id, placeholder_key, value });
    dispatch({ type: "MARK_QUESTION_ANSWERED", question_id });
    
    // Check if the current response should add a block
    if (questionObj && questionObj.placeholders[placeholder_key].type === "select") {
      const placeholder = questionObj.placeholders[placeholder_key] as SelectPlaceholder;
      
      if (Array.isArray(value)) {
        // Handle multi-select
        value.forEach(optionId => {
          const option = placeholder.options.find(opt => opt.id === optionId);
          if (option?.add_block) {
            dispatch({ 
              type: "ADD_ACTIVE_BLOCK", 
              block_id: option.add_block,
              sourceQuestionId: question_id,
              sourcePlaceholderId: placeholder_key
            });
          }
        });
      } else {
        // Handle single-select
        const selectedOption = placeholder.options.find(opt => opt.id === value);
        if (selectedOption?.add_block) {
          dispatch({ 
            type: "ADD_ACTIVE_BLOCK", 
            block_id: selectedOption.add_block,
            sourceQuestionId: question_id,
            sourcePlaceholderId: placeholder_key
          });
        }
      }
    }
  }, [state.responses, state.dynamicBlocks, state.activeBlocks, sortedBlocks, state.completedBlocks, findBlockByQuestionId, findQuestionById, findPlaceholderLeadsTo]);

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

  const navigateToNextQuestion = useCallback((currentQuestionId: string, leadsTo: string) => {
    // Store the current block ID before navigation starts
    const sourceBlockId = state.activeQuestion.block_id;
    
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    // Check for both "next_block" and "stop_flow" cases to set the flag
    if (leadsTo === "next_block") {
      // Set the flag that we're using "next_block" navigation
      usedNextBlockNavRef.current = true;
      
      let currentBlock = null;
      let currentBlockIndex = -1;
      
      for (let i = 0; i < sortedBlocks.length; i++) {
        const block = sortedBlocks[i];
        const hasQuestion = block.questions.some(q => q.question_id === currentQuestionId);
        if (hasQuestion) {
          currentBlockIndex = i;
          currentBlock = block;
          break;
        }
      }

      if (currentBlockIndex !== -1 && currentBlock) {
        // We don't mark as completed here - the navigation useEffect will handle it based on the usedNextBlockNavRef flag
        
        let foundNextActiveBlock = false;
        
        const allBlocks = [
          ...sortedBlocks,
          ...state.dynamicBlocks
        ];
        
        const activeBlocksWithPriority = state.activeBlocks
          .map(blockId => allBlocks.find(b => b.block_id === blockId))
          .filter(Boolean)
          .filter(b => !b!.invisible)
          .sort((a, b) => a!.priority - b!.priority);
        
        const currentActiveIndex = activeBlocksWithPriority.findIndex(b => b!.block_id === currentBlock.block_id);
        
        if (currentActiveIndex !== -1) {
          for (let i = currentActiveIndex + 1; i < activeBlocksWithPriority.length; i++) {
            const nextBlock = activeBlocksWithPriority[i];
            if (nextBlock && nextBlock.questions.length > 0) {
              foundNextActiveBlock = true;
              goToQuestion(nextBlock.block_id, nextBlock.questions[0].question_id);
              break;
            }
          }
        }
        
        if (!foundNextActiveBlock) {
          const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === currentQuestionId);
          
          if (currentQuestionIndex < currentBlock.questions.length - 1) {
            const nextQuestion = currentBlock.questions[currentQuestionIndex + 1];
            goToQuestion(currentBlock.block_id, nextQuestion.question_id);
            return;
          }
        }
      }
    } else if (leadsTo === "stop_flow") {
      // Also set the flag for stop_flow to mark the block as completed
      usedNextBlockNavRef.current = true;
      
      // Set a flag that QuestionView will check to display the stop flow message
      sessionStorage.setItem("stopFlowActivated", "true");
      
      // We don't navigate to another question in stop_flow case
      setTimeout(() => {
        dispatch({ type: "SET_NAVIGATING", isNavigating: false });
      }, 300);
      return;
    } else {
      // For direct question navigation (not next_block or stop_flow), set the flag to false
      usedNextBlockNavRef.current = false;
      
      const found = findQuestionById(leadsTo);
      if (found) {
        // We don't mark as completed for direct question navigation
        
        dispatch({ 
          type: "ADD_NAVIGATION_HISTORY", 
          history: {
            from_block_id: sourceBlockId,
            from_question_id: currentQuestionId,
            to_block_id: found.block.block_id,
            to_question_id: found.question.question_id,
            timestamp: Date.now()
          }
        });
        
        goToQuestion(found.block.block_id, found.question.question_id);
      }
    }
    
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [sortedBlocks, state.activeBlocks, goToQuestion, findQuestionById, state.activeQuestion.block_id, state.dynamicBlocks]);

  const getProgress = useCallback(() => {
    // Filter out invisible blocks from active blocks
    const visibleActiveBlocks = state.activeBlocks
      .map(blockId => [...sortedBlocks, ...state.dynamicBlocks].find(b => b.block_id === blockId))
      .filter(block => block && !block.invisible) as Block[];
    
    // If no visible blocks, return 0
    if (visibleActiveBlocks.length === 0) return 0;
    
    // Calculate the weight of each block (equal contribution)
    const blockWeight = 100 / visibleActiveBlocks.length;
    
    // Calculate the total progress
    let totalProgress = 0;
    
    visibleActiveBlocks.forEach(block => {
      // If block is marked as completed, add full block weight
      if (state.completedBlocks.includes(block.block_id)) {
        totalProgress += blockWeight;
      } else {
        // Otherwise calculate partial contribution based on answered questions
        const totalQuestions = block.questions.length;
        let answeredQuestions = 0;
        
        // Count answered questions in this block
        block.questions.forEach(question => {
          if (state.answeredQuestions.has(question.question_id)) {
            answeredQuestions++;
          }
        });
        
        // Add partial block progress if there are any questions
        if (totalQuestions > 0) {
          const blockProgress = (answeredQuestions / totalQuestions) * blockWeight;
          totalProgress += blockProgress;
        }
      }
    });
    
    // Return rounded progress
    return Math.round(totalProgress);
  }, [state.activeBlocks, state.answeredQuestions, state.completedBlocks, state.dynamicBlocks, sortedBlocks]);

  // Simple auto-save function
  const triggerAutoSave = useCallback(async () => {
    if (!state.simulationId || !formSlug || Object.keys(state.responses).length === 0) {
      return;
    }
    
    // Skip auto-save if manual save is in progress
    if (isManualSavingRef.current) {
      console.log('⏸️ Skipping auto-save - manual save in progress');
      return;
    }
    
    const now = Date.now();
    const timeSinceLastSave = now - lastAutoSaveRef.current;
    
    // Only save if 10+ seconds have passed since last auto-save
    if (timeSinceLastSave < 10000) {
      return;
    }
    
    try {
      const progress = getProgress();
      
      // Serialize formState for auto-save - convert Set to Array like manual save does
      const serializedFormState = {
        ...state,
        answeredQuestions: Array.from(state.answeredQuestions || [])
      };
      
      const result = await autoSave(
        state.simulationId,
        state,
        progress,
        formSlug || 'simulazione-mutuo'
      );
      
      if (result.success) {
        lastAutoSaveRef.current = now;
        console.log('✅ Auto-save successful with', serializedFormState.answeredQuestions.length, 'answered questions');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [state, formSlug, getProgress]);

  // Auto-save only on navigation completion (moved from response changes)
  useEffect(() => {
    const currentQuestionId = state.activeQuestion.question_id;
    const previousQuestionId = previousQuestionIdRef.current;

    // Skip auto-save if manual save is in progress
    if (isManualSavingRef.current) {
      console.log('🚫 Auto-save skipped - manual save in progress');
      return;
    }

    // Only trigger auto-save when user navigates to a new question
    if (previousQuestionId && previousQuestionId !== currentQuestionId && Object.keys(state.responses).length > 0) {
      console.log('🔄 Auto-saving after navigation from', previousQuestionId, 'to', currentQuestionId);
      triggerAutoSave();
    }
  }, [state.activeQuestion.question_id, triggerAutoSave]);

  const getNavigationHistoryFor = useCallback((questionId: string): NavigationHistory | undefined => {
    const sortedHistory = [...state.navigationHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    return sortedHistory.find(item => item.to_question_id === questionId);
  }, [state.navigationHistory]);

  const deleteDynamicBlock = useCallback((blockId: string): boolean => {
    try {
      const blockExists = state.dynamicBlocks.some(b => b.block_id === blockId);
      
      if (!blockExists) {
        console.error(`Il blocco dinamico ${blockId} non esiste`);
        return false;
      }
      
      dispatch({ type: "DELETE_DYNAMIC_BLOCK", blockId });
      return true;
    } catch (error) {
      console.error("Errore nell'eliminazione del blocco dinamico:", error);
      return false;
    }
  }, [state.dynamicBlocks]);
  
  const deleteQuestionResponses = useCallback((questionIds: string[]) => {
    if (!questionIds || questionIds.length === 0) return;
    dispatch({ type: "DELETE_QUESTION_RESPONSES", questionIds });
  }, []);

  // Handle save simulation with smart save service
  const handleSaveSimulation = useCallback(async (contactData: Omit<SaveSimulationData, 'percentage'>): Promise<SaveSimulationResult> => {
    // Set manual saving flag to prevent auto-saves during manual save
    isManualSavingRef.current = true;
    
    try {
      // Calculate current progress percentage
      const percentage = getProgress();

      console.log(`💾 Starting manual save for simulation: ${state.simulationId}, percentage: ${percentage}%`);

      const result = await manualSave(
        state.simulationId,
        state,
        percentage,
        formSlug || 'simulazione-mutuo',
        contactData
      );

      if (result.success) {
        // Store contact info and update resume metadata with simulation ID
        localStorage.setItem('contactInfo', JSON.stringify(contactData));
        localStorage.setItem('resumeMetadata', JSON.stringify({
          resumeCode: result.resumeCode,
          simulationId: state.simulationId,
          contactInfo: contactData,
          isFromResume: true
        }));

        // Update session type to resumed for future saves (after manual save flag is cleared)
        setTimeout(() => {
          dispatch({ type: "SET_FORM_STATE", state: { sessionType: 'resumed' as SessionType } });
        }, 100);

        console.log('✅ Manual save completed successfully');
        return {
          success: true,
          resumeCode: result.resumeCode
        };
      } else {
        console.error('❌ Manual save failed:', result.error);
        return {
          success: false,
          error: result.error || "Errore durante il salvataggio della simulazione"
        };
      }
    } catch (error) {
      console.error("Error in manual save:", error);
      return {
        success: false,
        error: "Errore durante il salvataggio della simulazione"
      };
    } finally {
      // Clear manual saving flag
      isManualSavingRef.current = false;
    }
  }, [state, formSlug, getProgress, manualSave]);

  // Handle resume simulation
  const handleResumeSimulation = useCallback(async (resumeCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const resumeResult = await resumeSimulation(resumeCode);
      
      if (resumeResult.success && resumeResult.data) {
        // Convert answeredQuestions array back to Set and ensure simulation ID tracking
        const formStateWithSet = {
          ...resumeResult.data.formState,
          simulationId: resumeResult.data.simulationId || state.simulationId, // Use retrieved or current
          sessionType: 'resumed' as SessionType,
          answeredQuestions: new Set(resumeResult.data.formState.answeredQuestions || [])
        };
        
        dispatch({ type: "SET_FORM_STATE", state: formStateWithSet });
        
        // Store contact info and resume metadata with simulation ID
        localStorage.setItem('contactInfo', JSON.stringify(resumeResult.data.contactInfo));
        localStorage.setItem('resumeMetadata', JSON.stringify({
          resumeCode,
          simulationId: resumeResult.data.simulationId,
          contactInfo: resumeResult.data.contactInfo,
          isFromResume: true
        }));
        
        console.log(`🔄 Resumed simulation with ID: ${resumeResult.data.simulationId}`);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: resumeResult.error || "Errore durante il caricamento" 
        };
      }
    } catch (error) {
      console.error("Error resuming simulation:", error);
      return {
        success: false,
        error: "Errore imprevisto durante il caricamento della simulazione"
      };
    }
  }, []);

  return (
    <FormContext.Provider
      value={{
        state,
        blocks: [
          ...sortedBlocks,
          ...state.dynamicBlocks
        ].sort((a, b) => a.priority - b.priority), 
        formSlug,
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
        removeBlockFromCompleted,
        isQuestionPendingRemoval,
        handleSaveSimulation,
        handleResumeSimulation
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
