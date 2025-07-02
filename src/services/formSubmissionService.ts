
import { supabase } from "@/integrations/supabase/client";
import { FormResponse, FormState, Block } from "@/types/form";
import { findQuestionInfo, validateQuestionsExist } from "@/utils/questionLookup";
import { formCacheService } from "@/services/formCacheService";

type SubmissionResult = {
  success: boolean;
  submissionId?: string;
  error?: string;
};

/**
 * Invia i dati del form completato a Supabase utilizzando lo stato del form
 * @param state - Lo stato completo del form con tutti i dati
 * @param formSlug - Lo slug del form per recuperare i blocchi dalla cache
 * @returns Risultato dell'operazione con l'ID della submission
 */
export async function submitFormToSupabase(
  state: FormState,
  formSlug: string
): Promise<SubmissionResult> {
  try {
    console.log("Inizio invio form a Supabase...");
    console.log("Form slug:", formSlug);
    console.log("Responses count:", Object.keys(state.responses).length);
    
    // Recupera i blocchi dalla cache memoria usando il formSlug
    const formSnapshot = await formCacheService.getFormSnapshot(formSlug);
    
    if (!formSnapshot || !formSnapshot.blocks || formSnapshot.blocks.length === 0) {
      console.error("FormSubmissionService: No cache memory blocks found for form:", formSlug);
      throw new Error(`Nessun blocco trovato nella cache per il form: ${formSlug}`);
    }
    
    const cacheMemoryBlocks = formSnapshot.blocks;
    console.log("Cache memory blocks count:", cacheMemoryBlocks.length);
    console.log("Dynamic blocks count:", state.dynamicBlocks?.length || 0);
    
    // Ottieni il parametro referral dall'URL se presente
    const searchParams = new URLSearchParams(window.location.search);
    const referralId = searchParams.get('ref');
    
    // Determina il tipo di form dall'URL
    const formType = window.location.pathname.includes("mutuo") ? "mutuo" : "simulazione";
    
    // Calculate expiry time (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // Validate that all questions exist in the provided blocks
    const missingQuestions = validateQuestionsExist(
      state.responses, 
      cacheMemoryBlocks, 
      state.dynamicBlocks || []
    );
    
    if (missingQuestions.length > 0) {
      console.error("Missing questions in blocks:", missingQuestions);
      console.log("Available cache memory blocks:", cacheMemoryBlocks.map(b => ({ id: b.block_id, questions: b.questions.length })));
      console.log("Available dynamic blocks:", (state.dynamicBlocks || []).map(b => ({ id: b.block_id, questions: b.questions.length })));
    }
    
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
          blockActivations: Object.keys(state.blockActivations).length,
          cacheMemoryBlocksCount: cacheMemoryBlocks.length,
          missingQuestionsCount: missingQuestions.length,
          formSlug: formSlug
        }
      })
      .select('id')
      .single();

    if (submissionError) {
      console.error("Errore nella creazione della submission:", submissionError);
      throw submissionError;
    }

    console.log("Submission creata con ID:", submission.id);

    // 2. Prepara i dati delle risposte
    const responsesData = [];
    
    for (const questionId in state.responses) {
      // Trova la domanda usando la utility function con i blocchi dalla cache
      const questionInfo = findQuestionInfo(
        questionId, 
        cacheMemoryBlocks, 
        state.dynamicBlocks || []
      );
      
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
        console.warn(`Question ${questionId} not found in cache memory blocks - skipping`);
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
    } else {
      console.warn("No valid responses to save");
    }

    console.log("Form submission completed successfully");
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
