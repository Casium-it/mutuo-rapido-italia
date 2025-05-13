
import React, { useState } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FormQuestion({ question }: { question: Question }) {
  const { getResponse, setResponse, navigateToNextQuestion, addActiveBlock } = useForm();
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});

  const renderPlaceholder = (key: string, placeholder: any) => {
    const existingResponse = getResponse(question.question_id, key);
    
    if (placeholder.type === "input") {
      return (
        <Input
          type={placeholder.input_type}
          placeholder={placeholder.placeholder_label}
          value={(responses[key] as string) || (existingResponse as string) || ""}
          onChange={(e) => {
            setResponses({
              ...responses,
              [key]: e.target.value
            });
          }}
          className="inline-block mx-1 w-auto min-w-[80px]"
        />
      );
    } else if (placeholder.type === "select") {
      if (placeholder.multiple) {
        // Handle multi-select (checkboxes)
        return (
          <div className="flex flex-col space-y-2 mt-4">
            {placeholder.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    (responses[key] as string[] || existingResponse as string[] || []).includes(
                      option.id
                    )
                  }
                  onChange={(e) => {
                    const current = (responses[key] as string[]) || (existingResponse as string[]) || [];
                    const newValue = e.target.checked
                      ? [...current, option.id]
                      : current.filter((id) => id !== option.id);
                    setResponses({
                      ...responses,
                      [key]: newValue
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-vibe-green focus:ring-vibe-green"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      } else {
        // Handle single select (cards with buttons)
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {placeholder.options.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  responses[key] === option.id || existingResponse === option.id
                    ? "border-vibe-green bg-vibe-green/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setResponses({
                    ...responses,
                    [key]: option.id
                  });
                }}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
              </div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save all responses
    for (const [key, value] of Object.entries(responses)) {
      if (value) {
        setResponse(question.question_id, key, value);
        
        // Check if we need to add a block
        if (question.placeholders[key].type === "select" && !Array.isArray(value)) {
          const selectedOption = (question.placeholders[key] as any).options.find(
            (opt: any) => opt.id === value
          );
          
          if (selectedOption?.add_block) {
            addActiveBlock(selectedOption.add_block);
          }
          
          // Navigate to next question
          if (selectedOption?.leads_to) {
            navigateToNextQuestion(question.question_id, selectedOption.leads_to);
            return;
          }
        } else if (question.placeholders[key].type === "input" && (question.placeholders[key] as any).leads_to) {
          navigateToNextQuestion(question.question_id, (question.placeholders[key] as any).leads_to);
          return;
        }
      }
    }
  };

  // Replace placeholders with actual form elements
  const renderQuestionText = () => {
    let text = question.question_text;
    
    for (const [key, placeholder] of Object.entries(question.placeholders)) {
      const pattern = new RegExp(`{{${key}}}`, "g");
      text = text.replace(pattern, `<span class="placeholder" data-key="${key}"></span>`);
    }
    
    return text;
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="text-xl font-medium text-gray-900 mb-6">
        {Object.keys(question.placeholders).map((key) => {
          const parts = question.question_text.split(new RegExp(`{{${key}}}`, "g"));
          
          if (parts.length === 1) {
            return <span key={key}>{question.question_text}</span>;
          }
          
          return (
            <React.Fragment key={key}>
              {parts.map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < parts.length - 1 && renderPlaceholder(key, question.placeholders[key])}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-8">
        <Button
          type="submit"
          className="bg-vibe-green hover:bg-vibe-green-dark text-white"
          disabled={Object.keys(responses).length === 0 && 
                   !Object.keys(question.placeholders).some(key => getResponse(question.question_id, key))}
        >
          Continua <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
