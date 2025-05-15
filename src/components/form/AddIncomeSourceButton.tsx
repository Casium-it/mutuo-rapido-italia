
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddIncomeSourceButtonProps {
  onClick: () => void;
}

export function AddIncomeSourceButton({ onClick }: AddIncomeSourceButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="border-dashed border-2 border-[#E7E1D9] bg-white text-[#245C4F] hover:bg-[#F8F4EF] hover:border-[#245C4F] w-full py-6 h-auto flex items-center justify-center gap-2"
    >
      <Plus className="h-5 w-5" />
      <span>Aggiungi un'altra fonte di reddito</span>
    </Button>
  );
}
