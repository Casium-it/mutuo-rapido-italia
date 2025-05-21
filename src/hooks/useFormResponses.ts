
import { useForm } from "@/contexts/FormContext";
import { capitalizeWords, formatCurrency } from "@/lib/utils";
import { InputPlaceholder, SelectPlaceholder } from "@/types/form";

/**
 * Hook per gestire le risposte del form e le operazioni associate
 */
export const useFormResponses = () => {
  const formContext = useForm();

  /**
   * Gets a summary of block responses for display in the dynamic block list
   * @param blockId The ID of the block to summarize
   * @returns HTML string with responses formatted (bold for answers)
   */
  const getBlockResponseSummary = (blockId: string): string => {
    const block = formContext.blocks.find(b => b.block_id === blockId) || 
                  formContext.state.dynamicBlocks.find(b => b.block_id === blockId);
                  
    if (!block || block.questions.length === 0) return "";
    
    // Cerchiamo le domande che hanno risposte
    const answeredQuestions = block.questions.filter(q => 
      formContext.state.answeredQuestions.has(q.question_id)
    );
    
    if (answeredQuestions.length === 0) return "";
    
    // Prendiamo solo le prime 2-3 domande per il riassunto (intentionally showing only a few)
    const questionsToSummarize = answeredQuestions.slice(0, 3);
    
    // Creiamo un riassunto formattato con le risposte in grassetto e con il colore verde del tema (#245C4F)
    const summaryParts = questionsToSummarize.map(question => {
      let text = question.question_text;
      
      Object.keys(question.placeholders || {}).forEach(key => {
        const placeholder = `{{${key}}}`;
        const responseValue = formContext.state.responses[question.question_id]?.[key];
        
        if (responseValue) {
          let displayValue = "";
          
          // Handle select type placeholders
          if (question.placeholders[key].type === "select" && !Array.isArray(responseValue)) {
            const selectPlaceholder = question.placeholders[key] as SelectPlaceholder;
            const option = selectPlaceholder.options.find(
              (opt) => opt.id === responseValue
            );
            if (option) {
              displayValue = option.label;
            }
          } else {
            // Format based on placeholder validation or content type
            const placeholder_obj = question.placeholders[key];
            let validationType = "";
            
            // Check the placeholder type and get the validation type if it's an input
            if (placeholder_obj.type === "input") {
              validationType = (placeholder_obj as InputPlaceholder).input_validation;
            }
            
            if (Array.isArray(responseValue)) {
              displayValue = responseValue.join(", ");
            } else {
              const strValue = responseValue.toString();
              
              // Apply specific formatting ONLY for specific types
              if (validationType === "euro" || key.includes("euro") || key.includes("importo")) {
                // Format as currency
                const numValue = parseInt(strValue.replace(/\D/g, ""), 10);
                if (!isNaN(numValue)) {
                  displayValue = formatCurrency(numValue);
                } else {
                  displayValue = strValue;
                }
              } else if (validationType === "city" || key.includes("città") || key.includes("citta") || key.includes("comune")) {
                // Capitalize city names
                displayValue = capitalizeWords(strValue);
              } else if (validationType === "month" || key.includes("mese")) {
                // Capitalize month names
                displayValue = capitalizeWords(strValue);
              } else {
                // For all other values, no special formatting
                displayValue = strValue;
              }
            }
          }
          
          // Sostituisci il placeholder con il valore in grassetto e nel colore verde del tema (#245C4F)
          text = text.replace(placeholder, `<span class="font-bold text-[#245C4F]">${displayValue}</span>`);
        }
      });
      
      // Sostituisci i placeholder rimanenti
      text = text.replace(/\{\{[^}]+\}\}/g, "____");
      
      return text;
    });
    
    // Unisci tutto in una stringa HTML
    return summaryParts.join("<br>");
  };

  /**
   * Delete responses for specific questions
   * @param questionIds Array of question IDs to remove responses for
   */
  const deleteQuestionResponses = (questionIds: string[]) => {
    return formContext.deleteQuestionResponses(questionIds);
  };

  /**
   * Set a response for a specific question and placeholder
   * @param questionId The question ID
   * @param placeholderKey The placeholder key
   * @param value The response value
   */
  const setResponse = (questionId: string, placeholderKey: string, value: string | string[]) => {
    return formContext.setResponse(questionId, placeholderKey, value);
  };

  /**
   * Get a response for a specific question and placeholder
   * @param questionId The question ID
   * @param placeholderKey The placeholder key
   * @returns The response value or undefined if not found
   */
  const getResponse = (questionId: string, placeholderKey: string) => {
    return formContext.getResponse(questionId, placeholderKey);
  };

  /**
   * Check if a question has been answered
   * @param questionId The question ID
   * @returns True if the question has been answered, false otherwise
   */
  const isQuestionAnswered = (questionId: string) => {
    return formContext.isQuestionAnswered(questionId);
  };

  return {
    getBlockResponseSummary,
    deleteQuestionResponses,
    setResponse,
    getResponse,
    isQuestionAnswered,
    responses: formContext.state.responses,
  };
};
