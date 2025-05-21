
import { FormState, FormAction } from "./FormTypes";

// Stato iniziale del form
export const initialState: FormState = {
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
  blockActivations: {}, // Traccia quali domande hanno attivato quali blocchi
  completedBlocks: [] // Traccia i blocchi completati
};

/**
 * Reducer che gestisce le operazioni sullo stato del form
 */
export function formReducer(state: FormState, action: FormAction): FormState {
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
      
      // Traccia quale domanda/placeholder ha attivato questo blocco
      const updatedBlockActivations = { ...state.blockActivations };
      if (action.sourceQuestionId && action.sourcePlaceholderId) {
        if (!updatedBlockActivations[action.block_id]) {
          updatedBlockActivations[action.block_id] = [];
        }
        
        // Controlla se questa fonte di attivazione è già registrata
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
      
      // Trova il blocco per ottenere le sue domande
      const blockToRemove = state.dynamicBlocks.find(b => b.block_id === action.block_id);
      
      // Crea lo stato aggiornato
      const updatedState = {
        ...state,
        activeBlocks: state.activeBlocks.filter(id => id !== action.block_id),
        blockActivations: { ...state.blockActivations }
      };
      
      // Rimuovi da blockActivations
      delete updatedState.blockActivations[action.block_id];
      
      // Se è un blocco statico, dobbiamo pulire risposte e domande risposte manualmente
      if (blockToRemove) {
        const questionIdsToRemove = blockToRemove.questions.map(q => q.question_id);
        
        // Rimuovi risposte
        const updatedResponses = { ...state.responses };
        questionIdsToRemove.forEach(questionId => {
          delete updatedResponses[questionId];
        });
        updatedState.responses = updatedResponses;
        
        // Rimuovi dalle domande risposte
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
      
      // Pulisci anche blockActivations
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
      // Non aggiungere duplicati
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
