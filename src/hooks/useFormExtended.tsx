import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions,
  generateUniqueId
} from "@/utils/formUtils";
import { Question, IncomeSource } from "@/types/form";
import { useEffect } from "react";

/**
 * Extended hook for the form context with additional functionality
 */
export const useFormExtended = () => {
  const formContext = useOriginalForm();
  
  // Debug log all income sources when the hook is used
  useEffect(() => {
    console.log("useFormExtended hook used, income sources:", formContext.getIncomeSources());
    
    // Verifica l'integrità dei dati
    const sources = formContext.getIncomeSources();
    if (sources) {
      sources.forEach((source, idx) => {
        if (!source.id) console.error(`Income source at index ${idx} has no ID!`);
        if (!source.type) console.error(`Income source ${source.id || idx} has no type!`);
        if (!source.details) console.warn(`Income source ${source.id || idx} has no details!`);
      });
    }
  }, [formContext]);
  
  /**
   * Gets the text of the previous question with responses filled in
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns The previous question's text with responses or empty string
   */
  const getPreviousQuestionText = (blockId: string, questionId: string): string => {
    const previousQuestion = getPreviousQuestionUtil(
      formContext.blocks,
      blockId,
      questionId
    );
    
    if (!previousQuestion) return "";
    
    return getQuestionTextWithResponses(previousQuestion, formContext.state.responses);
  };
  
  /**
   * Gets the previous question object
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns The previous question object or undefined
   */
  const getPreviousQuestion = (blockId: string, questionId: string) => {
    return getPreviousQuestionUtil(formContext.blocks, blockId, questionId);
  };

  /**
   * Gets all previous inline questions in a chain, starting from the current question
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns Array of previous questions in the chain, ordered from first to last
   */
  const getInlineQuestionChain = (blockId: string, questionId: string): Question[] => {
    // Se la domanda è inline, troviamo da dove viene l'utente attraverso la cronologia
    const question = formContext.blocks
      .find(b => b.block_id === blockId)
      ?.questions.find(q => q.question_id === questionId);
    
    if (question?.inline) {
      // Cerca nella cronologia di navigazione da dove l'utente è arrivato a questa domanda
      const navigationHistory = formContext.getNavigationHistoryFor(questionId);
      
      if (navigationHistory) {
        // Trova la domanda da cui l'utente è arrivato
        const sourceQuestion = formContext.blocks
          .find(b => b.block_id === navigationHistory.from_block_id)
          ?.questions.find(q => q.question_id === navigationHistory.from_question_id);
        
        if (sourceQuestion) {
          // Restituisci la catena formata dalla domanda di origine
          return [sourceQuestion];
        }
      }
    }
    
    // Fallback al comportamento precedente se non troviamo una cronologia
    return getChainOfInlineQuestions(
      formContext.blocks,
      blockId,
      questionId
    );
  };

  // Funzione migliorata di navigazione per gestire la mappatura tra risposte e dettagli reddito
  const navigateToNextQuestion = (currentQuestionId: string, leadsTo: string) => {
    // Trova la domanda corrente
    let currentQuestion: Question | undefined;
    let currentBlock: string | undefined;
    
    for (const block of formContext.blocks) {
      const question = block.questions.find(q => q.question_id === currentQuestionId);
      if (question) {
        currentQuestion = question;
        currentBlock = block.block_id;
        break;
      }
    }
    
    console.log("Navigating from", currentQuestionId, "to", leadsTo);
    console.log("Current question:", currentQuestion);
    
    // Se la domanda corrente fa parte dei dettagli di una fonte di reddito
    if (currentQuestion?.income_source_details && formContext.state.currentIncomeSourceId) {
      // Ottieni tutte le risposte per questa domanda
      const responses = formContext.state.responses[currentQuestionId];
      
      if (responses) {
        console.log("Found responses for question", currentQuestionId, ":", responses);
        
        // Mappa le risposte ai dettagli della fonte di reddito corrente
        // Estrai la chiave della risposta (campo del form) dal question_id
        let detailKey = currentQuestionId;
        
        // Mappa dei nomi delle chiavi di dettaglio per ciascuna domanda
        const detailKeyMap: Record<string, string> = {
          // Affitti
          'dettagli_affitti': 'importo',
          'frequenza_affitti': 'frequenza',
          'stabilita_affitti': 'stabilita',
          
          // Lavoro autonomo
          'dettagli_lavoro_autonomo': 'importo',
          'frequenza_lavoro_autonomo': 'frequenza',
          'stabilita_lavoro_autonomo': 'stabilita',
          
          // Assegno minori
          'dettagli_assegno_minori': 'importo',
          'frequenza_assegno_minori': 'frequenza',
          'stabilita_assegno_minori': 'stabilita',
          
          // Supporto familiari
          'dettagli_supporto_familiari': 'importo',
          'frequenza_supporto_familiari': 'frequenza',
          'stabilita_supporto_familiari': 'stabilita',
          
          // Dividendi e diritti
          'dettagli_dividendi_diritti': 'importo',
          'frequenza_dividendi_diritti': 'frequenza',
          'stabilita_dividendi_diritti': 'stabilita',
          
          // Altro
          'dettagli_altro': 'descrizione',
          'importo_altro': 'importo',
          'frequenza_altro': 'frequenza',
          'stabilita_altro': 'stabilita'
        };
        
        // Se il question_id è nella mappa, usa la chiave mappata
        if (detailKeyMap[currentQuestionId]) {
          detailKey = detailKeyMap[currentQuestionId];
        }
        
        // Ottieni il valore della risposta
        let value: any;
        // Usa la prima chiave di placeholder come default
        const firstPlaceholderKey = Object.keys(responses)[0];
        
        if (firstPlaceholderKey) {
          value = responses[firstPlaceholderKey];
          
          // Aggiorna i dettagli della fonte di reddito
          console.log("Updating income source detail:", detailKey, "=", value);
          formContext.updateIncomeSourceDetail(detailKey, value);
          
          // Verifica che il dettaglio sia stato aggiornato
          setTimeout(() => {
            const currentSource = formContext.getCurrentIncomeSource();
            console.log("Current source after update:", currentSource);
          }, 0);
        }
      }
    }
    
    // Se la domanda corrente è l'ultima di un flusso di dettagli reddito
    // e stiamo navigando alla gestione redditi, marchiamo la fonte come completa
    if (currentQuestion?.is_last_income_detail && leadsTo === "fonti_reddito_secondario") {
      const currentIncomeSource = formContext.getCurrentIncomeSource();
      if (currentIncomeSource) {
        console.log("Marking income source as complete:", currentIncomeSource.id);
        // Marchiamo la fonte di reddito come completa
        formContext.updateIncomeSourceDetail('isComplete', true);
        
        // Log di verifica
        setTimeout(() => {
          const updatedSource = formContext.getCurrentIncomeSource();
          console.log("Source after marking complete:", updatedSource);
        }, 0);
      }
    }
    
    // Se stiamo selezionando un nuovo tipo di reddito secondario
    if (currentQuestionId === "nuovo_reddito_secondario" && leadsTo.startsWith("dettagli_")) {
      // Estrai il tipo di reddito dal leads_to
      const incomeType = leadsTo.replace("dettagli_", "");
      console.log("Selected new income type:", incomeType);
      
      // Pulisci le risposte precedenti relative al tipo di reddito
      formContext.clearIncomeTypeResponses(incomeType);
      
      // Resetta l'ID della fonte di reddito corrente prima di crearne una nuova
      formContext.resetCurrentIncomeSource();
      
      // Crea una nuova fonte di reddito
      const newId = formContext.addIncomeSource(incomeType);
      console.log("Created new income source with ID:", newId);
      
      // Verifica la creazione
      setTimeout(() => {
        const allSources = formContext.getIncomeSources();
        const newSource = allSources.find(s => s.id === newId);
        console.log("All sources after creation:", allSources);
        console.log("New source found:", newSource);
      }, 0);
    }
    
    // Se stiamo navigando alla pagina di selezione nuovo reddito, resettiamo lo stato corrente
    if (leadsTo === "nuovo_reddito_secondario") {
      // Resetta l'ID della fonte di reddito corrente
      formContext.resetCurrentIncomeSource();
    }
    
    // Delega alla funzione originale per la navigazione effettiva
    formContext.navigateToNextQuestion(currentQuestionId, leadsTo);
  };
  
  return {
    ...formContext,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    // Sostituisci la funzione di navigazione con la nostra versione estesa
    navigateToNextQuestion
  };
};
