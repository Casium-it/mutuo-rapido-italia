import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Placeholder, SelectPlaceholder, InputPlaceholder, MultiBlockManagerPlaceholder, ValidationTypes } from '@/types/form';
import { useFlowEdit } from '@/contexts/FlowEditContext';

interface CreatePlaceholderDialogProps {
  open: boolean;
  questionId: string;
  onClose: () => void;
}

export const CreatePlaceholderDialog: React.FC<CreatePlaceholderDialogProps> = ({
  open,
  questionId,
  onClose
}) => {
  const { state, updateBlockData } = useFlowEdit();
  const [placeholderType, setPlaceholderType] = useState<'select' | 'input' | 'MultiBlockManager'>('select');
  const [placeholderKey, setPlaceholderKey] = useState('');
  const [formData, setFormData] = useState<any>({
    placeholder_label: '',
    multiple: false,
    input_type: 'text',
    input_validation: 'free_text',
    add_block_label: '',
    blockBlueprint: ''
  });

  const generatePlaceholderKey = (type: string): string => {
    const question = state.blockData.questions.find(q => q.question_id === questionId);
    if (!question) return `${type}_1`;

    const existingKeys = Object.keys(question.placeholders);
    let counter = 1;
    let newKey = `${type}_${counter}`;
    
    while (existingKeys.includes(newKey)) {
      counter++;
      newKey = `${type}_${counter}`;
    }
    
    return newKey;
  };

  const handleSave = () => {
    if (!placeholderKey.trim()) {
      return; // Basic validation
    }

    let newPlaceholder: Placeholder;

    switch (placeholderType) {
      case 'select':
        newPlaceholder = {
          type: 'select',
          options: [], // Start with empty options
          multiple: formData.multiple,
          placeholder_label: formData.placeholder_label
        } as SelectPlaceholder;
        break;
      
      case 'input':
        newPlaceholder = {
          type: 'input',
          input_type: formData.input_type,
          placeholder_label: formData.placeholder_label,
          input_validation: formData.input_validation as ValidationTypes
        } as InputPlaceholder;
        break;
      
      case 'MultiBlockManager':
        newPlaceholder = {
          type: 'MultiBlockManager',
          placeholder_label: formData.placeholder_label,
          add_block_label: formData.add_block_label,
          blockBlueprint: formData.blockBlueprint,
          leads_to: 'next_block'
        } as MultiBlockManagerPlaceholder;
        break;
      
      default:
        return;
    }

    const updatedQuestions = state.blockData.questions.map(q => {
      if (q.question_id === questionId) {
        return {
          ...q,
          placeholders: {
            ...q.placeholders,
            [placeholderKey]: newPlaceholder
          }
        };
      }
      return q;
    });

    updateBlockData({ questions: updatedQuestions });
    
    // Reset form
    setPlaceholderKey('');
    setFormData({
      placeholder_label: '',
      multiple: false,
      input_type: 'text',
      input_validation: 'free_text',
      add_block_label: '',
      blockBlueprint: ''
    });
    
    onClose();
  };

  const handleTypeChange = (type: 'select' | 'input' | 'MultiBlockManager') => {
    setPlaceholderType(type);
    setPlaceholderKey(generatePlaceholderKey(type));
  };

  React.useEffect(() => {
    if (open) {
      setPlaceholderKey(generatePlaceholderKey(placeholderType));
    }
  }, [open, placeholderType]);

  const renderTypeSpecificFields = () => {
    switch (placeholderType) {
      case 'select':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="placeholder_label">Label Placeholder</Label>
              <Input
                id="placeholder_label"
                value={formData.placeholder_label}
                onChange={(e) => setFormData(prev => ({ ...prev, placeholder_label: e.target.value }))}
                placeholder="Etichetta del placeholder..."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="multiple">Selezione Multipla</Label>
              <Switch
                id="multiple"
                checked={formData.multiple}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, multiple: checked }))}
              />
            </div>
          </>
        );

      case 'input':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="input_type">Tipo Input</Label>
              <Select
                value={formData.input_type}
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
                value={formData.placeholder_label}
                onChange={(e) => setFormData(prev => ({ ...prev, placeholder_label: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="input_validation">Validazione</Label>
              <Select
                value={formData.input_validation}
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

      case 'MultiBlockManager':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="placeholder_label">Label Placeholder</Label>
              <Input
                id="placeholder_label"
                value={formData.placeholder_label}
                onChange={(e) => setFormData(prev => ({ ...prev, placeholder_label: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add_block_label">Label Aggiungi Blocco</Label>
              <Input
                id="add_block_label"
                value={formData.add_block_label}
                onChange={(e) => setFormData(prev => ({ ...prev, add_block_label: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockBlueprint">Blueprint Blocco</Label>
              <Input
                id="blockBlueprint"
                value={formData.blockBlueprint}
                onChange={(e) => setFormData(prev => ({ ...prev, blockBlueprint: e.target.value }))}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Placeholder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo Placeholder</Label>
            <Select
              value={placeholderType}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select (Opzioni)</SelectItem>
                <SelectItem value="input">Input (Campo testo)</SelectItem>
                <SelectItem value="MultiBlockManager">Multi Block Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder_key">Chiave Placeholder</Label>
            <Input
              id="placeholder_key"
              value={placeholderKey}
              onChange={(e) => setPlaceholderKey(e.target.value)}
              placeholder="Es: main, secondary, etc."
            />
          </div>

          {renderTypeSpecificFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-[#245C4F] hover:bg-[#1e4f44]"
            disabled={!placeholderKey.trim()}
          >
            Crea Placeholder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};