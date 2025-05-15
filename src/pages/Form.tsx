
import React, { useEffect, useRef } from "react";
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
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const contentKey = useRef(Date.now());
  
  // Find the current active block
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);

  // Calculate the form progress
  const progress = getProgress();

  // Handle save and exit
  const handleSaveAndExit = () => {
    // State is already saved to localStorage thanks to FormContext
    navigate("/");
  };

  // Make sure the component re-renders when the URL changes
  useEffect(() => {
    // Forza il re-rendering del contenuto quando cambia l'URL
    contentKey.current = Date.now();
  }, [location.pathname]);

  // Reset navigation state if needed
  useEffect(() => {
    return () => {
      // Pulizia quando il componente viene smontato
    };
  }, []);

  // Determine which content to show based on the active block type
  const renderActiveContent = () => {
    if (!activeBlock) return null;
    
    // If it's a repeating group, use the RepeatingGroupRenderer
    if ('type' in activeBlock && activeBlock.type === 'repeating_group') {
      return <RepeatingGroupRenderer block={activeBlock as RepeatingGroupBlock} />;
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

      {/* Progress bar */}
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

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-[240px] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 h-full">
            <BlockSidebar />
          </div>
        </div>

        {/* Content area - with key based on pathname to force re-rendering */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            {/* Block title */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{activeBlock?.title}</h1>
            </div>

            {/* Question or RepeatingGroup - with key to force re-rendering when URL changes */}
            <div key={contentKey.current}>
              {renderActiveContent()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset button */}
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
    </div>
  );
}
