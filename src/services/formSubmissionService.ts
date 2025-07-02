
import { supabase } from "@/integrations/supabase/client";
import { FormResponse, FormState, Block } from "@/types/form";
import { findQuestionInfo } from "@/utils/submissionUtils";

type SubmissionResult = {
  success: boolean;
  submissionId?: string;
  error?: string;
};

/**
 * Invia i dati del form completato a Supabase utilizzando lo stato del form
 * @param state - Lo stato completo del form con tutti i dati
 * @param staticBlocks - I blocchi statici dal FormContext
 * @returns Risultato dell'operazione con l'ID della submission
 */
export async function submitFormToSupabase(
  state: FormState,
  staticBlocks: Block[]
): Promise<SubmissionResult> {
  try {
    console.log("Inizio invio form a Supabase...");
    
    // Ottieni il parametro referral dall'URL se presente
    const searchParams = new URLSearchParams(window.location.search);
    const referralId = searchParams.get('ref');
    
    // Determina il tipo di form dall'URL
    const formType = window.location.pathname.includes("mutuo") ? "mutuo" : "simulazione";
    
    // Calculate expiry time (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // 1. Crea la submission principale
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        user_identifier: referralId || null,
        form_type: formType,
        expires_at: expiresAt.toISOString(),
        metadata: { 
          blocks: state.activeBlocks,
          completedBlocks: state.completedBlocks,
          dynamicBlocks: state.dynamicBlocks?.length || 0,
          answeredQuestions: state.answeredQuestions.size,
          navigationSteps: state.navigationHistory.length,
          blockActivations: Object.keys(state.blockActivations).length
        }
      })
      .select('id')
      .single();

    if (submissionError) {
      console.error("Errore nella creazione della submission:", submissionError);
      throw submissionError;
    }

    console.log("Submission creata con ID:", submission.id);
    console.log("Submission object returned:", submission);

    // 2. Prepara i dati delle risposte
    const responsesData = [];
    
    for (const questionId in state.responses) {
      const questionInfo = findQuestionInfo(questionId, staticBlocks, state.dynamicBlocks || []);
      
      if (questionInfo) {
        const responseData = state.responses[questionId];
        
        responsesData.push({
          submission_id: submission.id,
          question_id: questionId,
          question_text: questionInfo.questionText,
          block_id: questionInfo.blockId,
          response_value: responseData
        });
      } else {
        console.warn(`Question not found in blocks: ${questionId}`);
      }
    }
    
    // 3. Inserisci tutte le risposte
    if (responsesData.length > 0) {
      const { error: responsesError } = await supabase
        .from('form_responses')
        .insert(responsesData);
      
      if (responsesError) {
        console.error("Errore nel salvataggio delle risposte:", responsesError);
        throw responsesError;
      }
      
      console.log(`Salvate ${responsesData.length} risposte`);
    }

    console.log("Returning submission result with ID:", submission.id);
    return { 
      success: true, 
      submissionId: submission.id 
    };
    
  } catch (error) {
    console.error("Errore durante l'invio del form:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto durante il salvataggio" 
    };
  }
}
