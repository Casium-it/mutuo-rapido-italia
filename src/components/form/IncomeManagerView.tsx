
import React from 'react';
import { Button } from "@/components/ui/button";
import { IncomeEntryCard } from "./IncomeEntryCard";
import { useRepeatingGroup } from "@/hooks/useRepeatingGroup";
import { RepeatingGroupEntry } from "@/types/form";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface IncomeManagerViewProps {
  repeatingId: string;
  title: string;
  subtitle: string;
  emptyStateText: string;
  addButtonText: string;
  continueButtonText: string;
  onAdd: () => void;
  onEdit: (entry: RepeatingGroupEntry, index: number) => void;
  onContinue: () => void;
}

export function IncomeManagerView({ 
  repeatingId, 
  title, 
  subtitle,
  emptyStateText,
  addButtonText,
  continueButtonText,
  onAdd, 
  onEdit,
  onContinue 
}: IncomeManagerViewProps) {
  const { entries, loading, hasEntries, deleteEntry } = useRepeatingGroup(repeatingId);

  const handleDelete = (index: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questa fonte di reddito?")) {
      const success = deleteEntry(index);
      if (success) {
        toast({
          title: "Fonte di reddito eliminata",
          description: "La fonte di reddito è stata eliminata con successo.",
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione della fonte di reddito.",
          variant: "destructive"
        });
      }
    }
  };

  const totalMonthlyIncome = entries.reduce((sum, entry) => {
    const amount = parseFloat(String(entry.amount_input));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Caricamento in corso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        
        {hasEntries && (
          <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Reddito mensile aggiuntivo totale</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR'
              }).format(totalMonthlyIncome)}
              <span className="text-sm font-normal text-gray-500 ml-1">/mese</span>
            </p>
          </div>
        )}

        {hasEntries ? (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <IncomeEntryCard
                key={entry.id || index}
                entry={entry}
                onEdit={() => onEdit(entry, index)}
                onDelete={() => handleDelete(index)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
            <p className="text-gray-500 mb-4">{emptyStateText}</p>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={onAdd} className="w-full mb-4">
            <Plus className="h-4 w-4 mr-2" /> {addButtonText}
          </Button>
          
          <Button 
            onClick={onContinue}
            disabled={!hasEntries}
            variant={hasEntries ? "default" : "outline"}
            className="w-full"
          >
            {continueButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
