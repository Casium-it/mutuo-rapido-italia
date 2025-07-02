import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Block, Question } from '@/types/form';

interface FormState {
  responses: {
    [questionId: string]: {
      [placeholderKey: string]: string | string[] | undefined;
    };
  };
  activeQuestion: {
    block_id: string;
    question_id: string;
  };
  activeBlocks: string[];
  completedBlocks: string[];
  dynamicBlocks: Block[];
  formSlug: string | null;
  answeredQuestions: Set<string>;
}

interface FormContextProps {
  state: FormState;
  blocks: Block[];
  getResponse: (questionId: string, placeholderKey: string) => string | string[] | undefined;
  setResponse: (questionId: string, placeholderKey: string, value: string | string[] | undefined) => void;
  navigateToNextQuestion: (currentQuestionId: string, leadsTo: string) => void;
  goToQuestion: (blockId: string, questionId: string, fromUrl?: boolean) => void;
  addActiveBlock: (blockId: string) => void;
  createDynamicBlock: (blockBlueprintId: string) => string;
  deleteDynamicBlock: (blockId: string) => boolean;
  removeActiveBlock: (blockId: string) => void;
  deleteQuestionResponses: (questionIds: string[]) => void;
  isBlockCompleted: (blockId: string) => boolean;
  markBlockAsCompleted: (blockId: string) => void;
}

