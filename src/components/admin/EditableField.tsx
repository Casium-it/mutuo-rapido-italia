
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit2, Check, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  label: string;
  value: string;
  rawValue?: string; // Raw unformatted value for editing
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  isPercentage?: boolean; // Indicates this field handles percentage values
  isDatePicker?: boolean; // Indicates this field should use a date picker
  autoEdit?: boolean; // Automatically enter edit mode when clicked
}

export function EditableField({ label, value, rawValue, onSave, placeholder, multiline = false, isPercentage = false, isDatePicker = false, autoEdit = false }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(rawValue || value);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    isDatePicker && (rawValue || value) ? new Date(rawValue || value) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    let processedValue = editValue;
    
    // Handle date picker: use selected date
    if (isDatePicker && selectedDate) {
      processedValue = format(selectedDate, 'yyyy-MM-dd');
    }
    
    // Handle percentage field: replace comma with dot
    if (isPercentage) {
      processedValue = editValue.replace(',', '.');
    }
    
    const currentRawValue = rawValue || value;
    if (processedValue === currentRawValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(processedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(rawValue || value);
    setSelectedDate(isDatePicker && (rawValue || value) ? new Date(rawValue || value) : undefined);
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
          ) : isDatePicker ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>{placeholder || "Seleziona data"}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Input
              value={editValue}
              onChange={(e) => {
                let newValue = e.target.value;
                // Handle percentage field: replace comma with dot automatically
                if (isPercentage) {
                  newValue = newValue.replace(',', '.');
                }
                setEditValue(newValue);
              }}
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
        <div 
          className={`flex-1 ${autoEdit ? 'cursor-pointer' : ''}`}
          onClick={autoEdit ? () => {
            setEditValue(rawValue || value);
            setSelectedDate(isDatePicker && (rawValue || value) ? new Date(rawValue || value) : undefined);
            setIsEditing(true);
          } : undefined}
        >
          {value ? (
            multiline ? (
              <div className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded-md min-h-[200px]">
                {value}
              </div>
            ) : (
              <p className="text-sm bg-gray-50 p-2 rounded-md min-h-[40px] flex items-center hover:bg-gray-100 transition-colors">
                {isPercentage && rawValue ? `${rawValue}%` : value}
              </p>
            )
          ) : (
            <p className={`text-sm text-gray-400 bg-gray-50 p-2 rounded-md flex items-center hover:bg-gray-100 transition-colors ${multiline ? 'min-h-[200px] items-start' : 'min-h-[40px]'}`}>
              {placeholder || `Aggiungi ${label.toLowerCase()}`}
            </p>
          )}
        </div>
        {!autoEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditValue(rawValue || value);
              setSelectedDate(isDatePicker && (rawValue || value) ? new Date(rawValue || value) : undefined);
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
