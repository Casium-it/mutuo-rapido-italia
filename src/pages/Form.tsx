
import React, { useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { BlockSidebar } from "@/components/form/BlockSidebar";
import { QuestionView } from "@/components/form/QuestionView";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export default function Form() {
  const { state, blocks, getProgress } = useForm();
  const params = useParams();
  const navigate = useNavigate();
  
  // Find the current active block
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);

  // Calcola il progresso del form
  const progress = getProgress();

  // Gestisci il salvataggio e l'uscita
  const handleSaveAndExit = () => {
    // Lo stato è già salvato in localStorage grazie al FormContext
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f5]">
      {/* Header in stile Pretto */}
      <header className="py-4 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="text-black border-gray-200 hover:bg-gray-50">
            Salva ed esci
          </Button>
        </div>
      </header>

      {/* Progress bar in stile Pretto */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Progress value={progress} className="h-1 bg-gray-100" indicatorClassName="bg-black" />
          <span className="text-sm font-medium text-gray-600">{progress}%</span>
        </div>
      </div>

      {/* Main content - layout in stile Pretto */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar in stile Pretto */}
        <div className="w-[280px] bg-[#f8f8f5] border-r border-gray-100 overflow-y-auto">
          <div className="p-6">
            <Link to="/" className="flex items-center text-black mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Indietro</span>
            </Link>
            
            <BlockSidebar />
          </div>
        </div>

        {/* Content area in stile Pretto */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            {/* Block title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black">{activeBlock?.title}</h1>
            </div>

            {/* Question */}
            <QuestionView />
          </div>
        </div>
      </div>
    </div>
  );
}
