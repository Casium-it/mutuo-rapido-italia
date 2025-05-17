
import React from "react";
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
import { useToast } from "@/components/ui/use-toast";

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
    createAndNavigateToBlock,
    getBlockCopiesForSource, 
    goToQuestion, 
    blocks,
    removeBlock,
    navigateToNextQuestion,
    state
  } = useFormExtended();
  
  const { toast } = useToast();
  const [isCreatingBlock, setIsCreatingBlock] = React.useState(false);
  const [copiedBlocks, setCopiedBlocks] = React.useState<any[]>([]);

  // Funzione per ottenere le copie dei blocchi
  const fetchCopiedBlocks = React.useCallback(() => {
    // Recupera gli ID dei blocchi copiati
    const copiedBlockIds = getBlockCopiesForSource(sourceBlockId);
    
    if (copiedBlockIds.length === 0) {
      setCopiedBlocks([]);
      return;
    }
    
    // Trova i blocchi completi usando gli ID
    const foundBlocks = blocks
      .filter(block => copiedBlockIds.includes(block.block_id))
      // Ordina per ID numerico ascendente (copy1, copy2, ecc.)
      .sort((a, b) => {
        const indexA = a.block_id.match(/_copy(\d+)$/);
        const indexB = b.block_id.match(/_copy(\d+)$/);
        
        if (indexA && indexB) {
          return parseInt(indexA[1], 10) - parseInt(indexB[1], 10);
        }
        return 0;
      });
    
    setCopiedBlocks(foundBlocks);
  }, [sourceBlockId, blocks, getBlockCopiesForSource]);
  
  // Recupera tutti i blocchi copiati dal sorgente specificato
  React.useEffect(() => {
    fetchCopiedBlocks();
  }, [fetchCopiedBlocks, state.blockCopyRegistry]);

  // Funzione per ottenere un riassunto dinamico delle risposte del blocco
  const getBlockSummary = React.useCallback((blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return { summaryItems: [] };

    const responses = state.responses;
    const summaryItems: Array<{ label: string; value: string }> = [];
    
    // Itera su tutte le domande del blocco per generare un sommario dinamico
    block.questions.forEach(question => {
      const questionId = question.question_id;
      
      // Verifica se esiste una risposta per questa domanda
      if (responses[questionId]) {
        // Per ogni placeholder nella domanda
        Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
          const response = responses[questionId][placeholderKey];
          
          if (response !== undefined && response !== "") {
            let displayValue = "";
            
            // Gestisci i diversi tipi di placeholder
            if (placeholder.type === "select") {
              const options = placeholder.options;
              if (!Array.isArray(response)) {
                // Per selezione singola
                const option = options.find(opt => opt.id === response);
                if (option) {
                  displayValue = option.label;
                }
              } else {
                // Per selezione multipla
                displayValue = response
                  .map(id => {
                    const option = options.find(opt => opt.id === id);
                    return option ? option.label : id;
                  })
                  .join(", ");
              }
            } else if (placeholder.type === "input") {
              // Per input di testo o numeri
              displayValue = Array.isArray(response) ? response.join(", ") : response.toString();
              
              // Formatta i valori monetari quando appropriato
              if (placeholder.input_validation === "euro" && !isNaN(Number(displayValue))) {
                displayValue = new Intl.NumberFormat('it-IT', { 
                  style: 'currency', 
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(Number(displayValue));
              }
            }
            
            // Crea un'etichetta dalla domanda,
            // rimuovendo placeholder e sostituendoli con la risposta effettiva
            let questionText = question.question_text;
            
            // Rimuovi tutti i placeholder dal testo della domanda per l'etichetta
            questionText = questionText.replace(/\{\{[^}]+\}\}/g, "").trim();
            
            // Aggiungi al sommario solo se c'è un valore da mostrare
            if (displayValue) {
              summaryItems.push({
                label: questionText,
                value: displayValue
              });
            }
          }
        });
      }
    });
    
    return { summaryItems };
  }, [blocks, state.responses]);

  // Gestisci la creazione di una nuova copia del blocco e naviga direttamente ad essa
  const handleAddBlockCopy = () => {
    // Previeni doppi clic
    if (isCreatingBlock) return;
    
    setIsCreatingBlock(true);
    
    try {
      // Crea il blocco e naviga ad esso in un'unica operazione
      const success = createAndNavigateToBlock(sourceBlockId);
      
      if (success) {
        toast({
          title: "Elemento aggiunto",
          description: "Compila i dettagli per completare",
        });
      } else {
        toast({
          title: "Errore",
          description: "Non è stato possibile creare il nuovo elemento",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error("Errore nella creazione del blocco:", e);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBlock(false);
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
    toast({
      title: "Elemento eliminato",
      description: "L'elemento è stato rimosso correttamente",
    });
    
    // Aggiorna la lista dopo la rimozione
    fetchCopiedBlocks();
  };
  
  // Gestisci la navigazione al prossimo blocco (saltando i blocchi invisibili)
  const handleGoToNextBlock = () => {
    navigateToNextQuestion(questionId, "next_block");
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
            if (!block) return null;
            const summary = getBlockSummary(block.block_id);
            
            return (
              <Card 
                key={block.block_id} 
                className="border border-[#E7E1D9] hover:border-[#245C4F] transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    {/* Titolo e riepilogo */}
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => handleNavigateToBlock(block.block_id)}
                    >
                      <h4 className="font-medium text-[#245C4F] mb-1">
                        {block.title} {index + 1}
                      </h4>
                      
                      {/* Visualizza il riepilogo dinamico delle risposte */}
                      <div className="text-sm text-gray-700 space-y-1">
                        {summary.summaryItems.length > 0 ? (
                          summary.summaryItems.map((item, idx) => (
                            <p key={idx}>
                              <span className="font-medium">{item.label}</span> {item.value}
                            </p>
                          ))
                        ) : (
                          <p>Nessuna informazione disponibile</p>
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
                            Sei sicuro di voler eliminare questo {block.title.toLowerCase()}? Questa azione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveBlock(block.block_id)}
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
          disabled={isCreatingBlock}
          className={cn(
            "border-[1.5px] border-dashed border-[#BEB8AE] text-[#245C4F] bg-transparent",
            "hover:bg-[#F8F4EF] hover:border-[#245C4F]",
            "flex items-center gap-2 px-4 py-2"
          )}
        >
          <Plus className="h-4 w-4" />
          {isCreatingBlock ? "Creazione..." : addBlockLabel}
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
