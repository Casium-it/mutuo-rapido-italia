import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get option label from block data
function getOptionLabel(blockData: any, questionId: string, optionValue: string): string {
  try {
    if (!blockData?.questions) return optionValue;
    
    const question = blockData.questions.find((q: any) => q.question_id === questionId);
    if (!question?.placeholders) return optionValue;
    
    // Fix: placeholders is an object, not an array - use Object.entries()
    for (const [placeholderKey, placeholder] of Object.entries(question.placeholders)) {
      if (placeholder && typeof placeholder === 'object' && placeholder.type === 'select' && placeholder.options) {
        const option = placeholder.options.find((opt: any) => opt.id === optionValue);
        if (option?.label) return option.label;
      }
    }
    return optionValue;
  } catch (error) {
    console.error('Error getting option label:', error);
    return optionValue;
  }
}

// Helper function to format response value with labels
function formatResponseValue(value: any, blockData: any, questionId: string): string {
  try {
    if (typeof value === 'string') {
      return getOptionLabel(blockData, questionId, value);
    }
    
    if (Array.isArray(value)) {
      return value.map(v => getOptionLabel(blockData, questionId, v)).join(', ');
    }
    
    if (typeof value === 'object' && value !== null) {
      if (value.value !== undefined) {
        return formatResponseValue(value.value, blockData, questionId);
      }
      return JSON.stringify(value);
    }
    
    return String(value);
  } catch (error) {
    console.error('Error formatting response value:', error);
    return String(value);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId, type, existingAiNotes } = await req.json();
    
    console.log('Generating AI notes for submission:', submissionId, 'Type:', type);

    // Fetch the appropriate AI prompt from database
    const promptName = type === 'improve' ? 'Migliora Note' : 'Genera Note';
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', promptName)
      .eq('is_active', true)
      .single();

    if (promptError || !promptData) {
      throw new Error(`Failed to fetch AI prompt "${promptName}": ${promptError?.message || 'Prompt not found'}`);
    }

    console.log('Using AI prompt:', promptData.name, 'Model:', promptData.model);

    // Get submission data
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select(`
        *,
        forms!inner(title),
        saved_simulations(form_state)
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      throw new Error(`Failed to fetch submission: ${submissionError.message}`);
    }

    if (!submission.saved_simulations?.form_state) {
      throw new Error('No saved simulation found for this submission');
    }

    // Get form blocks for label mapping
    const { data: formBlocks, error: blocksError } = await supabase
      .from('form_blocks')
      .select('*')
      .eq('form_id', submission.form_id)
      .order('sort_order');

    if (blocksError) {
      throw new Error(`Failed to fetch form blocks: ${blocksError.message}`);
    }

    // Create block lookup map
    const blockMap = new Map();
    formBlocks?.forEach(block => {
      blockMap.set(block.block_data.block_id, block.block_data);
    });

    const formState = submission.saved_simulations.form_state;
    const responses = formState.responses || {};

    // Convert form state responses to formatted sentences
    const formattedSentences: string[] = [];
    
    for (const [questionId, responseData] of Object.entries(responses)) {
      // Find the block containing this question
      let questionText = questionId;
      let blockId = '';
      
      for (const [blockKey, blockData] of blockMap.entries()) {
        const question = blockData.questions?.find((q: any) => q.question_id === questionId);
        if (question) {
          questionText = question.question_text || questionId;
          blockId = blockKey;
          break;
        }
      }
      
      // Format the response value with proper labels
      let formattedValue = '';
      if (typeof responseData === 'object' && responseData !== null) {
        // Handle different response formats
        for (const [key, value] of Object.entries(responseData)) {
          const blockData = blockMap.get(blockId);
          const labelValue = formatResponseValue(value, blockData, questionId);
          formattedValue += `${labelValue} `;
        }
        formattedValue = formattedValue.trim();
      } else {
        const blockData = blockMap.get(blockId);
        formattedValue = formatResponseValue(responseData, blockData, questionId);
      }
      
      // Replace placeholders in question text with the formatted answer
      let completeSentence = questionText;
      if (questionText.includes('{{placeholder')) {
        // Replace all placeholder patterns with the answer
        completeSentence = questionText.replace(/\{\{placeholder\d*\}\}/g, formattedValue);
      } else {
        // If no placeholder, just combine question and answer
        completeSentence = `${questionText}: ${formattedValue}`;
      }
      
      formattedSentences.push(completeSentence);
    }

    // Get today's date in ISO format
    const todayIso = new Date().toISOString().split('T')[0];

    // Prepare structured data for the AI
    const leadMetadata = {
      submission_id: submission.id,
      created_at: submission.created_at,
      first_name: submission.first_name,
      last_name: submission.last_name,
      email: submission.email,
      phone_number: submission.phone_number,
      lead_status: submission.lead_status,
      consulting: submission.consulting,
      form_title: submission.forms?.title || 'Simulazione Mutuo'
    };

    // Join all formatted sentences into a single text
    const formRaw = formattedSentences.join('. ');

    const notesText = submission.notes || 'Nessuna nota aggiuntiva disponibile';

    // Prepare variables for prompt replacement
    const variables = {
      today_iso: todayIso,
      lead_metadata: JSON.stringify(leadMetadata),
      form_raw: JSON.stringify(formRaw),
      notes_text: notesText,
      existing_notes: existingAiNotes || ''
    };

    // Build messages from the prompt template with variable replacement
    const messages = promptData.messages.map((message: any) => {
      let content = message.content;
      
      // Replace all variables in the content
      promptData.variables.forEach((variable: string) => {
        const placeholder = `{{${variable}}}`;
        const value = variables[variable as keyof typeof variables] || '';
        content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      });
      
      return {
        role: message.role,
        content: content
      };
    });

    console.log('🚀 Calling OpenAI with dynamic prompt...');
    console.log('📝 Using prompt:', promptData.name);
    console.log('🤖 Model:', promptData.model);
    console.log('📊 Variables replaced:', promptData.variables.join(', '));
    
    const requestBody = {
      model: promptData.model,
      messages: messages,
      max_completion_tokens: 10000
    };
    
    console.log('📤 Request body keys:', Object.keys(requestBody));
    console.log('📤 Messages array length:', requestBody.messages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 OpenAI response status:', response.status);
    console.log('📥 OpenAI response ok:', response.ok);
    console.log('📥 OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📋 OpenAI response structure:', Object.keys(data));
    console.log('📋 OpenAI choices length:', data.choices?.length || 0);
    if (data.usage) {
      console.log('📊 Token usage:', data.usage);
    }
    if (data.error) {
      console.error('❌ OpenAI API returned error:', data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    const rawResponse = data.choices[0].message.content;
    
    console.log('🤖 Raw AI response length:', rawResponse?.length || 0);
    console.log('🤖 Raw AI response preview:', rawResponse?.substring(0, 200) + '...');
    console.log('🤖 Raw AI response full:', rawResponse);

    // Parse JSON response
    let aiResult;
    try {
      // Clean the response to extract JSON
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in AI response:', rawResponse);
        throw new Error('No JSON found in response');
      }
      
      console.log('📋 Extracted JSON string:', jsonMatch[0]);
      aiResult = JSON.parse(jsonMatch[0]);
      
      console.log('✅ Parsed AI result:', aiResult);
      
      if (!aiResult.response || typeof aiResult.confidence !== 'number') {
        console.error('❌ Invalid JSON structure:', aiResult);
        throw new Error('Invalid JSON structure');
      }
      
      // Check if response is empty or just whitespace
      if (!aiResult.response.trim()) {
        console.error('❌ AI returned empty response text');
        throw new Error('AI returned empty response text');
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      console.log('🔄 Raw AI response was:', rawResponse);
      console.log('📝 Using full raw response as AI notes since JSON parsing failed');
      // Use the full raw response as AI notes when JSON parsing fails
      aiResult = {
        response: rawResponse || 'Errore nella generazione delle note AI',
        confidence: 30
      };
    }

    // Format the final notes with confidence score
    const finalNotes = `[${aiResult.confidence}] - ${aiResult.response}`;
    
    console.log('✅ Final AI result - Confidence:', aiResult.confidence);
    console.log('✅ Final AI result - Response length:', aiResult.response?.length || 0);
    console.log('✅ Final AI result - Response preview:', aiResult.response?.substring(0, 200) + '...');
    console.log('💾 Final notes to save:', finalNotes.substring(0, 300) + '...');

    // Update the submission with AI notes
    const { error: updateError } = await supabase
      .from('form_submissions')
      .update({ ai_notes: finalNotes })
      .eq('id', submissionId);

    if (updateError) {
      throw new Error(`Failed to save AI notes: ${updateError.message}`);
    }

    console.log('Enhanced AI notes generated and saved successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      aiNotes: finalNotes,
      confidence: aiResult.confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-notes function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});