import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FormBlock {
  id: string;
  form_id: string;
  block_data: any;
  sort_order: number;
}

interface Question {
  question_id: string;
  question_text: string;
  question_type: string;
  placeholder_values: any;
}

interface ExtractionResult {
  new_questions: number;
  updated_questions: number;
  unchanged: number;
  errors: string[];
}

function extractQuestionsFromBlock(blockData: any): Question[] {
  const questions: Question[] = [];
  
  if (blockData.questions && Array.isArray(blockData.questions)) {
    for (const question of blockData.questions) {
      if (question.question_id && question.question_text) {
        // Determine question type and values from placeholders
        const placeholders = question.placeholders || {};
        const placeholderKeys = Object.keys(placeholders);
        
        let questionType = 'text';
        let placeholderValues: any = null;
        
        if (placeholderKeys.length > 0) {
          const firstPlaceholder = placeholders[placeholderKeys[0]];
          questionType = firstPlaceholder.type || 'text';
          
          // Extract relevant values based on type
          if (firstPlaceholder.type === 'select' && firstPlaceholder.options) {
            placeholderValues = {
              options: firstPlaceholder.options.map((opt: any) => ({
                id: opt.id,
                label: opt.label,
                leads_to: opt.leads_to
              }))
            };
          } else if (firstPlaceholder.type === 'input') {
            placeholderValues = {
              input_type: firstPlaceholder.input_type,
              placeholder_label: firstPlaceholder.placeholder_label,
              input_validation: firstPlaceholder.input_validation
            };
          } else if (firstPlaceholder.type === 'MultiBlockManager') {
            placeholderValues = {
              add_block_label: firstPlaceholder.add_block_label,
              blockBlueprint: firstPlaceholder.blockBlueprint
            };
          } else {
            placeholderValues = firstPlaceholder;
          }
        }
        
        questions.push({
          question_id: question.question_id,
          question_text: question.question_text,
          question_type: questionType,
          placeholder_values: placeholderValues
        });
      }
    }
  }
  
  return questions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const result: ExtractionResult = {
      new_questions: 0,
      updated_questions: 0,
      unchanged: 0,
      errors: []
    };

    // 1. Get all form blocks from active forms
    const { data: formBlocks, error: blocksError } = await supabaseClient
      .from('form_blocks')
      .select(`
        id,
        form_id,
        block_data,
        sort_order,
        forms!inner(is_active)
      `)
      .eq('forms.is_active', true);

    if (blocksError) {
      throw new Error(`Failed to fetch form blocks: ${blocksError.message}`);
    }

    // 2. Extract all questions from blocks
    const allQuestions: Question[] = [];
    
    for (const block of formBlocks as any[]) {
      try {
        const questions = extractQuestionsFromBlock(block.block_data);
        allQuestions.push(...questions);
      } catch (error) {
        result.errors.push(`Error extracting from block ${block.id}: ${error.message}`);
      }
    }

    // 3. Group questions by question_id and detect changes
    const questionGroups = new Map<string, Question[]>();
    
    for (const question of allQuestions) {
      if (!questionGroups.has(question.question_id)) {
        questionGroups.set(question.question_id, []);
      }
      questionGroups.get(question.question_id)!.push(question);
    }

    // 4. Get existing question_ids from database
    const { data: existingQuestions, error: existingError } = await supabaseClient
      .from('question_ids')
      .select('*');

    if (existingError) {
      throw new Error(`Failed to fetch existing questions: ${existingError.message}`);
    }

    const existingQuestionMap = new Map(
      existingQuestions.map(q => [q.question_id, q])
    );

    // 5. Process each question group
    for (const [questionId, questions] of questionGroups) {
      try {
        // Take the first occurrence as the canonical version
        const canonicalQuestion = questions[0];
        
        // Check if question exists
        const existingQuestion = existingQuestionMap.get(questionId);
        
        if (!existingQuestion) {
          // New question - create it
          const { data: newQuestionRecord, error: insertError } = await supabaseClient
            .from('question_ids')
            .insert({
              question_id: questionId,
              current_version: 1,
              description: null
            })
            .select()
            .single();

          if (insertError) {
            result.errors.push(`Failed to create question ${questionId}: ${insertError.message}`);
            continue;
          }

          // Create first version
          const { error: versionError } = await supabaseClient
            .from('question_versions')
            .insert({
              question_id_record: newQuestionRecord.id,
              version_number: 1,
              question_text: canonicalQuestion.question_text,
              question_type: canonicalQuestion.question_type,
              placeholder_values: canonicalQuestion.placeholder_values,
              is_active: true
            });

          if (versionError) {
            result.errors.push(`Failed to create version for question ${questionId}: ${versionError.message}`);
            continue;
          }

          result.new_questions++;
        } else {
          // Existing question - check if we need a new version
          const { data: latestVersion, error: versionError } = await supabaseClient
            .from('question_versions')
            .select('*')
            .eq('question_id_record', existingQuestion.id)
            .eq('is_active', true)
            .single();

          if (versionError && versionError.code !== 'PGRST116') {
            result.errors.push(`Failed to fetch version for question ${questionId}: ${versionError.message}`);
            continue;
          }

          // Check if content has changed
          const hasChanged = !latestVersion || 
            latestVersion.question_text !== canonicalQuestion.question_text ||
            latestVersion.question_type !== canonicalQuestion.question_type ||
            JSON.stringify(latestVersion.placeholder_values) !== JSON.stringify(canonicalQuestion.placeholder_values);

          if (hasChanged) {
            // Deactivate current version
            if (latestVersion) {
              await supabaseClient
                .from('question_versions')
                .update({ is_active: false })
                .eq('question_id_record', existingQuestion.id)
                .eq('is_active', true);
            }

            // Create new version
            const newVersionNumber = (existingQuestion.current_version || 0) + 1;
            
            const { error: newVersionError } = await supabaseClient
              .from('question_versions')
              .insert({
                question_id_record: existingQuestion.id,
                version_number: newVersionNumber,
                question_text: canonicalQuestion.question_text,
                question_type: canonicalQuestion.question_type,
                placeholder_values: canonicalQuestion.placeholder_values,
                is_active: true
              });

            if (newVersionError) {
              result.errors.push(`Failed to create new version for question ${questionId}: ${newVersionError.message}`);
              continue;
            }

            // Update current version number
            const { error: updateError } = await supabaseClient
              .from('question_ids')
              .update({ 
                current_version: newVersionNumber,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingQuestion.id);

            if (updateError) {
              result.errors.push(`Failed to update version number for question ${questionId}: ${updateError.message}`);
              continue;
            }

            result.updated_questions++;
          } else {
            result.unchanged++;
          }
        }
      } catch (error) {
        result.errors.push(`Error processing question ${questionId}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );

  } catch (error) {
    console.error('Error in extract-question-ids function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        new_questions: 0,
        updated_questions: 0,
        unchanged: 0,
        errors: [error.message]
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )
  }
})
