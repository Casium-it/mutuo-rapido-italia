
import { supabase } from "@/integrations/supabase/client";
import { FormResponse, FormState } from "@/types/form";

type SubmissionResult = {
  success: boolean;
  submissionId?: string;
  error?: string;
};

type SubmissionOptions = {
  formSource?: 'database' | 'static';
  formSlug?: string;
};

/**
 * Enhanced form submission service with comprehensive debugging and database form support
 * @param state - Lo stato attuale del form
 * @param blocks - I blocchi del form per ottenere i testi delle domande
 * @param options - Opzioni aggiuntive per la submission
 * @returns Risultato dell'operazione con l'ID della submission
 */
export async function submitFormToSupabase(
  state: FormState,
  blocks: any[],
  options: SubmissionOptions = {}
): Promise<SubmissionResult> {
  try {
    console.log("🚀 FormSubmissionService: Starting enhanced form submission");
    console.log("📊 FormSubmissionService: Input data analysis:", {
      responsesCount: Object.keys(state.responses).length,
      activeBlocksCount: state.activeBlocks.length,
      blocksCount: blocks.length,
      dynamicBlocksCount: state.dynamicBlocks?.length || 0,
      formSource: options.formSource || 'unknown',
      formSlug: options.formSlug || 'unknown'
    });
    
    // Debug responses structure
    console.log("📝 FormSubmissionService: Responses detail:");
    Object.entries(state.responses).forEach(([questionId, response]) => {
      console.log(`   Question ${questionId}:`, response);
    });
    
    // Debug blocks available
    console.log("🧱 FormSubmissionService: Available blocks:", {
      staticBlocks: blocks.filter(b => !state.dynamicBlocks?.some(db => db.block_id === b.block_id)).map(b => ({
        id: b.block_id,
        questionsCount: b.questions?.length || 0
      })),
      dynamicBlocks: (state.dynamicBlocks || []).map(b => ({
        id: b.block_id,
        questionsCount: b.questions?.length || 0
      }))
    });
    
    // Ottieni il parametro referral dall'URL se presente
    const searchParams = new URLSearchParams(window.location.search);
    const referralId = searchParams.get('ref');
    
    // Determina il tipo di form - enhanced logic
    let formType = "simulazione"; // default
    if (options.formSlug) {
      formType = options.formSlug;
    } else if (window.location.pathname.includes("mutuo")) {
      formType = "mutuo";
    }
    
    console.log("📋 FormSubmissionService: Submission metadata:", {
      referralId,
      formType,
      formSource: options.formSource,
      url: window.location.pathname
    });
    
    // Calculate expiry time (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // 1. Crea la submission principale
    console.log("💾 FormSubmissionService: Creating main submission record");
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
          formSource: options.formSource || 'static',
          formSlug: options.formSlug || null,
          submissionContext: {
            totalQuestions: Object.keys(state.responses).length,
            totalBlocks: blocks.length,
            timestamp: new Date().toISOString()
          }
        }
      })
      .select('id')
      .single();

    if (submissionError) {
      console.error("❌ FormSubmissionService: Error creating submission:", submissionError);
      throw submissionError;
    }

    console.log("✅ FormSubmissionService: Main submission created with ID:", submission.id);

    // 2. Prepara i dati delle risposte con logica migliorata
    console.log("🔍 FormSubmissionService: Processing responses for database insertion");
    const responsesData = [];
    const questionLookupStats = {
      found: 0,
      notFound: 0,
      questionIds: Object.keys(state.responses)
    };
    
    for (const questionId in state.responses) {
      console.log(`🔎 FormSubmissionService: Processing question ${questionId}`);
      
      // Enhanced question finding logic
      let question = null;
      let blockId = null;
      let questionSource = 'unknown';
      
      // 1. First, try to find in static blocks
      for (const block of blocks) {
        if (block.questions) {
          const foundQuestion = block.questions.find(q => q.question_id === questionId);
          if (foundQuestion) {
            question = foundQuestion;
            blockId = block.block_id;
            questionSource = 'static';
            break;
          }
        }
      }
      
      // 2. If not found in static blocks, try dynamic blocks
      if (!question && state.dynamicBlocks) {
        for (const block of state.dynamicBlocks) {
          if (block.questions) {
            const foundQuestion = block.questions.find(q => q.question_id === questionId);
            if (foundQuestion) {
              question = foundQuestion;
              blockId = block.block_id;
              questionSource = 'dynamic';
              break;
            }
          }
        }
      }
      
      if (question && blockId) {
        console.log(`✅ FormSubmissionService: Found question ${questionId} in ${questionSource} block ${blockId}`);
        questionLookupStats.found++;
        
        const responseData = state.responses[questionId];
        
        responsesData.push({
          submission_id: submission.id,
          question_id: questionId,
          question_text: question.question_text,
          block_id: blockId,
          response_value: responseData
        });
      } else {
        console.warn(`⚠️ FormSubmissionService: Question ${questionId} not found in any block`);
        questionLookupStats.notFound++;
        
        // Create a fallback response record
        responsesData.push({
          submission_id: submission.id,
          question_id: questionId,
          question_text: `Unknown question: ${questionId}`,
          block_id: 'unknown',
          response_value: state.responses[questionId]
        });
      }
    }
    
    console.log("📊 FormSubmissionService: Question lookup statistics:", questionLookupStats);
    console.log("📝 FormSubmissionService: Prepared responses data:", {
      totalResponses: responsesData.length,
      questionsFound: questionLookupStats.found,
      questionsNotFound: questionLookupStats.notFound
    });
    
    // 3. Inserisci tutte le risposte
    if (responsesData.length > 0) {
      console.log("💾 FormSubmissionService: Inserting responses into database");
      const { error: responsesError } = await supabase
        .from('form_responses')
        .insert(responsesData);
      
      if (responsesError) {
        console.error("❌ FormSubmissionService: Error saving responses:", responsesError);
        throw responsesError;
      }
      
      console.log(`✅ FormSubmissionService: Successfully saved ${responsesData.length} responses`);
    } else {
      console.warn("⚠️ FormSubmissionService: No responses to save!");
    }

    console.log("🎉 FormSubmissionService: Form submission completed successfully");
    return { 
      success: true, 
      submissionId: submission.id 
    };
    
  } catch (error) {
    console.error("💥 FormSubmissionService: Critical error during submission:", error);
    console.error("📋 FormSubmissionService: Error context:", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      responsesCount: Object.keys(state.responses).length,
      blocksCount: blocks.length,
      formSource: options.formSource
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto durante il salvataggio" 
    };
  }
}
