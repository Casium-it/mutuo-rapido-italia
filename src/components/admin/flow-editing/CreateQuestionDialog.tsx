import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Question } from '@/types/form';
import { useFlowEdit } from '@/contexts/FlowEditContext';
import { useAdminBlocks } from '@/hooks/useAdminBlocks';

interface CreateQuestionDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateQuestionDialog: React.FC<CreateQuestionDialogProps> = ({
  open,
  onClose
}) => {
  const { state, updateBlockData } = useFlowEdit();
  const { blocks } = useAdminBlocks();
  const [formData, setFormData] = useState({
    question_id: '',
    question_text: '',
    question_notes: '',
    endOfForm: false,
    skippableWithNotSure: false,
    inline: false
  });
  const [questionIdError, setQuestionIdError] = useState('');

  const validateQuestionId = (questionId: string): boolean => {
    if (!questionId.trim()) {
      setQuestionIdError('L\'ID della domanda è obbligatorio');
      return false;
    }
    
    // Check for duplicates across all blocks in the form
    const allQuestionIds: string[] = [];
    blocks.forEach(block => {
      if (block.form_slug === state.blockData.block_id.split('_')[0]) {
        block.questions.forEach(q => allQuestionIds.push(q.question_id));
      }
    });
    
    if (allQuestionIds.includes(questionId)) {
      setQuestionIdError('Questo ID domanda esiste già nel form');
      return false;
    }
    
    setQuestionIdError('');
    return true;
  };

  const generateQuestionId = (): string => {
    const allQuestionIds: string[] = [];
    blocks.forEach(block => {
      if (block.form_slug === state.blockData.block_id.split('_')[0]) {
        block.questions.forEach(q => allQuestionIds.push(q.question_id));
      }
    });
    
    let counter = 1;
    let newId = `${state.blockData.block_id}_q${counter}`;
    
    while (allQuestionIds.includes(newId)) {
      counter++;
      newId = `${state.blockData.block_id}_q${counter}`;
    }
    
    return newId;
  };

  const generateQuestionNumber = (): string => {
    const existingNumbers = state.blockData.questions.map(q => parseInt(q.question_number));
    const maxNumber = Math.max(...existingNumbers, 0);
    return (maxNumber + 1).toString();
  };

  const handleSave = () => {
    if (!formData.question_text.trim()) {
      return; // Basic validation
    }

    const questionId = formData.question_id.trim() || generateQuestionId();
    
    if (!validateQuestionId(questionId)) {
      return;
    }

    const newQuestion: Question = {
      question_id: questionId,
      question_number: generateQuestionNumber(),
      question_text: formData.question_text,
      question_notes: formData.question_notes || undefined,
      block_id: state.blockData.block_id,
      inline: formData.inline,
      endOfForm: formData.endOfForm,
      skippableWithNotSure: formData.skippableWithNotSure,
      leads_to_placeholder_priority: 'main', // Default priority
      placeholders: {} // Start with no placeholders
    };

    const updatedQuestions = [...state.blockData.questions, newQuestion];
    updateBlockData({ questions: updatedQuestions });
    
    // Reset form
    setFormData({
      question_id: '',
      question_text: '',
      question_notes: '',
      endOfForm: false,
      skippableWithNotSure: false,
      inline: false
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crea Nuova Domanda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Question ID */}
          <div className="space-y-2">
            <Label htmlFor="question_id">ID Domanda</Label>
            <Input
              id="question_id"
              value={formData.question_id}
              onChange={(e) => setFormData(prev => ({ ...prev, question_id: e.target.value }))}
              placeholder="Lascia vuoto per generare automaticamente"
              className={questionIdError ? "border-red-500" : ""}
            />
            {questionIdError && (
              <p className="text-sm text-red-600">{questionIdError}</p>
            )}
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question_text">Testo della Domanda *</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              rows={3}
              className="min-h-[80px]"
              placeholder="Inserisci il testo della domanda..."
            />
          </div>

          {/* Question Notes */}
          <div className="space-y-2">
            <Label htmlFor="question_notes">Note (opzionale)</Label>
            <Textarea
              id="question_notes"
              value={formData.question_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, question_notes: e.target.value }))}
              rows={2}
              placeholder="Aggiungi note per questa domanda..."
            />
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inline">Domanda Inline</Label>
              <Switch
                id="inline"
                checked={formData.inline}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inline: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="endOfForm">Fine del Form</Label>
              <Switch
                id="endOfForm"
                checked={formData.endOfForm}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, endOfForm: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="skippableWithNotSure">Saltabile con "Non lo so"</Label>
              <Switch
                id="skippableWithNotSure"
                checked={formData.skippableWithNotSure}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, skippableWithNotSure: checked }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-[#245C4F] hover:bg-[#1e4f44]"
            disabled={!formData.question_text.trim()}
          >
            Crea Domanda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};