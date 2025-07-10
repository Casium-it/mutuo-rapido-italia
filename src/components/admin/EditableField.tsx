
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableField({ label, value, onSave, placeholder, multiline = false }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={8}
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#245C4F] hover:bg-[#1a453b] mt-1"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="flex items-start gap-2 group">
        <div className="flex-1">
          {value ? (
            multiline ? (
              <div className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded-md min-h-[200px]">
                {value}
              </div>
            ) : (
              <p className="text-sm bg-gray-50 p-2 rounded-md min-h-[40px] flex items-center">
                {value}
              </p>
            )
          ) : (
            <p className={`text-sm text-gray-400 bg-gray-50 p-2 rounded-md flex items-center ${multiline ? 'min-h-[200px] items-start' : 'min-h-[40px]'}`}>
              {placeholder || `Aggiungi ${label.toLowerCase()}`}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
