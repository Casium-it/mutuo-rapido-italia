
import React from "react";
import { cn } from "@/lib/utils";
import { useForm } from "@/contexts/FormContext";

interface SelectPlaceholderBoxProps {
  questionId: string;
  placeholderKey: string;
  options: Array<{ id: string; label: string; }>;
  value?: string;  // Aggiungiamo questa prop per supportare i valori locali
  className?: string;
}

export function SelectPlaceholderBox({ 
  questionId, 
  placeholderKey, 
  options,
  value,
  className 
}: SelectPlaceholderBoxProps) {
  const { getResponse } = useForm();
  
  // Se viene fornito un value specifico, usalo, altrimenti prendi dal form context
  const selectedValue = value || getResponse(questionId, placeholderKey) as string;
  
  // Trova l'opzione selezionata o usa la prima come default
  const selectedOption = options.find(opt => opt.id === selectedValue);
  const defaultOption = options[0]; // Prima opzione come default
  const displayOption = selectedOption || defaultOption;
  
  const isSelected = Boolean(selectedValue);
  
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center mx-1 rounded-md transition-all duration-200",
        isSelected 
          ? "bg-[#F8F4EF] text-[#245C4F] font-semibold px-[10px] py-[4px] rounded-[6px] text-[16px]" 
          : "bg-[#F8F4EF] text-[#C4BFB8] px-[10px] py-[4px] rounded-[6px] font-medium text-[16px]",
        className
      )}
      aria-live="polite"
    >
      {displayOption.label}
    </span>
  );
}
