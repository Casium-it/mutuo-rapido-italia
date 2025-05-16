
import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Button } from "@/components/ui/button";
import { RepeatingGroupEntry } from "@/types/form";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Logger per debugging, visibile solo in ambiente di sviluppo
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[LoopManager] ${message}`, ...data);
  }
};

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
    saveCurrentLoopEntry,
    getCurrentLoopState
  } = useFormExtended();
  
  // Ottieni lo stato corrente del loop e le voci
  const currentLoopState = getCurrentLoopState();
  const entries = getLoopEntries(loopId) || [];
  
  useEffect(() => {
    // Registra lo stato del loop quando il componente viene montato o quando cambiano le entries
    debugLog(`Componente montato per il loop ${loopId}`, {
      entries: entries.length,
      currentLoopState
    });
    
    // Se c'è un'entry di loop attiva quando arriviamo al manager, la salviamo
    // Questo gestisce il caso in cui l'utente ha completato una entry e torna automaticamente al manager
    if (currentLoopState && currentLoopState.loop_id === loopId) {
      debugLog("Entry di loop attiva rilevata all'avvio del manager, salvataggio automatico");
      saveCurrentLoopEntry();
    }
  }, [loopId, entries.length, currentLoopState, saveCurrentLoopEntry]);

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
    debugLog("Avvio nuova voce del loop", loopId);
    
    // Assicurati che qualsiasi voce corrente sia salvata prima di iniziarne una nuova
    if (currentLoopState) {
      saveCurrentLoopEntry();
    }
    
    // Avvia una nuova voce e naviga alla prima domanda del loop
    startNewLoopEntry(loopId);
    navigateToNextQuestion(state.activeQuestion.question_id, addLeadsTo);
  };

  // Modifica una voce esistente
  const handleEditEntry = (entryIndex: number) => {
    debugLog(`Modifica voce del loop ${entryIndex}`, loopId);
    
    // Assicurati che qualsiasi voce corrente sia salvata prima di modificarne un'altra
    if (currentLoopState) {
      saveCurrentLoopEntry();
    }
    
    editLoopEntry(loopId, entryIndex);
    navigateToNextQuestion(state.activeQuestion.question_id, addLeadsTo);
  };

  // Elimina una voce
  const handleDeleteEntry = (entryIndex: number) => {
    debugLog(`Eliminazione voce del loop ${entryIndex}`, loopId);
    deleteLoopEntry(loopId, entryIndex);
  };

  // Continua al prossimo blocco
  const handleContinue = () => {
    debugLog(`Prosecuzione al blocco successivo`, nextLeadsTo);
    
    // Assicurati che qualsiasi voce corrente sia salvata prima di continuare
    if (currentLoopState) {
      saveCurrentLoopEntry();
    }
    
    navigateToNextQuestion(state.activeQuestion.question_id, nextLeadsTo);
  };

  // Componente di debug visualizzabile solo in ambiente di sviluppo
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="mt-4 p-2 border border-dashed border-gray-300 rounded text-xs bg-gray-50">
        <h5 className="font-bold text-gray-700">Informazioni di debug - Loop: {loopId}</h5>
        <div>{entries.length} voci in repeatingGroups</div>
        <div>Stato del loop corrente: {currentLoopState ? 'Attivo' : 'Inattivo'}</div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs mt-1 h-6"
            onClick={() => debugLog('Stato corrente:', state)}
          >
            Mostra stato
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
      
      {/* Debug info solo in ambiente di sviluppo */}
      <DebugInfo />
    </div>
  );
}
