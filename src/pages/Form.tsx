
import React from "react";
import { useForm } from "@/contexts/FormContext";
import { BlockSidebar } from "@/components/form/BlockSidebar";
import { QuestionView } from "@/components/form/QuestionView";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Form() {
  const { state, blocks } = useForm();
  
  // Find the current active block
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-4 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <Button variant="ghost" className="text-gray-700">
          Salva ed esci
        </Button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-sm">
          <BlockSidebar />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-white md:bg-[#f8f5f1] p-6 md:p-8">
          {/* Back button for mobile */}
          <div className="md:hidden mb-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Indietro
            </Button>
          </div>

          {/* Main content container */}
          <div className="md:max-w-3xl mx-auto bg-white rounded-lg p-6 md:p-8 shadow-sm">
            {/* Block title */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{activeBlock?.title}</h1>
            </div>

            {/* Question */}
            <QuestionView />
          </div>
        </div>
      </div>
    </div>
  );
}
