import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { Block } from "@/types/form";
import { v4 as uuidv4 } from 'uuid';
import { allBlocks } from "@/data/blocks";

interface FormContextProps {
  activeBlocks: Record<string, boolean>;
  currentBlock: string;
  currentQuestions: Record<string, string>;
  responses: Record<string, any>;
  copiedBlocks: Record<string, Block>;
  setActiveBlocks: (blocks: Record<string, boolean>) => void;
  setCurrentBlock: (blockId: string) => void;
  setCurrentQuestions: (questions: Record<string, string>) => void;
  setResponses: (responses: Record<string, any>) => void;
  getBlockById: (blockId: string) => Block | undefined;
  getAllBlocks: () => Block[];
  addCopiedBlock: (block: Block) => void;
  removeCopiedBlock: (blockId: string) => void;
  updateCopiedBlock: (blockId: string, updates: Partial<Block>) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

interface FormProviderProps {
  children: React.ReactNode;
  blocks?: Block[]; // Optional blocks prop for database-driven forms
}

export const FormProvider: React.FC<FormProviderProps> = ({ children, blocks }) => {
  // Use provided blocks or fall back to hard-coded blocks
  const formBlocks = blocks || allBlocks;
  
  console.log('FormProvider: Initializing with blocks:', {
    blocksCount: formBlocks.length,
    source: blocks ? 'provided' : 'hardcoded',
    firstBlock: formBlocks[0]?.block_id
  });

  const [activeBlocks, setActiveBlocks] = useState<Record<string, boolean>>({});
  const [currentBlock, setCurrentBlock] = useState<string>("");
  const [currentQuestions, setCurrentQuestions] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [copiedBlocks, setCopiedBlocks] = useState<Record<string, Block>>({});

  // Initialize form state with provided or default blocks
  const initializeFormState = useCallback(() => {
    console.log('FormProvider: Initializing form state with blocks count:', formBlocks.length);
    
    const initialActiveBlocks: Record<string, boolean> = {};
    const initialCurrentQuestions: Record<string, string> = {};
    const initialResponses: Record<string, any> = {};

    formBlocks.forEach(block => {
      initialActiveBlocks[block.block_id] = block.default_active || false;
      if (block.questions.length > 0) {
        initialCurrentQuestions[block.block_id] = block.questions[0].question_id;
      }
    });

    setActiveBlocks(initialActiveBlocks);
    setCurrentQuestions(initialCurrentQuestions);
    setResponses(initialResponses);
    setCopiedBlocks({});
    setCurrentBlock(formBlocks.find(block => block.default_active)?.block_id || formBlocks[0]?.block_id || '');
    
    console.log('FormProvider: Form state initialized', {
      activeBlocks: Object.keys(initialActiveBlocks).length,
      currentBlock: formBlocks.find(block => block.default_active)?.block_id || formBlocks[0]?.block_id
    });
  }, [formBlocks]);

  useEffect(() => {
    initializeFormState();
  }, [initializeFormState]);

  const getBlockById = useCallback((blockId: string): Block | undefined => {
    // Handle copied blocks
    if (blockId.includes('{copyNumber}')) {
      const copiedBlock = Object.values(copiedBlocks).find(block => block.block_id === blockId);
      if (copiedBlock) return copiedBlock;
    }
    
    return formBlocks.find(block => block.block_id === blockId);
  }, [formBlocks, copiedBlocks]);

  const getAllBlocks = useCallback((): Block[] => {
    return [...formBlocks, ...Object.values(copiedBlocks)];
  }, [formBlocks, copiedBlocks]);

  const addCopiedBlock = useCallback((block: Block) => {
    const newBlockId = `${block.block_id.split('{')[0]}{copyNumber}${uuidv4()}`;
    const newBlock = { ...block, block_id: newBlockId, multiBlock: true, invisible: true };
    setCopiedBlocks(prev => ({ ...prev, [newBlockId]: newBlock }));
  }, []);

  const removeCopiedBlock = useCallback((blockId: string) => {
    setCopiedBlocks(prev => {
      const { [blockId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const updateCopiedBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setCopiedBlocks(prev => {
      const blockToUpdate = prev[blockId];
      if (!blockToUpdate) return prev;
      const updatedBlock = { ...blockToUpdate, ...updates };
      return { ...prev, [blockId]: updatedBlock };
    });
  }, []);

  const resetForm = useCallback(() => {
    initializeFormState();
  }, [initializeFormState]);

  const value: FormContextProps = {
    activeBlocks,
    currentBlock,
    currentQuestions,
    responses,
    copiedBlocks,
    setActiveBlocks,
    setCurrentBlock,
    setCurrentQuestions,
    setResponses,
    getBlockById,
    getAllBlocks,
    addCopiedBlock,
    removeCopiedBlock,
    updateCopiedBlock,
    resetForm,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};
