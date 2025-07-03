
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Question, Placeholder } from '@/types/form';
import { useFlowEdit } from '@/contexts/FlowEditContext';
import { Plus, Trash2 } from 'lucide-react';
import { CreatePlaceholderDialog } from './CreatePlaceholderDialog';

interface QuestionEditDialogProps {
  open: boolean;
  question: Question;
  onClose: () => void;
}

export const QuestionEditDialog: React.FC<QuestionEditDialogProps> = ({
  open,
  question,
  onClose
}) => {
  const { state, updateBlockData } = useFlowEdit();
  const [createPlaceholderDialog, setCreatePlaceholderDialog] = useState(false);
  const [formData, setFormData] = useState({
    question_text: question.question_text,
    question_notes: question.question_notes || '',
    endOfForm: question.endOfForm || false,
    skippableWithNotSure: question.skippableWithNotSure || false,
    leads_to_placeholder_priority: question.leads_to_placeholder_priority,
    inline: question.inline || false
  });

  useEffect(() => {
    setFormData({
      question_text: question.question_text,
      question_notes: question.question_notes || '',
      endOfForm: question.endOfForm || false,
      skippableWithNotSure: question.skippableWithNotSure || false,
      leads_to_placeholder_priority: question.leads_to_placeholder_priority,
      inline: question.inline || false
    });
  }, [question]);

  const handleSave = () => {
    const updatedQuestions = state.blockData.questions.map(q => 
      q.question_id === question.question_id 
        ? { ...q, ...formData }
        : q
    );

    updateBlockData({ questions: updatedQuestions });
    onClose();
  };

  const handleDeletePlaceholder = (placeholderKey: string) => {
    const updatedQuestions = state.blockData.questions.map(q => {
      if (q.question_id === question.question_id) {
        const { [placeholderKey]: deleted, ...remainingPlaceholders } = q.placeholders;
        return { ...q, placeholders: remainingPlaceholders };
      }
      return q;
    });

    updateBlockData({ questions: updatedQuestions });
  };

  const placeholderOptions = Object.keys(question.placeholders || {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Domanda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question_text">Testo della Domanda</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              rows={3}
              className="min-h-[80px]"
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

          {/* Placeholder Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priorità Placeholder</Label>
            <Select
              value={formData.leads_to_placeholder_priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, leads_to_placeholder_priority: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona placeholder prioritario" />
              </SelectTrigger>
              <SelectContent>
                {placeholderOptions.map(key => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Placeholders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Placeholders</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreatePlaceholderDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Aggiungi Placeholder
              </Button>
            </div>

            {placeholderOptions.length > 0 ? (
              <div className="space-y-2">
                {placeholderOptions.map(key => {
                  const placeholder = question.placeholders[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{key}</Badge>
                        <Badge variant="secondary">{placeholder.type}</Badge>
                        {placeholder.type === 'select' && (
                          <span className="text-sm text-gray-600">
                            ({placeholder.options?.length || 0} opzioni)
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlaceholder(key)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                Nessun placeholder configurato
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave} className="bg-[#245C4F] hover:bg-[#1e4f44]">
            Salva Modifiche
          </Button>
        </DialogFooter>

        {createPlaceholderDialog && (
          <CreatePlaceholderDialog
            open={createPlaceholderDialog}
            questionId={question.question_id}
            onClose={() => setCreatePlaceholderDialog(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
