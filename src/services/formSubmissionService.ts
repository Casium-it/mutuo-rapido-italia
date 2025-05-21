
import { supabase } from "@/integrations/supabase/client";
import { FormResponse } from "@/types/form";

type SubmissionResult = {
  success: boolean;
  submissionId?: string;
  error?: string;
};

/**
 * Salva tutte le risposte del form su Supabase
 * @param formResponses - Le risposte dal form context
 * @param formType - Il tipo di form (es. "mutuo", "simulazione")
 * @param userIdentifier - Identificatore opzionale dell'utente
 * @returns Risultato dell'operazione con l'ID della submission
 */
export async function submitFormResponses(
  formResponses: FormResponse,
  formType: string,
  userIdentifier?: string
): Promise<SubmissionResult> {
  try {
    // 1. Crea la submission principale
    const { data: submission, error: submissionError } = await supabase
      .from("form_submissions")
      .insert({
        form_type: formType,
        user_identifier: userIdentifier || null,
        metadata: { form_version: "1.0" }
      })
      .select()
      .single();

    if (submissionError || !submission) {
      console.error("Errore nella creazione della submission:", submissionError);
      return { success: false, error: "Errore nel salvataggio dei dati" };
    }

    // 2. Prepara le risposte individuali per ogni domanda
    const formResponsesArray = Object.entries(formResponses).map(([questionId, responses]) => {
      // Ogni questionId ha un oggetto di risposte per i diversi placeholder
      const blockId = questionId.split(".")[0]; // Assumiamo che il questionId sia nel formato "blockId.questionNumber"
      
      return {
        submission_id: submission.id,
        question_id: questionId,
        question_text: questionId, // Idealmente dovremmo avere il testo reale della domanda
        block_id: blockId,
        response_value: responses
      };
    });

    // 3. Inserisci tutte le risposte individuali
    const { error: responsesError } = await supabase
      .from("form_responses")
      .insert(formResponsesArray);

    if (responsesError) {
      console.error("Errore nel salvataggio delle risposte:", responsesError);
      return { success: false, error: "Errore nel salvataggio delle risposte" };
    }

    return { 
      success: true, 
      submissionId: submission.id 
    };
  } catch (error) {
    console.error("Errore imprevisto:", error);
    return { success: false, error: "Errore imprevisto durante il salvataggio" };
  }
}
