
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Placeholder, SelectPlaceholder, InputPlaceholder, MultiBlockManagerPlaceholder } from '@/types/form';
import { useFlowEdit } from '@/contexts/FlowEditContext';

interface PlaceholderEditDialogProps {
  open: boolean;
  placeholder: Placeholder;
  placeholderKey: string;
  questionId: string;
  onClose: () => void;
}

export const PlaceholderEditDialog: React.FC<PlaceholderEditDialogProps> = ({
  open,
  placeholder,
  placeholderKey,
  questionId,
  onClose
}) => {
  const { state, updateBlockData } = useFlowEdit();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (placeholder.type === 'select') {
      const selectPlaceholder = placeholder as SelectPlaceholder;
      setFormData({
        type: 'select',
        multiple: selectPlaceholder.multiple || false,
        placeholder_label: selectPlaceholder.placeholder_label || ''
      });
    } else if (placeholder.type === 'input') {
      const inputPlaceholder = placeholder as InputPlaceholder;
      setFormData({
        type: 'input',
        input_type: inputPlaceholder.input_type,
        placeholder_label: inputPlaceholder.placeholder_label,
        input_validation: inputPlaceholder.input_validation
      });
    } else if (placeholder.type === 'MultiBlockManager') {
      const managerPlaceholder = placeholder as MultiBlockManagerPlaceholder;
      setFormData({
        type: 'MultiBlockManager',
        placeholder_label: managerPlaceholder.placeholder_label,
        add_block_label: managerPlaceholder.add_block_label,
        blockBlueprint: managerPlaceholder.blockBlueprint
      });
    }
  }, [placeholder]);

  const handleSave = () => {
    const updatedQuestions = state.blockData.questions.map(q => {
      if (q.question_id === questionId) {
        const updatedPlaceholders = { ...q.placeholders };
        
        if (placeholder.type === 'select') {
          updatedPlaceholders[placeholderKey] = {
            ...placeholder,
            multiple: formData.multiple,
            placeholder_label: formData.placeholder_label
          } as SelectPlaceholder;
        } else if (placeholder.type === 'input') {
          updatedPlaceholders[placeholderKey] = {
            ...placeholder,
            input_type: formData.input_type,
            placeholder_label: formData.placeholder_label,
            input_validation: formData.input_validation
          } as InputPlaceholder;
        } else if (placeholder.type === 'MultiBlockManager') {
          updatedPlaceholders[placeholderKey] = {
            ...placeholder,
            placeholder_label: formData.placeholder_label,
            add_block_label: formData.add_block_label,
            blockBlueprint: formData.blockBlueprint
          } as MultiBlockManagerPlaceholder;
        }
        
        return { ...q, placeholders: updatedPlaceholders };
      }
      return q;
    });

    updateBlockData({ questions: updatedQuestions });
    onClose();
  };

  const renderSelectFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="placeholder_label">Label Placeholder</Label>
        <Input
          id="placeholder_label"
          value={formData.placeholder_label || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, placeholder_label: e.target.value }))}
          placeholder="Etichetta del placeholder..."
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="multiple">Selezione Multipla</Label>
        <Switch
          id="multiple"
          checked={formData.multiple || false}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, multiple: checked }))}
        />
      </div>
    </>
  );

  const renderInputFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="input_type">Tipo Input</Label>
        <Select
          value={formData.input_type || 'text'}
          onValueChange={(value) => setFormData(prev => ({ ...prev, input_type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Testo</SelectItem>
            <SelectItem value="number">Numero</SelectItem>
            <SelectItem value="date">Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="placeholder_label">Label Placeholder</Label>
        <Input
          id="placeholder_label"
          value={formData.placeholder_label || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, placeholder_label: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="input_validation">Validazione</Label>
        <Select
          value={formData.input_validation || 'free_text'}
          onValueChange={(value) => setFormData(prev => ({ ...prev, input_validation: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="euro">Euro</SelectItem>
            <SelectItem value="month">Mese</SelectItem>
            <SelectItem value="year">Anno</SelectItem>
            <SelectItem value="age">Età</SelectItem>
            <SelectItem value="city">Città</SelectItem>
            <SelectItem value="cap">CAP</SelectItem>
            <SelectItem value="free_text">Testo Libero</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderMultiBlockManagerFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="placeholder_label">Label Placeholder</Label>
        <Input
          id="placeholder_label"
          value={formData.placeholder_label || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, placeholder_label: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="add_block_label">Label Aggiungi Blocco</Label>
        <Input
          id="add_block_label"
          value={formData.add_block_label || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, add_block_label: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blockBlueprint">Blueprint Blocco</Label>
        <Input
          id="blockBlueprint"
          value={formData.blockBlueprint || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, blockBlueprint: e.target.value }))}
        />
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifica Placeholder: {placeholderKey}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo Placeholder</Label>
            <div className="p-2 bg-gray-100 rounded text-sm font-mono">
              {placeholder.type}
            </div>
          </div>

          {placeholder.type === 'select' && renderSelectFields()}
          {placeholder.type === 'input' && renderInputFields()}
          {placeholder.type === 'MultiBlockManager' && renderMultiBlockManagerFields()}
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
