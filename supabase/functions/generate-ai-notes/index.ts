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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId, type, existingAiNotes } = await req.json();
    
    console.log('Generating AI notes for submission:', submissionId, 'Type:', type);

    // Get submission data with responses
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      throw new Error(`Failed to fetch submission: ${submissionError.message}`);
    }

    // Get form responses for this submission
    const { data: responses, error: responsesError } = await supabase
      .from('form_responses')
      .select('*')
      .eq('submission_id', submissionId);

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    // Prepare data for AI
    const userData = {
      name: `${submission.first_name || ''} ${submission.last_name || ''}`.trim(),
      email: submission.email,
      phone: submission.phone_number,
      existingNotes: submission.notes,
      responses: responses.map(r => ({
        question: r.question_text,
        answer: r.response_value
      }))
    };

    let prompt = '';
    if (type === 'generate') {
      prompt = `Analizza i seguenti dati di un lead per un servizio di consulenza mutui e genera note dettagliate in italiano.

Dati del Lead:
Nome: ${userData.name}
Email: ${userData.email}
Telefono: ${userData.phone}
Note esistenti: ${userData.existingNotes || 'Nessuna nota'}

Risposte del form:
${userData.responses.map(r => `Q: ${r.question}\nR: ${JSON.stringify(r.answer)}`).join('\n\n')}

Genera un'analisi strutturata che includa:
- Riassunto della situazione del cliente
- Punti chiave dalle risposte
- Suggerimenti per il follow-up
- Priorità del lead

Rispondi in italiano in formato testo semplice, ben strutturato e professionale.`;
    } else {
      prompt = `Questa è la tua analisi generata precedentemente per un lead di consulenza mutui:

${existingAiNotes}

Dati aggiornati del Lead:
Nome: ${userData.name}
Email: ${userData.email}
Telefono: ${userData.phone}
Note esistenti: ${userData.existingNotes || 'Nessuna nota'}

Risposte del form:
${userData.responses.map(r => `Q: ${r.question}\nR: ${JSON.stringify(r.answer)}`).join('\n\n')}

Rivedi e migliora l'analisi precedente basandoti sui dati aggiornati e sulle note esistenti. Mantieni la struttura ma aggiorna e arricchisci il contenuto dove necessario.

Rispondi in italiano in formato testo semplice, ben strutturato e professionale.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto consulente immobiliare specializzato in mutui. Analizza i dati dei lead e genera note professionali dettagliate per aiutare il team commerciale.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedNotes = data.choices[0].message.content;

    // Update the submission with AI notes
    const { error: updateError } = await supabase
      .from('form_submissions')
      .update({ ai_notes: generatedNotes })
      .eq('id', submissionId);

    if (updateError) {
      throw new Error(`Failed to save AI notes: ${updateError.message}`);
    }

    console.log('AI notes generated and saved successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      aiNotes: generatedNotes 
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