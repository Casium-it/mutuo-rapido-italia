import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Block,
  FormResponse,
  NavigationHistory,
  BlockActivationSource,
  PendingRemoval,
  FormState,
} from '@/types/form';

interface FormContextType {
  blocks: Block[];
  activeBlocks: string[];
  activeQuestion: {
    block_id: string;
    question_id: string;
  };
  responses: FormResponse;
  answeredQuestions: Set<string>;
  isNavigating?: boolean;
  navigationHistory: NavigationHistory[];
  dynamicBlocks: Block[];
  blockActivations: Record<string, BlockActivationSource[]>;
  completedBlocks: string[];
  pendingRemovals: PendingRemoval[];
  handleBlockActivation: (
    blockId: string,
    questionId: string,
    placeholderId: string
  ) => void;
  handleBlockCompletion: (blockId: string) => void;
  handleResponseChange: (
    questionId: string,
    placeholderKey: string,
    value: string | string[]
  ) => void;
  handleActiveQuestionChange: (blockId: string, questionId: string) => void;
  handleBlockRemoval: (questionId: string, blockId: string) => void;
  addDynamicBlock: (block: Block) => void;
  removeDynamicBlock: (blockId: string) => void;
  resetForm: () => void;
  linkedFormData?: any; // Add linked form data
}

interface FormProviderProps {
  children: React.ReactNode;
  blocks: Block[];
  linkedFormData?: any; // Add linked form data prop
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<FormProviderProps> = ({ 
  children, 
  blocks,
  linkedFormData 
}) => {
  const [activeBlocks, setActiveBlocks] = useState<string[]>(
    blocks
      .filter((block) => block.default_active)
      .map((block) => block.block_id)
  );
  const [activeQuestion, setActiveQuestion] = useState<{
    block_id: string;
    question_id: string;
  }>({
    block_id: blocks.find((block) => block.default_active)?.block_id || blocks[0].block_id,
    question_id: blocks.find((block) => block.default_active)?.questions[0]
      ?.question_id || blocks[0].questions[0].question_id,
  });
  const [responses, setResponses] = useState<FormResponse>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );
  const [navigationHistory, setNavigationHistory] = useState<
    NavigationHistory[]
  >([]);
  const [dynamicBlocks, setDynamicBlocks] = useState<Block[]>([]);
  const [blockActivations, setBlockActivations] = useState<
    Record<string, BlockActivationSource[]>
  >({});
  const [completedBlocks, setCompletedBlocks] = useState<string[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<PendingRemoval[]>([]);

  const handleBlockActivation = useCallback(
    (blockId: string, questionId: string, placeholderId: string) => {
      setBlockActivations((prevActivations) => {
        const newActivation = { questionId, placeholderId };
        return {
          ...prevActivations,
          [blockId]: [...(prevActivations[blockId] || []), newActivation],
        };
      });
      setActiveBlocks((prevActiveBlocks) => {
        if (prevActiveBlocks.includes(blockId)) {
          return prevActiveBlocks;
        }
        return [...prevActiveBlocks, blockId];
      });
    },
    []
  );

  const handleBlockCompletion = useCallback((blockId: string) => {
    setCompletedBlocks((prevCompletedBlocks) => {
      if (prevCompletedBlocks.includes(blockId)) {
        return prevCompletedBlocks;
      }
      return [...prevCompletedBlocks, blockId];
    });
  }, []);

  const handleResponseChange = useCallback(
    (
      questionId: string,
      placeholderKey: string,
      value: string | string[]
    ) => {
      setResponses((prevResponses) => {
        const updatedResponses = {
          ...prevResponses,
          [questionId]: {
            ...prevResponses[questionId],
            [placeholderKey]: value,
          },
        };
        return updatedResponses;
      });

      setAnsweredQuestions((prevAnsweredQuestions) => {
        const newAnsweredQuestions = new Set(prevAnsweredQuestions);
        newAnsweredQuestions.add(questionId);
        return newAnsweredQuestions;
      });
    },
    []
  );

  const handleActiveQuestionChange = useCallback(
    (blockId: string, questionId: string) => {
      setActiveQuestion({ block_id: blockId, question_id: questionId });
      setNavigationHistory((prevHistory) => [
        ...prevHistory,
        {
          from_block_id: prevHistory.length > 0 ? prevHistory.slice(-1)[0].to_block_id : 'start',
          from_question_id: prevHistory.length > 0 ? prevHistory.slice(-1)[0].to_question_id : 'start',
          to_block_id: blockId,
          to_question_id: questionId,
          timestamp: Date.now(),
        },
      ]);
    },
    []
  );

  const handleBlockRemoval = useCallback((questionId: string, blockId: string) => {
    setPendingRemovals((prevPendingRemovals) => [
      ...prevPendingRemovals,
      { questionId, blockId, timestamp: Date.now() },
    ]);

    setTimeout(() => {
      setPendingRemovals((currentPendingRemovals) =>
        currentPendingRemovals.filter(
          (removal) => removal.questionId !== questionId
        )
      );
      setActiveBlocks((prevActiveBlocks) =>
        prevActiveBlocks.filter((activeBlockId) => activeBlockId !== blockId)
      );
    }, 3000);
  }, []);

  const addDynamicBlock = useCallback((block: Block) => {
    setDynamicBlocks((prevDynamicBlocks) => [...prevDynamicBlocks, block]);
  }, []);

  const removeDynamicBlock = useCallback((blockId: string) => {
    setDynamicBlocks((prevDynamicBlocks) =>
      prevDynamicBlocks.filter((block) => block.block_id !== blockId)
    );
    setActiveBlocks((prevActiveBlocks) =>
      prevActiveBlocks.filter((activeBlockId) => activeBlockId !== blockId)
    );
  }, []);

  const resetForm = useCallback(() => {
    setActiveBlocks(
      blocks
        .filter((block) => block.default_active)
        .map((block) => block.block_id)
    );
    setActiveQuestion({
      block_id: blocks.find((block) => block.default_active)?.block_id || blocks[0].block_id,
      question_id: blocks.find((block) => block.default_active)?.questions[0]
        ?.question_id || blocks[0].questions[0].question_id,
    });
    setResponses({});
    setAnsweredQuestions(new Set());
    setNavigationHistory([]);
    setDynamicBlocks([]);
    setBlockActivations({});
    setCompletedBlocks([]);
    setPendingRemovals([]);
  }, [blocks]);

  useEffect(() => {
    console.log('activeBlocks', activeBlocks);
  }, [activeBlocks]);

  const value: FormContextType = {
    blocks,
    activeBlocks,
    activeQuestion,
    responses,
    answeredQuestions,
    navigationHistory,
    dynamicBlocks,
    blockActivations,
    completedBlocks,
    pendingRemovals,
    handleBlockActivation,
    handleBlockCompletion,
    handleResponseChange,
    handleActiveQuestionChange,
    handleBlockRemoval,
    addDynamicBlock,
    removeDynamicBlock,
    resetForm,
    linkedFormData,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
