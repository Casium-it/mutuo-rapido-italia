
import React, { useState } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getQuestionTextWithResponses } from "@/utils/formUtils";

interface IterationSummaryProps {
  questionId: string;
}

export function IterationSummary({ questionId }: IterationSummaryProps) {
  const { getAllIterationResponses, blocks, startNewIteration, goToQuestion } = useFormExtended();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Ottieni tutte le iterazioni per questa domanda
  const iterations = getAllIterationResponses(questionId);
  
  // Se non ci sono iterazioni o ce n'è solo una, non mostriamo nulla
  if (!iterations || iterations.length <= 1) {
    return null;
  }
  
  // Trova la domanda dal suo ID per visualizzarne il testo
  const questionInfo = blocks.flatMap(block => block.questions)
    .find(question => question.question_id === questionId);
  
  if (!questionInfo) return null;
  
  // Funzione per aggiungere una nuova iterazione
  const handleAddNew = () => {
    startNewIteration(questionId);
    goToQuestion(blocks.find(b => b.questions.some(q => q.question_id === questionId))?.block_id || "", questionId);
  };
  
  return (
    <div className="mt-4 mb-6 bg-[#F8F4EF] rounded-lg p-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-900">
          Elementi precedentemente inseriti ({iterations.length - 1})
        </h3>
        <Button variant="ghost" size="sm" className="p-1">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {iterations.slice(0, -1).map((iteration, index) => (
            <div 
              key={`iteration-${iteration.iteration_id}`} 
              className="bg-white p-3 rounded border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Elemento {index + 1}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {getQuestionTextWithResponses(questionInfo, { [questionId]: iteration.responses })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-3 flex justify-center">
        <Button 
          variant="outline"
          className="text-[#245C4F] border-[#245C4F]" 
          onClick={handleAddNew}
        >
          Aggiungi nuovo elemento
        </Button>
      </div>
    </div>
  );
}
