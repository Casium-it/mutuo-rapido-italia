
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IncomeSource } from "@/types/form";
import { Edit, Trash } from "lucide-react";
import { formatCurrency } from "@/utils/formatUtils";

interface IncomeSourceCardProps {
  source: IncomeSource;
  onEdit: () => void;
  onRemove: () => void;
}

export function IncomeSourceCard({ source, onEdit, onRemove }: IncomeSourceCardProps) {
  // Mappatura dei tipi di reddito a etichette più leggibili
  const incomeTypeLabels: Record<string, string> = {
    affitti: "Reddito da affitti",
    lavoro_autonomo: "Lavoro autonomo",
    assegno_minori: "Assegno per minori",
    supporto_familiari: "Supporto da familiari",
    dividendi_diritti: "Dividendi e diritti",
    altro: "Altro reddito"
  };

  // Mappatura dei livelli di stabilità a etichette più leggibili
  const stabilityLabels: Record<string, string> = {
    molto_stabile: "Molto stabile",
    abbastanza_stabile: "Abbastanza stabile",
    poco_stabile: "Poco stabile",
    volatile: "Volatile"
  };

  // Mappatura delle frequenze a etichette più leggibili
  const frequencyLabels: Record<string, string> = {
    mensile: "al mese",
    annuale: "all'anno"
  };

  // Funzione per generare un riepilogo del reddito
  const generateSummary = () => {
    const { details } = source;
    if (!details) return null;

    const amount = details.importo || "0";
    const frequency = frequencyLabels[details.frequenza] || "";
    const stability = stabilityLabels[details.stabilita] || "";
    
    return {
      amount,
      frequency,
      stability
    };
  };

  const summary = generateSummary();

  return (
    <Card className="border border-[#E7E1D9] bg-white overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Header with income type */}
          <div className="bg-[#F8F4EF] px-5 py-3 border-b border-[#E7E1D9]">
            <div className="font-medium text-[#245C4F]">
              {incomeTypeLabels[source.type] || "Reddito aggiuntivo"}
            </div>
          </div>
          
          {/* Content with summary */}
          <div className="p-5 space-y-2">
            {summary && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Importo:</span>
                  <span className="font-semibold">
                    {formatCurrency(summary.amount)} {summary.frequency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stabilità:</span>
                  <span className="font-semibold">{summary.stability}</span>
                </div>
                
                {source.details.dataInizio && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Da:</span>
                    <span className="font-semibold">{source.details.dataInizio}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Footer with action buttons */}
          <div className="px-5 py-3 bg-gray-50 border-t border-[#E7E1D9] flex justify-end gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              <Edit className="h-4 w-4 mr-1" />
              Modifica
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRemove}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash className="h-4 w-4 mr-1" />
              Rimuovi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
