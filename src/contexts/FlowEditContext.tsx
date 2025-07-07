import React, { createContext, useContext, useState, useCallback } from 'react';
import { Block, Question, Placeholder, PlaceholderOption } from '@/types/form';
import { validateLeadsTo, ValidationResult } from '@/utils/blockValidation';

export type EditableElementType = 'question' | 'placeholder' | 'option';

export interface EditableElement {
  type: EditableElementType;
  questionId: string;
  placeholderKey?: string;
  optionIndex?: number;
}

export interface Change {
  id: string;
  type: 'question' | 'placeholder' | 'option';
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

interface FlowEditState {
  editingElement: EditableElement | null;
  blockData: Block;
  changes: Change[];
  validationErrors: ValidationError[];
  isAutoSaving: boolean;
  hasUnsavedChanges: boolean;
  preSaveValidation: ValidationResult | null;
}

interface FlowEditContextType {
  state: FlowEditState;
  startEditing: (element: EditableElement) => void;
  stopEditing: () => void;
  updateBlockData: (updates: Partial<Block>) => void;
  validateBeforeSave: (allBlocks: any[]) => ValidationResult;
  saveChanges: () => Promise<void>;
  saveWithoutValidation: () => Promise<void>;
  undoLastChange: () => void;
  canUndo: boolean;
}

const FlowEditContext = createContext<FlowEditContextType | null>(null);

export const useFlowEdit = () => {
  const context = useContext(FlowEditContext);
  if (!context) {
    throw new Error('useFlowEdit must be used within a FlowEditProvider');
  }
  return context;
};

interface FlowEditProviderProps {
  children: React.ReactNode;
  initialBlock: Block;
  onSave: (block: Block) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export const FlowEditProvider: React.FC<FlowEditProviderProps> = ({
  children,
  initialBlock,
  onSave,
  onRefresh
}) => {
  const [state, setState] = useState<FlowEditState>({
    editingElement: null,
    blockData: initialBlock,
    changes: [],
    validationErrors: [],
    isAutoSaving: false,
    hasUnsavedChanges: false,
    preSaveValidation: null
  });

  const startEditing = useCallback((element: EditableElement) => {
    setState(prev => ({
      ...prev,
      editingElement: element,
      validationErrors: []
    }));
  }, []);

  const stopEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      editingElement: null,
      validationErrors: []
    }));
  }, []);

  const updateBlockData = useCallback((updates: Partial<Block>) => {
    setState(prev => {
      const newBlockData = { ...prev.blockData, ...updates };
      
      // Create change record
      const change: Change = {
        id: Date.now().toString(),
        type: 'question', // This will be more specific in real implementation
        path: 'block',
        oldValue: prev.blockData,
        newValue: newBlockData,
        timestamp: Date.now()
      };

      return {
        ...prev,
        blockData: newBlockData,
        changes: [...prev.changes, change],
        hasUnsavedChanges: true
      };
    });
  }, []);

  const validateBeforeSave = useCallback((allBlocks: any[]): ValidationResult => {
    // Cast the block to the expected interface type for validation
    const blockForValidation = {
      ...state.blockData,
      form_id: '',
      form_title: '',
      form_slug: '',
      form_type: ''
    };
    
    return validateLeadsTo(blockForValidation, allBlocks);
  }, [state.blockData]);

  const saveWithoutValidation = useCallback(async () => {
    setState(prev => ({ ...prev, isAutoSaving: true }));
    
    try {
      await onSave(state.blockData);
      setState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        isAutoSaving: false,
        preSaveValidation: null
      }));
      
      // Refresh data after successful save
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      setState(prev => ({
        ...prev,
        isAutoSaving: false,
        validationErrors: [{ field: 'general', message: 'Errore nel salvataggio' }]
      }));
    }
  }, [state.blockData, onSave, onRefresh]);

  const saveChanges = useCallback(async () => {
    // This will now just trigger validation check, actual save will be handled by parent
    setState(prev => ({ ...prev, isAutoSaving: false }));
  }, []);

  const undoLastChange = useCallback(() => {
    setState(prev => {
      if (prev.changes.length === 0) return prev;
      
      const lastChange = prev.changes[prev.changes.length - 1];
      return {
        ...prev,
        blockData: lastChange.oldValue,
        changes: prev.changes.slice(0, -1),
        hasUnsavedChanges: prev.changes.length > 1
      };
    });
  }, []);

  const canUndo = state.changes.length > 0;

  const contextValue: FlowEditContextType = {
    state,
    startEditing,
    stopEditing,
    updateBlockData,
    validateBeforeSave,
    saveChanges,
    saveWithoutValidation,
    undoLastChange,
    canUndo
  };

  return (
    <FlowEditContext.Provider value={contextValue}>
      {children}
    </FlowEditContext.Provider>
  );
};
