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
    
    for (const placeholder of question.placeholders) {
      if (placeholder.type === 'select' && placeholder.options) {
        const option = placeholder.options.find((opt: any) => opt.value === optionValue);
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

    // Convert form state responses to structured format with labels
    const formattedResponses: any[] = [];
    
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
      
      formattedResponses.push({
        question_id: questionId,
        block_id: blockId,
        question_text: questionText,
        response_value: formattedValue
      });
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

    const formRaw = formattedResponses.reduce((acc, response) => {
      acc[response.question_id] = {
        question: response.question_text,
        answer: response.response_value,
        block_id: response.block_id
      };
      return acc;
    }, {});

    const notesText = submission.notes || 'Nessuna nota aggiuntiva disponibile';

    // Build the enhanced prompt
    const systemPrompt = `RUOLO
- Sei un assistente specializzato in pratiche di mutuo.
- Fondi i dati del FORM con le NOTE qualitative e generi un testo operativo per un mediatore.

CONTRATTO DI OUTPUT (vincoli duri)
- Devi restituire SOLO un JSON con esattamente due campi top-level:
  {
    "response": "<testo in italiano, strutturato per il mediatore>",
    "confidence": <intero 0-100>
  }
- Niente altri campi, niente spiegazioni fuori dal JSON.

SCALA DI PRIORITÀ (in caso di conflitti di regole)
1) Contratto di output (forma del JSON).
2) Regole di fusione e coerenza dati.
3) Regole di calcolo e normalizzazione (date/valori/LTV).
4) Regole di struttura sezione e titolazione.
5) Stile e resa linguistica.

REGOLE DI FUSIONE (FORM + NOTE)
- Se c'è conflitto tra FORM e NOTE, prevalgono sempre le NOTE.
- Se le NOTE sono mute su un punto, usa il FORM.
- Non inventare dati mancanti; ometti la sezione se non ci sono informazioni utili (quando previsto).

NORMALIZZAZIONI E CALCOLI
- Date relative → sempre in ISO (YYYY-MM-DD), calcolate rispetto a ${todayIso}.
- Importi in EUR; percentuali con "%" senza spazi superflui.
- Arrotondamenti:
  - Titolo ≤80%: importo mutuo richiesto arrotondato al migliaio ("k").
- LTV: se non fornito ma sono noti importo mutuo richiesto e prezzo immobile, calcolalo come (mutuo/prezzo)*100 e usa due cifre di precisione.
- Regole titolo (scegli una sola opzione, in quest'ordine di controllo):
  1) Se LTV = 100 → "LEAD MUTUO 100%"
  2) Se LTV ≥ 95 e < 100 → "LEAD MUTUO 95%"
  3) Se LTV > 80 e < 95 → "LEAD MUTUO [percentuale LTV]%"
  4) Se LTV ≤ 80 → "LEAD MUTUO [importo mutuo richiesto]k"

STRUTTURA DEL TESTO (ordine rigido dentro "response")
1. Titolo (secondo regole LTV/importo)
2. 🏠 Situazione Immobile e Acquisto
3. 💼 Mutuo Richiesto  (solo: importo richiesto, anticipo previsto, finalità)
4. 👤 Richiedente / 👤 Richiedente 1
   - Anagrafica (età, residenza, nucleo familiare, figli a carico, situazione abitativa)
   - Professione principale (contratto, ruolo, reddito netto, mensilità, bonus/benefit)
   - Redditi secondari (fonte, importo, stabilità)
   - Finanziamenti (intestatario, tipo, rata, residuo, scadenza; se nessuno: "Nessun finanziamento attivo")
5. 👤 Richiedente 2 (se presente) con la stessa struttura
6. 👤 Coniuge (non intestatario) (se presente)
7. 💰 Disponibilità economica per l'acquisto
8. 📜 Storico Creditizio (includi SOLO se ci sono dati, altrimenti ometti)
9. 📆 Prossimi passi e note aggiuntive (unifica obiettivi, contesto, preferenze di contatto, urgenze, pre-delibera se esplicitata nelle NOTE)

REGOLE DI STILE (per il contenuto in "response")
- Linguaggio: discorsivo, naturale, frasi brevi e chiare.
- "Bullet point discorsivi": ogni bullet è una frase compiuta (es. ✅ "Ha 35 anni e vive a Milano"; ❌ "Età: 35").
- Evita paragrafi lunghi; non inserire sezioni vuote o irrilevanti.
- "💰 Disponibilità economica" va nominata esattamente "💰 Disponibilità economica per l'acquisto".
- "🏠 Situazione Immobile e Acquisto" deve riportare lo stato dell'acquisto (offerta accettata, compromesso, ricerca in corso, ecc.).
  - Se dalle NOTE è esplicitamente "pre-delibera", dichiaralo chiaramente; non dedurre se non scritto.

AUTOVALUTAZIONE "confidence" (0–100)
- Parti da 100 e sottrai:
  - −20 per ogni sezione chiave mancante non per scelta (2–3–4–7–9).
  - −10 per conflitti non risolti (FORM vs NOTE).
  - −10 se non hai potuto normalizzare date relative.
  - −5 per informazioni chiaramente parziali in sezioni presenti.
- Limita tra 0 e 100 (intero).

COMPORTAMENTI VIETATI
- Fare domande o chiedere chiarimenti.
- Aggiungere testo fuori dal JSON.
- Includere metadati tecnici o spiegazioni del processo.`;

    const userPrompt = `CONTESTO
- Oggi: ${todayIso}
- Valuta: EUR — Locale: it-IT
- Fonti dati:
  1) FORM (JSON grezzo con le risposte del questionario)
  2) NOTE QUALITATIVE (testo libero da PDF/telefonata)
- Obiettivo: produrre note professionali, discorsive e complete, pronte per il mediatore.

INPUT (dati da fondere)
\`\`\`json
{
  "LEAD_METADATA": ${JSON.stringify(leadMetadata)},
  "FORM_RAW": ${JSON.stringify(formRaw)},
  "NOTES_QUALITATIVE": "${notesText}"
}
\`\`\``;

    console.log('Calling OpenAI with enhanced prompt...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawResponse = data.choices[0].message.content;
    
    console.log('Raw AI response:', rawResponse);

    // Parse JSON response
    let aiResult;
    try {
      // Clean the response to extract JSON
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      aiResult = JSON.parse(jsonMatch[0]);
      
      if (!aiResult.response || typeof aiResult.confidence !== 'number') {
        throw new Error('Invalid JSON structure');
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: treat as plain text with default confidence
      aiResult = {
        response: rawResponse,
        confidence: 50
      };
    }

    // Format the final notes with confidence score
    const finalNotes = `[${aiResult.confidence}] - ${aiResult.response}`;

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