
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getIncomeTypeLabel } from "@/utils/repeatingGroupUtils";
import { Edit, Trash2 } from "lucide-react";
import { RepeatingGroupEntry } from "@/types/form";

interface IncomeEntryCardProps {
  entry: RepeatingGroupEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function IncomeEntryCard({ entry, onEdit, onDelete }: IncomeEntryCardProps) {
  const { income_type, amount_input, income_description } = entry;
  
  return (
    <Card className="w-full mb-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">
              {getIncomeTypeLabel(income_type)}
            </h3>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(amount_input)}
              <span className="text-sm font-normal text-gray-600 ml-1">/mese</span>
            </p>
            {income_description && (
              <p className="text-sm text-gray-600 mt-1 max-w-md">
                {income_description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="text-gray-600"
        >
          <Edit className="h-4 w-4 mr-1" /> Modifica
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Elimina
        </Button>
      </CardFooter>
    </Card>
  );
}
