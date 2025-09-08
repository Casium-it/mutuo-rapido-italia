
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Placeholder, SelectPlaceholder, InputPlaceholder, MultiBlockManagerPlaceholder, PlaceholderOption } from '@/types/form';
import { useFlowEdit } from '@/contexts/FlowEditContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

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
  const [newOptionForm, setNewOptionForm] = useState({
    id: '',
    label: '',
    leads_to: 'next_block',
    add_block: ''
  });
  const [showAddOption, setShowAddOption] = useState(false);

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
        input_validation: inputPlaceholder.input_validation,
        leads_to: inputPlaceholder.leads_to || 'next_block'
      });
    } else if (placeholder.type === 'MultiBlockManager') {
      const managerPlaceholder = placeholder as MultiBlockManagerPlaceholder;
      setFormData({
        type: 'MultiBlockManager',
        placeholder_label: managerPlaceholder.placeholder_label,
        add_block_label: managerPlaceholder.add_block_label,
        blockBlueprint: managerPlaceholder.blockBlueprint,
        leads_to: managerPlaceholder.leads_to || 'next_block'
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
            input_validation: formData.input_validation,
            leads_to: formData.leads_to
          } as InputPlaceholder;
        } else if (placeholder.type === 'MultiBlockManager') {
          updatedPlaceholders[placeholderKey] = {
            ...placeholder,
            placeholder_label: formData.placeholder_label,
            add_block_label: formData.add_block_label,
            blockBlueprint: formData.blockBlueprint,
            leads_to: formData.leads_to
          } as MultiBlockManagerPlaceholder;
        }
        
        return { ...q, placeholders: updatedPlaceholders };
      }
      return q;
    });

    updateBlockData({ questions: updatedQuestions });
    onClose();
  };

  const handleAddOption = () => {
    if (!newOptionForm.id.trim() || !newOptionForm.label.trim()) {
      return; // Basic validation
    }

    const updatedQuestions = state.blockData.questions.map(q => {
      if (q.question_id === questionId) {
        const updatedPlaceholder = { ...q.placeholders[placeholderKey] };
        if (updatedPlaceholder.type === 'select') {
          const selectPlaceholder = updatedPlaceholder as SelectPlaceholder;
          selectPlaceholder.options = [
            ...(selectPlaceholder.options || []),
            {
              id: newOptionForm.id,
              label: newOptionForm.label,
              leads_to: newOptionForm.leads_to,
              add_block: newOptionForm.add_block || undefined
            }
          ];
        }
        
        return {
          ...q,
          placeholders: {
            ...q.placeholders,
            [placeholderKey]: updatedPlaceholder
          }
        };
      }
      return q;
    });

    updateBlockData({ questions: updatedQuestions });
    
    // Reset form
    setNewOptionForm({
      id: '',
      label: '',
      leads_to: 'next_block',
      add_block: ''
    });
    setShowAddOption(false);
  };

  const handleDeleteOption = (optionIndex: number) => {
    const updatedQuestions = state.blockData.questions.map(q => {
      if (q.question_id === questionId) {
        const updatedPlaceholder = { ...q.placeholders[placeholderKey] };
        if (updatedPlaceholder.type === 'select') {
          const selectPlaceholder = updatedPlaceholder as SelectPlaceholder;
          selectPlaceholder.options = selectPlaceholder.options?.filter((_, index) => index !== optionIndex);
        }
        
        return {
          ...q,
          placeholders: {
            ...q.placeholders,
            [placeholderKey]: updatedPlaceholder
          }
        };
      }
      return q;
    });

    updateBlockData({ questions: updatedQuestions });
  };

  // Get available questions for leads_to
  const availableQuestions = state.blockData.questions.map(q => ({
    id: q.question_id,
    label: `${q.question_number} - ${q.question_text.substring(0, 30)}...`
  }));

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

      {/* Options Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Opzioni</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddOption(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Opzione
          </Button>
        </div>

        {(placeholder as SelectPlaceholder).options && (placeholder as SelectPlaceholder).options!.length > 0 ? (
          <div className="space-y-2">
            {(placeholder as SelectPlaceholder).options!.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{option.id}</Badge>
                    →
                    <Badge className={`text-xs ${
                      option.leads_to === 'next_block' 
                        ? 'bg-orange-100 text-orange-600'
                        : option.leads_to === 'stop_flow'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {option.leads_to}
                    </Badge>
                    {option.add_block && (
                      <Badge variant="secondary" className="text-xs">
                        +{option.add_block}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOption(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            Nessuna opzione configurata
          </div>
        )}

        {showAddOption && (
          <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Nuova Opzione</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddOption(false)}
              >
                Annulla
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ID Opzione</Label>
                <Input
                  value={newOptionForm.id}
                  onChange={(e) => setNewOptionForm(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="es: yes, no, maybe"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={newOptionForm.label}
                  onChange={(e) => setNewOptionForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Testo mostrato all'utente"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Porta a</Label>
                <Select
                  value={newOptionForm.leads_to}
                  onValueChange={(value) => setNewOptionForm(prev => ({ ...prev, leads_to: value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
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
              <div className="space-y-1">
                <Label className="text-xs">Aggiungi Blocco (opzionale)</Label>
                <Input
                  value={newOptionForm.add_block}
                  onChange={(e) => setNewOptionForm(prev => ({ ...prev, add_block: e.target.value }))}
                  placeholder="ID blocco da aggiungere"
                  className="text-sm"
                />
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleAddOption}
              disabled={!newOptionForm.id.trim() || !newOptionForm.label.trim()}
              className="w-full bg-[#245C4F] hover:bg-[#1e4f44]"
            >
              Aggiungi Opzione
            </Button>
          </div>
        )}
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

      <div className="space-y-2">
        <Label htmlFor="leads_to">Porta a</Label>
        <Select
          value={formData.leads_to || 'next_block'}
          onValueChange={(value) => setFormData(prev => ({ ...prev, leads_to: value }))}
        >
          <SelectTrigger>
            <SelectValue />
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

      <div className="space-y-2">
        <Label htmlFor="leads_to">Porta a</Label>
        <Select
          value={formData.leads_to || 'next_block'}
          onValueChange={(value) => setFormData(prev => ({ ...prev, leads_to: value }))}
        >
          <SelectTrigger>
            <SelectValue />
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
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle>Modifica Placeholder: {placeholderKey}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 pr-1">
          <div className="space-y-4 pr-3">
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
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
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
