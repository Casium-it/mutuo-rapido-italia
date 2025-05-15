
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Plus, Trash2, ChevronRight } from "lucide-react";
import { RepeatingGroupBlock, RepeatingGroupEntry } from "@/types/form";
import { toast } from "@/components/ui/use-toast";

interface ManagerViewProps {
  block: RepeatingGroupBlock;
  entries: RepeatingGroupEntry[];
  onAdd: () => void;
  onEdit: (entry: RepeatingGroupEntry, index: number) => void;
  onDelete: (index: number) => void;
  onContinue: () => void;
}

export function RepeatingGroupManagerView({ 
  block, 
  entries, 
  onAdd, 
  onEdit, 
  onDelete, 
  onContinue 
}: ManagerViewProps) {
  // Utilizziamo i valori dal blocco JSON o valori predefiniti
  const {
    title,
    subtitle = "Gestisci qui tutti i tuoi dati. Puoi aggiungere, modificare o eliminare voci.",
    empty_state_text = "Non hai ancora aggiunto nessun elemento.",
    add_button_text = "Aggiungi elemento",
    continue_button_text = "Continua",
    summary_id, 
    summary_template
  } = block;

  // Funzione per renderizzare il sommario dalla template
  const renderSummary = (entry: RepeatingGroupEntry) => {
    // Se c'è una template specifica, la usa
    if (summary_template && summary_id) {
      return summary_template.replace(/\{\{(.+?)\}\}/g, (_, id) => 
        entry[id] != null ? entry[id].toString() : ''
      );
    }
    
    // Fallback al solo valore del summary_id se disponibile
    if (summary_id && entry[summary_id] != null) {
      return entry[summary_id].toString();
    }
    
    // Fallback generico
    return "Elemento aggiunto";
  };

  // Calcola il valore numerico totale se summary_id contiene valori numerici
  const calculateTotal = () => {
    if (!summary_id) return 0;
    
    return entries.reduce((sum, entry) => {
      const value = entry[summary_id];
      if (typeof value === 'number') {
        return sum + value;
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        return sum + Number(value);
      }
      return sum;
    }, 0);
  };

  const hasEntries = entries.length > 0;
  const totalValue = calculateTotal();
  const showTotal = hasEntries && summary_id && !isNaN(totalValue);

  // Gestisce l'eliminazione con conferma
  const handleDelete = (index: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questo elemento?")) {
      onDelete(index);
      toast({
        title: "Elemento eliminato",
        description: "L'elemento è stato rimosso con successo.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        
        {showTotal && (
          <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Totale</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR'
              }).format(totalValue)}
            </p>
          </div>
        )}

        {hasEntries ? (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card key={entry.id || index} className="w-full mb-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-gray-900">
                        {renderSummary(entry)}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(entry, index)}
                    className="text-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Modifica
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Elimina
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
            <p className="text-gray-500 mb-4">{empty_state_text}</p>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={onAdd} className="w-full mb-4">
            <Plus className="h-4 w-4 mr-2" /> {add_button_text}
          </Button>
          
          <Button 
            onClick={onContinue}
            disabled={!hasEntries}
            variant={hasEntries ? "default" : "outline"}
            className="w-full"
          >
            {continue_button_text}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
