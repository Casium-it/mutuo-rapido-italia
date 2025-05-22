
import { supabase } from "@/integrations/supabase/client";
import { FormResponse, FormState } from "@/types/form";

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
    // Ottieni lo slug salvato, se presente
    const slug = localStorage.getItem('user_slug');
    
    // Se esiste uno slug, assicurati che l'header x-slug sia presente nella richiesta
    let options = {};
    if (slug) {
      options = {
        headers: {
          'x-slug': slug
        }
      };
    }
    
    // 1. Crea la submission principale
    const { data: submission, error: submissionError } = await supabase
      .from("form_submissions")
      .insert({
        form_type: formType,
        user_identifier: userIdentifier || null,
        metadata: { form_version: "1.0", slug: slug || null }
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

    // 4. Se esiste uno slug, salviamo la simulazione completata nella tabella simulations
    if (slug) {
      const { error: simulationError } = await supabase
        .from("simulations")
        .insert({
          slug: slug,
          answers: formResponses,
          submitted_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });

      if (simulationError) {
        console.error("Errore nel salvataggio della simulazione:", simulationError);
        // Non facciamo fallire l'intera operazione se fallisce solo l'inserimento in simulations
      }
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

/**
 * Invia i dati del form completato a Supabase
 * @param state - Lo stato attuale del form
 * @returns Risultato dell'operazione con l'ID della submission
 */
export async function submitFormToSupabase(
  state: FormState
): Promise<SubmissionResult> {
  try {
    // Estrai le risposte dal form state
    const { responses } = state;
    
    // Determina il tipo di form in base all'URL o altro criterio
    const formType = window.location.pathname.includes("mutuo") ? "mutuo" : "simulazione";
    
    // Ottieni l'identificatore utente opzionale
    const userIdentifier = localStorage.getItem('user_slug') || undefined;
    
    // Usa la funzione esistente per inviare i dati
    const result = await submitFormResponses(responses, formType, userIdentifier);
    
    return result;
  } catch (error) {
    console.error("Errore durante l'invio del form:", error);
    return { 
      success: false, 
      error: "Si è verificato un errore durante l'invio del form" 
    };
  }
}
