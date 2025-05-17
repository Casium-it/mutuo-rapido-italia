
import React, { useState } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SubBlocksPlaceholderProps {
  questionId: string;
  placeholderKey: string;
  sourceBlockId: string;
  addBlockLabel?: string;
  placeholderLabel?: string;
}

/**
 * SubBlocksPlaceholder - Un componente che permette all'utente di aggiungere più istanze di un blocco
 */
export function SubBlocksPlaceholder({
  questionId,
  placeholderKey,
  sourceBlockId,
  addBlockLabel = "Aggiungi elemento",
  placeholderLabel
}: SubBlocksPlaceholderProps) {
  const { 
    copyBlock, 
    getBlockCopiesForSource, 
    goToQuestion, 
    blocks,
    removeBlock,
    navigateToNextQuestion,
    state
  } = useFormExtended();
  
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // Ottieni tutti i blocchi copiati da questo sourceBlockId
  const copiedBlockIds = getBlockCopiesForSource(sourceBlockId);
  
  // Trova i blocchi effettivi dai loro ID
  const copiedBlocks = copiedBlockIds
    .map(blockId => blocks.find(b => b.block_id === blockId))
    .filter(Boolean);

  // Funzione per ottenere un riassunto delle risposte del blocco
  const getBlockSummary = (blockId: string) => {
    // Cerca tutte le domande di questo blocco
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return { tipoReddito: "Non specificato", importo: "N/A", frequenza: "", };

    // Estrai le risposte rilevanti dal blocco
    const responses = state.responses;
    
    // Trova la risposta per il tipo di reddito (domanda 1)
    const tipoRedditoQuestionId = block.questions[0]?.question_id;
    const tipoRedditoRisposta = tipoRedditoQuestionId && responses[tipoRedditoQuestionId]?.placeholder1;
    
    // Se è "altro", cerca la descrizione personalizzata
    let tipoReddito = "";
    if (tipoRedditoRisposta === "altro" && block.questions[1]) {
      const altroDescrizioneId = block.questions[1].question_id;
      tipoReddito = (responses[altroDescrizioneId]?.placeholder1 as string) || "Altro";
    } else {
      // Mappa l'ID alla label leggibile
      const tipoMap: Record<string, string> = {
        "affitti": "Affitti",
        "lavoro_autonomo": "Lavoro autonomo",
        "assegno_minori": "Assegno minori",
        "supporto_familiari": "Supporto familiari",
        "dividendi_diritti": "Dividendi e diritti",
        "altro": "Altro"
      };
      tipoReddito = tipoRedditoRisposta ? tipoMap[tipoRedditoRisposta as string] || tipoRedditoRisposta as string : "Non specificato";
    }

    // Trova l'importo del reddito (domanda 3)
    const importoQuestionId = block.questions.find(q => q.question_id.includes("media_reddito"))?.question_id;
    const importo = importoQuestionId ? responses[importoQuestionId]?.placeholder1 as string : "N/A";

    // Trova la frequenza del reddito (domanda 4) 
    const frequenzaQuestionId = block.questions.find(q => q.question_id.includes("frequenza_reddito"))?.question_id;
    const frequenzaRisposta = frequenzaQuestionId ? responses[frequenzaQuestionId]?.placeholder1 as string : "";
    const frequenzaMap: Record<string, string> = {
      "mensile": "mensili",
      "annuale": "annui"
    };
    const frequenza = frequenzaRisposta ? frequenzaMap[frequenzaRisposta] || "" : "";

    // Trova se lordo o netto (domanda 5)
    const lordoNettoQuestionId = block.questions.find(q => q.question_id.includes("lordo_netto"))?.question_id;
    const lordoNetto = lordoNettoQuestionId ? responses[lordoNettoQuestionId]?.placeholder1 as string : "";

    return {
      tipoReddito,
      importo,
      frequenza,
      lordoNetto
    };
  };

  // Gestisci la creazione di una nuova copia del blocco e naviga direttamente ad essa
  const handleAddBlockCopy = () => {
    // Previeni doppi clic
    if (isAddingBlock) return;
    
    setIsAddingBlock(true);
    
    try {
      // Crea una nuova copia del blocco
      const newBlockId = copyBlock(sourceBlockId);
      
      // Se la creazione è riuscita, naviga automaticamente alla prima domanda del nuovo blocco
      if (newBlockId) {
        setTimeout(() => {
          // Trova il blocco appena creato
          const newBlock = blocks.find(b => b.block_id === newBlockId);
          if (newBlock && newBlock.questions.length > 0) {
            // Naviga alla prima domanda del nuovo blocco
            const firstQuestionId = newBlock.questions[0].question_id;
            goToQuestion(newBlockId, firstQuestionId);
          }
          setIsAddingBlock(false);
        }, 750); // Aumentato ulteriormente il ritardo per garantire che il blocco sia aggiunto correttamente
      } else {
        setIsAddingBlock(false);
      }
    } catch (e) {
      console.error("Errore nella creazione del blocco:", e);
      setIsAddingBlock(false);
    }
  };

  // Gestisci la navigazione a un blocco copiato
  const handleNavigateToBlock = (blockId: string) => {
    // Trova il blocco e la sua prima domanda
    const block = blocks.find(b => b.block_id === blockId);
    if (block && block.questions.length > 0) {
      const firstQuestionId = block.questions[0].question_id;
      goToQuestion(blockId, firstQuestionId);
    }
  };
  
  // Gestisci l'eliminazione di un blocco copiato
  const handleRemoveBlock = (blockId: string) => {
    removeBlock(blockId);
  };
  
  // Gestisci la navigazione al prossimo blocco (saltando i blocchi invisibili)
  const handleGoToNextBlock = () => {
    navigateToNextQuestion(questionId, "next_block");
  };

  // Formatta l'importo con separatori delle migliaia e simbolo €
  const formatCurrency = (value: string) => {
    if (!value || isNaN(Number(value))) return "€ N/A";
    
    const numValue = Number(value);
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(numValue);
  };

  return (
    <div className="w-full my-4">
      {placeholderLabel && (
        <div className="text-[16px] font-medium text-gray-800 mb-3">
          {placeholderLabel}
        </div>
      )}
      
      {/* Lista dei blocchi copiati con il riepilogo */}
      {copiedBlocks.length > 0 && (
        <div className="space-y-3 mb-4">
          {copiedBlocks.map((block, index) => {
            const summary = getBlockSummary(block?.block_id || "");
            
            return (
              <Card 
                key={block?.block_id} 
                className="border border-[#E7E1D9] hover:border-[#245C4F] transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    {/* Titolo e riepilogo */}
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => block && handleNavigateToBlock(block.block_id)}
                    >
                      <h4 className="font-medium text-[#245C4F] mb-1">
                        {block?.title} {index + 1}
                      </h4>
                      
                      {/* Visualizza il riepilogo delle risposte */}
                      <div className="text-sm text-gray-700">
                        <p><span className="font-medium">Tipo:</span> {summary.tipoReddito}</p>
                        {summary.importo !== "N/A" && (
                          <p>
                            <span className="font-medium">Importo:</span> {formatCurrency(summary.importo)}
                            {summary.frequenza && ` ${summary.frequenza}`}
                            {summary.lordoNetto && ` ${summary.lordoNetto === "netto" ? "netti" : "lordi"}`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Pulsante elimina */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-500 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questo {block?.title.toLowerCase()}? Questa azione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => block && handleRemoveBlock(block.block_id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mt-6">
        {/* Pulsante per aggiungere un nuovo blocco */}
        <Button
          type="button"
          onClick={handleAddBlockCopy}
          variant="outline"
          disabled={isAddingBlock}
          className={cn(
            "border-[1.5px] border-dashed border-[#BEB8AE] text-[#245C4F] bg-transparent",
            "hover:bg-[#F8F4EF] hover:border-[#245C4F]",
            "flex items-center gap-2 px-4 py-2"
          )}
        >
          <Plus className="h-4 w-4" />
          {isAddingBlock ? "Creazione..." : addBlockLabel}
        </Button>
        
        {/* Pulsante per passare al prossimo blocco */}
        <Button
          type="button"
          onClick={handleGoToNextBlock}
          variant="default"
          className="bg-[#245C4F] hover:bg-[#1A453A] text-white flex items-center gap-2 mt-4 sm:mt-0"
        >
          Avanti
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
