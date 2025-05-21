
import React from "react";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { useForm } from "@/contexts/FormContext";
import { SelectPlaceholder } from "@/types/form";
import { FormSubmitButton } from "./FormSubmitButton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectPlaceholderInputProps {
  questionId: string;
  placeholderKey: string;
  placeholder: SelectPlaceholder;
  onChange: (value: string | string[]) => void;
}

export function SelectPlaceholderInput({
  questionId,
  placeholderKey,
  placeholder,
  onChange,
}: SelectPlaceholderInputProps) {
  const { getResponse } = useForm();
  const value = getResponse(questionId, placeholderKey) as string | string[];

  // Controlla se questa è l'opzione di invio del form (manteniamo per retrocompatibilità)
  const isSubmitOption = placeholder.options.some(option => option.id === "submit_form");

  if (isSubmitOption) {
    // Mostriamo il pulsante, ma ora è secondario poiché abbiamo il pulsante principale "Completa form"
    return <div className="mt-4">
      <p className="text-sm text-gray-500 mb-2">Puoi procedere alla prossima sezione o completare il form usando il pulsante generale quando tutti i blocchi sono completi.</p>
      <FormSubmitButton />
    </div>;
  }

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={placeholderKey}>
        {placeholder.placeholder_label || placeholderKey}
      </Label>
      <Select onValueChange={handleChange} defaultValue={value as string}>
        <SelectTrigger id={placeholderKey}>
          <SelectValue placeholder="Seleziona un'opzione" />
        </SelectTrigger>
        <SelectContent>
          {placeholder.options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
