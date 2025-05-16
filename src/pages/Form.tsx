
import React, { useEffect, useState } from "react";
import { useForm } from "@/contexts/FormContext";
import { BlockSidebar } from "@/components/form/BlockSidebar";
import { QuestionView } from "@/components/form/QuestionView";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { RepeatingGroupRenderer } from "@/components/form/RepeatingGroupRenderer";
import { RepeatingGroupBlock } from "@/types/form";

export default function Form() {
  const { state, blocks, getProgress, resetForm } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Trova il blocco attivo corrente
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);

  // Stato per controllare se siamo in modalità subflow
  const [isInSubflow, setIsInSubflow] = useState(false);
  // Stato per il blocco di subflow corrente
  const [currentSubflowBlock, setCurrentSubflowBlock] = useState<RepeatingGroupBlock | null>(null);
  // Stato per l'eventuale indice di modifica
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Calcola il progresso del form
  const progress = getProgress();

  // Gestisci il salvataggio e l'uscita
  const handleSaveAndExit = () => {
    // Lo stato è già salvato in localStorage grazie al FormContext
    navigate("/");
  };

  // Reset dello stato subflow quando cambia l'URL
  useEffect(() => {
    const isRepeatingGroupView = location.pathname.includes('manager_view');
    
    // Solo se non siamo in una vista di gestione di un gruppo ripetuto, resettiamo il subflow
    if (!isRepeatingGroupView) {
      setIsInSubflow(false);
      setCurrentSubflowBlock(null);
      setEditingIndex(null);
    }
  }, [location.pathname]);

  // Handler per entrare in modalità subflow
  const handleEnterSubflow = (block: RepeatingGroupBlock, index: number | null = null) => {
    setCurrentSubflowBlock(block);
    setEditingIndex(index);
    setIsInSubflow(true);
  };

  // Handler per uscire dalla modalità subflow
  const handleExitSubflow = () => {
    setIsInSubflow(false);
    setCurrentSubflowBlock(null);
    setEditingIndex(null);
  };

  // Determina quale contenuto mostrare in base alla modalità e al tipo di blocco attivo
  const renderContent = () => {
    // Se siamo in modalità subflow, mostra solo il SubflowForm
    if (isInSubflow && currentSubflowBlock) {
      return (
        <RepeatingGroupRenderer 
          block={currentSubflowBlock}
          isIsolatedSubflow={true}
          initialEditingIndex={editingIndex}
          onSubflowComplete={handleExitSubflow}
          onSubflowCancel={handleExitSubflow}
        />
      );
    }

    // Altrimenti, mostra il contenuto normale
    if (!activeBlock) return null;
    
    // Se è un gruppo ripetuto, usa il RepeatingGroupRenderer (ma non in modalità isolata)
    if ('type' in activeBlock && activeBlock.type === 'repeating_group') {
      return (
        <RepeatingGroupRenderer 
          block={activeBlock as RepeatingGroupBlock}
          onEnterSubflow={handleEnterSubflow}
        />
      );
    }
    
    // Altrimenti usa il QuestionView standard
    return <QuestionView />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <div className="flex items-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-700 border-gray-300 hover:bg-gray-100 text-sm" 
            onClick={handleSaveAndExit}
          >
            Salva ed esci
          </Button>
        </div>
      </header>

      {/* Progress bar - visibile solo quando non siamo in modalità subflow */}
      {!isInSubflow && (
        <div className="bg-white px-4 py-1">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Progress 
              value={progress} 
              className="h-1 bg-gray-100 rounded-full" 
              indicatorClassName="bg-black" 
            />
            <span className="text-xs font-medium text-gray-500">{progress}%</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - visibile solo quando non siamo in modalità subflow */}
        {!isInSubflow && (
          <div className="hidden md:block w-[240px] bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 h-full">
              <BlockSidebar />
            </div>
          </div>
        )}

        {/* Content area - con key basata sulla modalità per forzare il re-rendering */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            {/* Block title */}
            <div className="mb-6">
              {isInSubflow && currentSubflowBlock ? (
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {editingIndex !== null ? "Modifica fonte di reddito" : "Aggiungi nuova fonte di reddito"}
                </h1>
              ) : (
                activeBlock && <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{activeBlock.title}</h1>
              )}
            </div>

            {/* Contenuto condizionale */}
            <div key={`${isInSubflow ? 'subflow' : 'main'}-${location.pathname}`}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset button - visibile solo quando non siamo in modalità subflow */}
      {!isInSubflow && (
        <div className="absolute bottom-4 left-4 z-10">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 text-xs"
            onClick={resetForm}
          >
            <RefreshCcw className="h-3 w-3 mr-1" />
            Reimposta form
          </Button>
        </div>
      )}
    </div>
  );
}
