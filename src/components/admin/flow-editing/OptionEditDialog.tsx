
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceholderOption } from '@/types/form';
import { useFlowEdit } from '@/contexts/FlowEditContext';

interface OptionEditDialogProps {
  open: boolean;
  option: PlaceholderOption;
  optionIndex: number;
  placeholderKey: string;
  questionId: string;
  onClose: () => void;
}

export const OptionEditDialog: React.FC<OptionEditDialogProps> = ({
  open,
  option,
  optionIndex,
  placeholderKey,
  questionId,
  onClose
}) => {
  const { state, updateBlockData } = useFlowEdit();
  const [formData, setFormData] = useState({
    id: option.id,
    label: option.label,
    leads_to: option.leads_to,
    add_block: option.add_block || ''
  });

  useEffect(() => {
    setFormData({
      id: option.id,
      label: option.label,
      leads_to: option.leads_to,
      add_block: option.add_block || ''
    });
  }, [option]);

  const handleSave = () => {
    const updatedQuestions = state.blockData.questions.map(q => {
      if (q.question_id === questionId) {
        const placeholder = q.placeholders[placeholderKey];
        if (placeholder && placeholder.type === 'select') {
          const updatedOptions = [...(placeholder.options || [])];
          updatedOptions[optionIndex] = {
            ...formData,
            add_block: formData.add_block || undefined
          };

          const updatedPlaceholder = {
            ...placeholder,
            options: updatedOptions
          };

          return {
            ...q,
            placeholders: {
              ...q.placeholders,
              [placeholderKey]: updatedPlaceholder
            }
          };
        }
      }
      return q;
    });

    updateBlockData({ questions: updatedQuestions });
    onClose();
  };

  // Get available questions for leads_to
  const availableQuestions = state.blockData.questions.map(q => ({
    id: q.question_id,
    label: `${q.question_number} - ${q.question_text.substring(0, 50)}...`
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifica Opzione</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="option_id">ID Opzione</Label>
            <Input
              id="option_id"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="ID univoco per l'opzione"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="option_label">Label Opzione</Label>
            <Input
              id="option_label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Testo mostrato all'utente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leads_to">Porta a</Label>
            <Select
              value={formData.leads_to}
              onValueChange={(value) => setFormData(prev => ({ ...prev, leads_to: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona destinazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next_block">Blocco Successivo</SelectItem>
                <SelectItem value="stop_flow">Ferma Flusso</SelectItem>
                {availableQuestions.map(q => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add_block">Aggiungi Blocco (opzionale)</Label>
            <Input
              id="add_block"
              value={formData.add_block}
              onChange={(e) => setFormData(prev => ({ ...prev, add_block: e.target.value }))}
              placeholder="ID del blocco da aggiungere"
            />
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
      </DialogContent>
    </Dialog>
  );
};