interface FormProviderProps {
  children: React.ReactNode;
  blocks: Block[];
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

const initializeState = (blocks: Block[]): FormState => {
  const firstBlock = blocks.find(block => block.block_number === "1");
  const initialBlockId = firstBlock ? firstBlock.block_id : blocks[0].block_id;
  const initialQuestionId = firstBlock ? firstBlock.questions[0].question_id : blocks[0].questions[0].question_id;

  return {
    responses: {},
    activeQuestion: {
      block_id: initialBlockId,
      question_id: initialQuestionId,
    },
    activeBlocks: blocks.filter(block => block.default_active !== false).map(block => block.block_id),
    completedBlocks: [],
    dynamicBlocks: [],
    formSlug: null,
    answeredQuestions: new Set<string>()
  };
};

export const FormProvider: React.FC<FormProviderProps> = ({ children, blocks }) => {
  const [state, setState] = useState<FormState>(() => initializeState(blocks));

  const setResponse = useCallback((questionId: string, placeholderKey: string, value: string | string[] | undefined) => {
    setState(prevState => {
      const newResponses = {
        ...prevState.responses,
        [questionId]: {
          ...prevState.responses[questionId],
          [placeholderKey]: value,
        },
      };

      const answeredQuestions = new Set(prevState.answeredQuestions);
      answeredQuestions.add(questionId);

      return {
        ...prevState,
        responses: newResponses,
        answeredQuestions: answeredQuestions
      };
    });
  }, []);

  const navigateToNextQuestion = useCallback((currentQuestionId: string, leadsTo: string) => {
    setState(prevState => {
      const currentBlock = blocks.find(block =>
        block.questions.some(question => question.question_id === currentQuestionId)
      );

      if (!currentBlock) {
        console.error("Current block not found");
        return prevState;
      }

      let nextQuestion: Question | undefined;

      if (leadsTo === "next_block") {
        const currentBlockIndex = blocks.findIndex(block => block.block_id === currentBlock.block_id);
        const nextBlock = blocks[currentBlockIndex + 1];

        if (nextBlock) {
          nextQuestion = nextBlock.questions[0];
        } else {
          console.warn("No next block found");
          return prevState;
        }
      } else {
        nextQuestion = currentBlock.questions.find(question => question.question_id === leadsTo);
      }

      if (!nextQuestion) {
        console.error("Next question not found");
        return prevState;
      }

      return {
        ...prevState,
        activeQuestion: {
          block_id: currentBlock.block_id,
          question_id: nextQuestion.question_id,
        },
      };
    });
  }, [blocks]);

  const goToQuestion = useCallback((blockId: string, questionId: string, fromUrl: boolean = false) => {
    setState(prevState => ({
      ...prevState,
      activeQuestion: {
        block_id: blockId,
        question_id: questionId,
      },
    }));
  }, []);

  const addActiveBlock = useCallback((blockId: string) => {
    setState(prevState => {
      if (prevState.activeBlocks.includes(blockId)) {
        return prevState;
      }

      return {
        ...prevState,
        activeBlocks: [...prevState.activeBlocks, blockId],
      };
    });
  }, []);

  const createDynamicBlock = useCallback((blockBlueprintId: string): string => {
    // Trova il blueprint del blocco
    const blockBlueprint = blocks.find(block => block.block_id === blockBlueprintId);

    if (!blockBlueprint) {
      console.error(`Block blueprint not found: ${blockBlueprintId}`);
      throw new Error(`Block blueprint not found: ${blockBlueprintId}`);
    }

    // Determina il prossimo numero di copia disponibile
    let copyNumber = 1;
    const blueprintIdRegex = new RegExp(`^${blockBlueprintId}(\\d+)$`);
    const existingCopies = state.dynamicBlocks
      .filter(block => block.block_id.startsWith(blockBlueprintId))
      .map(block => {
        const match = block.block_id.match(blueprintIdRegex);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0)
      .sort((a, b) => a - b);

    if (existingCopies.length > 0) {
      // Trova il primo numero mancante nella sequenza
      for (let i = 0; i < existingCopies.length; i++) {
        if (existingCopies[i] !== i + 1) {
          copyNumber = i + 1;
          break;
        }
      }
      // Se tutti i numeri sono sequenziali, usa il prossimo numero
      if (copyNumber === 1 && existingCopies[existingCopies.length - 1] >= existingCopies.length) {
        copyNumber = existingCopies.length + 1;
      }
    }

    // Crea un nuovo ID per il blocco dinamico
    const newBlockId = `${blockBlueprintId}${copyNumber}`;

    // Clona il blueprint del blocco e aggiorna i valori necessari
    const newBlock: Block = {
      ...blockBlueprint,
      block_id: newBlockId,
      blueprint_id: blockBlueprintId,
      block_number: null,
      title: blockBlueprint.title.replace("{copyNumber}", copyNumber.toString()),
      questions: blockBlueprint.questions.map(question => ({
        ...question,
        question_id: `${newBlockId}-${question.question_id}`,
      })),
    };

    // Aggiorna lo stato con il nuovo blocco dinamico
    setState(prevState => ({
      ...prevState,
      dynamicBlocks: [...prevState.dynamicBlocks, newBlock],
    }));

    return newBlockId;
  }, [blocks, state.dynamicBlocks]);

  const deleteDynamicBlock = useCallback((blockId: string): boolean => {
    setState(prevState => {
      const blockToDelete = prevState.dynamicBlocks.find(block => block.block_id === blockId);

      if (!blockToDelete) {
        console.warn(`Block to delete not found: ${blockId}`);
        return prevState;
      }

      // Rimuovi le risposte associate alle domande del blocco da eliminare
      const questionIdsToDelete = blockToDelete.questions.map(question => question.question_id);
      const updatedResponses = { ...prevState.responses };
      questionIdsToDelete.forEach(questionId => {
        delete updatedResponses[questionId];
      });

      // Filtra i blocchi dinamici per rimuovere quello con l'ID specificato
      const updatedDynamicBlocks = prevState.dynamicBlocks.filter(block => block.block_id !== blockId);

      // Aggiorna lo stato rimuovendo il blocco e le risposte associate
      return {
        ...prevState,
        dynamicBlocks: updatedDynamicBlocks,
        responses: updatedResponses,
      };
    });
    return true;
  }, []);

  const removeActiveBlock = useCallback((blockId: string) => {
    setState(prevState => ({
      ...prevState,
      activeBlocks: prevState.activeBlocks.filter(id => id !== blockId),
    }));
  }, []);

  const deleteQuestionResponses = useCallback((questionIds: string[]) => {
    setState(prevState => {
      const updatedResponses = { ...prevState.responses };
      questionIds.forEach(questionId => {
        delete updatedResponses[questionId];
      });

      return {
        ...prevState,
        responses: updatedResponses,
      };
    });
  }, []);

  const isBlockCompleted = useCallback((blockId: string): boolean => {
    return state.completedBlocks.includes(blockId);
  }, [state.completedBlocks]);

  const markBlockAsCompleted = useCallback((blockId: string): void => {
    setState(prevState => {
      if (prevState.completedBlocks.includes(blockId)) {
        return prevState;
      }

      return {
        ...prevState,
        completedBlocks: [...prevState.completedBlocks, blockId],
      };
    });
  }, []);

  // FIXED: Stabilize getResponse with useMemo to prevent infinite re-renders
  const getResponse = useMemo(() => {
    return (questionId: string, placeholderKey: string): string | string[] | undefined => {
      return state.responses[questionId]?.[placeholderKey];
    };
  }, [state.responses]); // No dependencies - function reference stays stable

  const value = {
    state,
    blocks,
    getResponse,
    setResponse,
    navigateToNextQuestion,
    goToQuestion,
    addActiveBlock,
    createDynamicBlock,
    deleteDynamicBlock,
    removeActiveBlock,
    deleteQuestionResponses,
    isBlockCompleted,
    markBlockAsCompleted
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
