
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getIncomeTypeLabel } from "@/utils/repeatingGroupUtils";
import { Edit, Trash2 } from "lucide-react";
import { RepeatingGroupEntry } from "@/types/form";

interface IncomeEntryCardProps {
  entry: RepeatingGroupEntry;
  summaryField?: string;
  summaryTemplate?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function IncomeEntryCard({ 
  entry, 
  summaryField,
  summaryTemplate,
  onEdit, 
  onDelete 
}: IncomeEntryCardProps) {
  // Get the income type and amount (will still work with old data structure)
  const incomeType = entry.income_type;
  const amountInput = entry.amount_input;
  
  // Render a dynamic summary line from a template and entry data
  const renderSummary = (entry: RepeatingGroupEntry, template?: string, field?: string): string => {
    if (!template && !field) {
      // If no template or field is provided, use default
      return formatCurrency(entry.amount_input);
    }
    
    if (!template && field && entry[field] !== undefined) {
      // If only a field is provided, return its formatted value
      if (field === 'amount_input') {
        return formatCurrency(entry[field]);
      }
      return String(entry[field]);
    }
    
    // Replace tokens in the template with values from the entry
    return (template || "").replace(/\{\{(.+?)\}\}/g, (_, field) => {
      if (field === 'amount_input' && entry[field] !== undefined) {
        return formatCurrency(entry[field]);
      }
      return entry[field] !== undefined ? String(entry[field]) : "";
    });
  };
  
  return (
    <Card className="w-full mb-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">
              {getIncomeTypeLabel(incomeType)}
            </h3>
            <p className="text-xl font-semibold text-gray-900">
              {renderSummary(entry, summaryTemplate, summaryField || 'amount_input')}
              <span className="text-sm font-normal text-gray-600 ml-1">/mese</span>
            </p>
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
