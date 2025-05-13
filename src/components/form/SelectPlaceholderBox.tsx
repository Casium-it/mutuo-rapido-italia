
import React from "react";
import { cn } from "@/lib/utils";
import { useForm } from "@/contexts/FormContext";

interface SelectPlaceholderBoxProps {
  questionId: string;
  placeholderKey: string;
  options: Array<{ id: string; label: string; }>;
  className?: string;
}

export function SelectPlaceholderBox({ 
  questionId, 
  placeholderKey, 
  options,
  className 
}: SelectPlaceholderBoxProps) {
  const { getResponse } = useForm();
  const selectedValue = getResponse(questionId, placeholderKey) as string;
  
  // Trova l'opzione selezionata o usa la prima come default
  const selectedOption = options.find(opt => opt.id === selectedValue);
  const defaultOption = options[0]; // Prima opzione come default
  const displayOption = selectedOption || defaultOption;
  
  const isSelected = Boolean(selectedValue);
  
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 mx-1 rounded-md transition-all duration-200",
        isSelected 
          ? "bg-[#00853E] text-white font-medium" 
          : "bg-gray-100 text-gray-400 border border-gray-200 opacity-40",
        className
      )}
      aria-live="polite"
    >
      {displayOption.label}
    </span>
  );
}
