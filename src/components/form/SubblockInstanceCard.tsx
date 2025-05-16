
import React from "react";
import { Button } from "@/components/ui/button";
import { SubblockInstance } from "@/types/form";
import { getSubblockSummary } from "@/utils/subblockUtils";
import { Edit, X } from "lucide-react";

interface SubblockInstanceCardProps {
  instance: SubblockInstance;
  questions: any[];
  onEdit: () => void;
  onDelete: () => void;
}

export function SubblockInstanceCard({ instance, questions, onEdit, onDelete }: SubblockInstanceCardProps) {
  // Genera un sommario leggibile dell'istanza
  const summary = getSubblockSummary(instance, questions);
  
  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-[#F8F4EF] rounded-lg border border-[#E7E1D9]">
      <div className="font-medium text-[#333333]">{summary}</div>
      
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Modifica</span>
        </Button>
        
        <Button
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Elimina</span>
        </Button>
      </div>
    </div>
  );
}
