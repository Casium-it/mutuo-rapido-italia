import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Button } from "@/components/ui/button";
import { RepeatingGroupEntry } from "@/types/form";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type LoopManagerProps = {
  loopId: string;
  addLeadsTo: string;
  nextLeadsTo: string;
};

export function LoopManager({ loopId, addLeadsTo, nextLeadsTo }: LoopManagerProps) {
  const { 
    state, 
    navigateToNextQuestion, 
    startNewLoopEntry, 
    editLoopEntry, 
    deleteLoopEntry,
    getLoopEntries,
    saveCurrentLoopEntry
  } = useFormExtended();
  
  const entries = getLoopEntries(loopId) || [];
  
  useEffect(() => {
    // Log quando il componente viene montato o quando cambiano le entries
    console.log(`[LoopManager] ${loopId} - Entries found:`, entries);
    console.log(`[LoopManager] Current repeatingGroups state:`, state.repeatingGroups);
  }, [loopId, entries, state.repeatingGroups]);

  // Funzione per creare un sommario leggibile di una voce
  const createEntrySummary = (entry: RepeatingGroupEntry): string => {
    let summary = "";
    
    // Cerca il tipo di finanziamento
    const tipoFinanziamento = entry.responses["tipo_finanziamento"]?.["placeholder1"] as string;
    if (tipoFinanziamento) {
      // Mappa gli ID alle etichette più leggibili
      const tipoMap: Record<string, string> = {
        "mutuo": "Mutuo",
        "prestito_personale": "Prestito personale",
        "macchina": "Finanziamento auto",
        "leasing": "Leasing",
        "altro": "Altro finanziamento"
      };
      
      summary += tipoMap[tipoFinanziamento] || "Finanziamento";
    }
    
    // Aggiungi l'importo se presente
    const importo = entry.responses["importo_finanziamento"]?.["placeholder1"] as string;
    if (importo) {
      summary += ` di €${importo}`;
    }
    
    // Aggiungi la frequenza di pagamento
    const frequenza = entry.responses["frequenza_rata"]?.["placeholder1"] as string;
    if (frequenza) {
      const frequenzaMap: Record<string, string> = {
        "mensili": "mensile",
        "ogni_2_mesi": "bimestrale",
        "ogni_3_mesi": "trimestrale",
        "ogni_6_mesi": "semestrale",
        "annuali": "annuale"
      };
      
      summary += `, ${frequenzaMap[frequenza] || frequenza}`;
    }
    
    // Aggiungi dettaglio "altro" se presente
    if (tipoFinanziamento === "altro") {
      const dettaglioAltro = entry.responses["oggetto_finanziamento_altro"]?.["placeholder1"] as string;
      if (dettaglioAltro) {
        summary += ` (${dettaglioAltro})`;
      }
    }
    
    // Se non ci sono informazioni, mostra un placeholder
    if (!summary) {
      summary = "Finanziamento";
    }
    
    return summary;
  };

  // Aggiungi una nuova voce
  const handleAddEntry = () => {
    console.log("[LoopManager] Starting new loop entry for", loopId);
    startNewLoopEntry(loopId);
    navigateToNextQuestion(state.activeQuestion.question_id, addLeadsTo);
  };

  // Modifica una voce esistente
  const handleEditEntry = (entryIndex: number) => {
    console.log("[LoopManager] Editing loop entry", entryIndex, "for", loopId);
    editLoopEntry(loopId, entryIndex);
    navigateToNextQuestion(state.activeQuestion.question_id, addLeadsTo);
  };

  // Elimina una voce
  const handleDeleteEntry = (entryIndex: number) => {
    console.log("[LoopManager] Deleting loop entry", entryIndex, "for", loopId);
    deleteLoopEntry(loopId, entryIndex);
  };

  // Continua al prossimo blocco
  const handleContinue = () => {
    console.log("[LoopManager] Continuing to next block:", nextLeadsTo);
    navigateToNextQuestion(state.activeQuestion.question_id, nextLeadsTo);
  };

  // Componente di debug per visualizzare lo stato del loop (solo in sviluppo)
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="mt-4 p-2 border border-dashed border-gray-300 rounded text-xs bg-gray-50">
        <h5 className="font-bold text-gray-700">Debug - Loop: {loopId}</h5>
        <div>{entries.length} entries in repeatingGroups</div>
        <div>Current loop state: {state.currentLoop ? 'Active' : 'Inactive'}</div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs mt-1 h-6"
            onClick={() => console.log('Current state:', state)}
          >
            Log state
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {entries.length > 0 ? (
        <div className="space-y-5">
          <h3 className="text-lg font-medium">Finanziamenti inseriti</h3>
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-4 bg-[#F8F4EF] rounded-lg border border-[#E7E1D9]"
              >
                <div className="flex-grow font-medium">
                  {createEntrySummary(entry)}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditEntry(index)}
                    className="text-[#245C4F] hover:bg-[#E7E1D9] hover:text-[#245C4F]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(index)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-[#F8F4EF] rounded-lg border border-[#E7E1D9]">
          <p className="text-gray-500">Nessun finanziamento inserito.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          type="button"
          onClick={handleAddEntry}
          className="flex items-center gap-2 bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium"
        >
          <Plus className="h-4 w-4" />
          Aggiungi finanziamento
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleContinue}
          className="border-[#245C4F] text-[#245C4F] hover:bg-[#F8F4EF] px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium"
        >
          Prosegui
        </Button>
      </div>
      
      {/* Debug info */}
      <DebugInfo />
    </div>
  );
}
