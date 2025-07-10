
import { supabase } from "@/integrations/supabase/client";
import { FormResponse, FormState } from "@/types/form";
import { submittedFormStateService } from "./submittedFormStateService";
import { getFormInfoBySlug } from "./formMappingService";

type SubmissionResult = {
  success: boolean;
  submissionId?: string;
  error?: string;
};

/**
 * Invia i dati del form completato a Supabase utilizzando lo stato del form
 * @param state - Lo stato attuale del form
 * @param blocks - I blocchi del form per ottenere i testi delle domande
 * @param formSlug - Slug del form per identificare il tipo corretto
 * @returns Risultato dell'operazione con l'ID della submission
 */
export async function submitFormToSupabase(
  state: FormState,
  blocks: any[],
  formSlug: string
): Promise<SubmissionResult> {
  try {
    console.log("Inizio invio form a Supabase...");
    
    // Ottieni il parametro referral dall'URL se presente
    const searchParams = new URLSearchParams(window.location.search);
    const referralId = searchParams.get('ref');
    
    // Ottieni le informazioni del form dal database usando il formSlug
    const formInfo = await getFormInfoBySlug(formSlug);
    if (!formInfo) {
      console.error("Form non trovato per slug:", formSlug);
      throw new Error(`Form non trovato per slug: ${formSlug}`);
    }
    
    const formType = formInfo.form_type;
    
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
          dynamicBlocks: state.dynamicBlocks?.length || 0
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
      // Trova la domanda nei blocchi statici e dinamici
      let question = blocks
        .flatMap(block => block.questions)
        .find(q => q.question_id === questionId);
      
      // Se non trovata nei blocchi statici, cerca nei blocchi dinamici
      if (!question && state.dynamicBlocks) {
        question = state.dynamicBlocks
          .flatMap(block => block.questions)
          .find(q => q.question_id === questionId);
      }
      
      if (question) {
        // Trova il block_id corretto
        let blockId = blocks.find(
          block => block.questions.some(q => q.question_id === questionId)
        )?.block_id;
        
        // Se non trovato nei blocchi statici, cerca nei dinamici
        if (!blockId && state.dynamicBlocks) {
          blockId = state.dynamicBlocks.find(
            block => block.questions.some(q => q.question_id === questionId)
          )?.block_id;
        }
        
        const responseData = state.responses[questionId];
        
        responsesData.push({
          submission_id: submission.id,
          question_id: questionId,
          question_text: question.question_text,
          block_id: blockId || 'unknown',
          response_value: responseData
        });
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

    // 4. Save submitted form state connected to submission ID
    submittedFormStateService.saveSubmittedFormState(
      submission.id,
      state,
      formSlug
    );

    // 5. Reset current form state after successful submission
    submittedFormStateService.resetCurrentFormState(formSlug);

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
