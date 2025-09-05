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
    const { submissionId, type, existingAiNotes, model } = await req.json();
    
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

    // Determine which model to use based on request
    const selectedModel = model || (type === 'improve' ? 'gpt-5-mini-2025-08-07' : 'gpt-4o-mini');
    
    // Build the enhanced prompt
    const systemPrompt = `RUOLO
- Sei un assistente specializzato in pratiche di mutuo.
- Fondi i dati del FORM con le NOTE qualitative e generi un testo operativo per un mediatore.

CONTRATTO DI OUTPUT (vincoli duri)
- Devi restituire SOLO un JSON con esattamente due campi top-level:
  {
    "response": "<testo in italiano, strutturato per il mediatore OPPURE messaggio di errore grave>",
    "confidence": <intero 0-100>
  }
- Niente altri campi, niente spiegazioni fuori dal JSON.

SCALA DI PRIORITÀ (in caso di conflitti di regole)
1) Contratto di output (forma del JSON).
2) Validazione input ed errori gravi.
3) Regole di fusione e coerenza dati.
4) Regole di calcolo e normalizzazione (date/valori/LTV).
5) Struttura sezioni e titolazione.
6) Stile e resa linguistica.

VALIDAZIONE & ERRORI GRAVI (blocco prima di tutto)
- Se si verifica un ERRORE GRAVE, restituisci:
  {
    "response": "ERRORE GRAVE: <descrizione concisa dell'errore e azione richiesta>",
    "confidence": 0
  }
- Casi tipici (non esaustivi) di ERRORE GRAVE:
  1) INPUT non è JSON valido/parsing fallito.
  2) Entrambi FORM_RAW e NOTES_QUALITATIVE sono assenti, vuoti o illeggibili.
  3) Dati chiave intrinsecamente contraddittori/assurdi (es.: importo mutuo negativo; prezzo immobile ≤0; LTV calcolabile ma NaN/∞; date impossibili).
  4) Richiedenti citati ma impossibile ricostruirne almeno 1 con anagrafica minima (età o equivalente coerente).
  5) Locale/valuta incompatibili con il contesto richiesto (numeri non interpretabili in EUR).
- In presenza di errori NON gravi (lacune parziali), procedi con output normale, stimando "confidence".

REGOLE DI FUSIONE (FORM + NOTE)
- Se c'è conflitto tra FORM e NOTE, prevalgono sempre le NOTE.
- Se le NOTE sono mute su un punto, usa il FORM.
- Non inventare dati mancanti; ometti la sezione quando previsto.

NORMALIZZAZIONI E CALCOLI
- Date relative → sempre in ISO (YYYY-MM-DD), calcolate rispetto a ${todayIso}.
- Importi in EUR; percentuali con "%" senza spazi superflui.
- Arrotondamenti:
  - Titolo ≤80%: usa l'importo mutuo richiesto arrotondato al migliaio con suffisso "k".
- LTV: se non fornito ma noti importo mutuo richiesto e prezzo immobile, calcolalo come (mutuo/prezzo)*100 con due decimali.
- Regole titolo (scegli UNA sola, nell'ordine di controllo):
  1) Se LTV = 100 → "LEAD MUTUO 100%"
  2) Se LTV ≥ 95 e < 100 → "LEAD MUTUO 95%"
  3) Se LTV > 80 e < 95 → "LEAD MUTUO [percentuale LTV]%"
  4) Se LTV ≤ 80 → "LEAD MUTUO [importo mutuo richiesto]k"

STRUTTURA DEL TESTO (ordine rigido dentro "response")
1. Titolo (secondo regole LTV/importo)
2. 🏠 Situazione Immobile e Acquisto
3. 💼 Mutuo Richiesto (solo: importo richiesto, anticipo previsto, finalità)
4. 👤 Richiedente 1 (se presente), poi 👤 Richiedente 2, … fino a N
   - Usa sottotitoli inline preceduti da "> ":
     > Anagrafica  (età, residenza, nucleo familiare, figli a carico, situazione abitativa)
     > Professione principale  (contratto, ruolo, reddito netto, mensilità, bonus/benefit)
     > Redditi secondari  (fonte, importo, stabilità)
     > Finanziamenti  (intestatario, tipo, rata, residuo, scadenza; se nessuno: "Nessun finanziamento attivo")
     > Note particolari  (solo se necessario, per evidenziare eccezioni/chiarimenti)
5. 👤 Coniuge (non intestatario) (se presente) — usa le stesse sotto-sezioni quando utili
6. 💰 Disponibilità economica per l'acquisto
7. 📜 Storico Creditizio (includi SOLO se ci sono dati; altrimenti ometti)
8. 📆 Prossimi passi e note aggiuntive (unifica obiettivi, contesto, preferenze di contatto, urgenze; "pre-delibera" SOLO se esplicitata nelle NOTE)

REGOLE DI STILE (per il contenuto in "response")
- Linguaggio: discorsivo, naturale, frasi brevi e chiare.
- "Bullet point discorsivi": ogni bullet è una frase compiuta (es. ✅ "Ha 35 anni e vive a Milano"; ❌ "Età: 35").
- Evita paragrafi lunghi; non inserire sezioni vuote o irrilevanti.
- Usa esattamente "💰 Disponibilità economica per l'acquisto" per la sezione economica.
- Riporta lo stato dell'acquisto in "🏠 Situazione Immobile e Acquisto".

AUTOVALUTAZIONE "confidence" (0–100)
- Parti da 100 e sottrai:
  - −20 per ogni sezione chiave mancante non per scelta (2–3–6–8).
  - −10 per conflitti non risolti (FORM vs NOTE).
  - −10 se non hai potuto normalizzare date relative.
  - −5 per informazioni chiaramente parziali in sezioni presenti.
- Troncatura: minimo 0, massimo 100 (intero).
- Se ERRORE GRAVE → confidence = 0.

COMPORTAMENTI VIETATI
- Fare domande o chiedere chiarimenti.
- Aggiungere testo fuori dal JSON.
- Includere metadati tecnici o spiegazioni del processo.

ESEMPI DI OUTPUT (contenuto del campo "response" — solo come guida; NON copiarli)
# Esempio 1 (OK)
LEAD MUTUO 95%

🏠 Situazione Immobile e Acquisto
Umberto sta cercando la sua prima casa a Trieste e al momento si sta guardando intorno senza aver ancora individuato un immobile specifico.
Ha indicato un budget indicativo di 150.000 € per l'acquisto, con tipologia classica da privato.
Attualmente vive in affitto e sostiene un canone mensile di 700 €.
Possiede già un altro immobile che non intende vendere per finanziare questa operazione.
È emersa un'incongruenza da chiarire: pur parlando di acquisto come "prima casa", risulta già proprietario di un immobile.

💼 Mutuo Richiesto
La richiesta di mutuo è pari a circa 145.000 €.
L'anticipo disponibile per l'acquisto è di 5.000 €.
La finalità dichiarata è l'acquisto della prima casa.

👤 Richiedente 1
> Anagrafica
Umberto ha 38 anni e risiede in provincia di Trieste.
Il nucleo familiare è composto da tre persone: lui, la moglie e un figlio.
Attualmente vive in affitto con un canone mensile di 700 €.

> Professione principale
Lavora in Fincantieri, nel settore metalmeccanico.
È assunto con contratto a tempo indeterminato, fuori dal periodo di prova.
Svolge il ruolo di impiegato/operaio.
Percepisce un reddito netto di 1.980 € al mese.
Il contratto prevede la 13ª mensilità.
Riceve inoltre un bonus annuo di 1.200 €, pattuito e stabile.
Ha diritto ai buoni pasto come benefit aziendale.

> Redditi secondari
Percepisce un assegno di mantenimento per i figli pari a 402 € al mese.
L'entrata è attiva dal 2024 ed è dichiarata come stabile.

> Finanziamenti
Al momento non ha alcun finanziamento attivo.

💰 Disponibilità economica per l'acquisto
Umberto dispone di un anticipo di 5.000 €.
Non avrà liquidità residua dopo l'anticipo.

📆 Prossimi passi e note aggiuntive
Potrebbe interessargli una pre-delibera, così da poter andare a cercare casa sapendo quanto si può permettere ed essere più competitivo se fa un'offerta.
Ha dato disponibilità a essere contattato tutti i giorni dopo le 15:00.

ESEMPIO DI OUTPUT ERRORE GRAVE (JSON)
{
  "response": "ERRORE GRAVE: INPUT non è JSON valido o FORM_RAW/NOTES_QUALITATIVE assenti; impossibile procedere. Azione richiesta: reinviare i dati in JSON valido con almeno uno tra FORM_RAW o NOTES_QUALITATIVE popolato.",
  "confidence": 0
}`;

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

    console.log('🚀 Calling OpenAI with enhanced prompt...');
    console.log('📝 System prompt preview:', systemPrompt.substring(0, 200) + '...');
    console.log('👤 User prompt preview:', userPrompt.substring(0, 300) + '...');
    console.log('📊 LEAD_METADATA:', JSON.stringify(leadMetadata, null, 2));
    console.log('📋 FORM_RAW keys:', Object.keys(formRaw));
    console.log('📝 NOTES_QUALITATIVE preview:', notesText.substring(0, 100) + '...');
    
    // Enhanced logging for debugging
    console.log('📊 Request details:');
    console.log(`- Model: ${selectedModel}`);
    console.log(`- Type: ${type}`);
    console.log(`- System prompt length: ${systemPrompt.length} chars`);
    console.log(`- User prompt length: ${userPrompt.length} chars`);
    console.log(`- Total prompt length: ${systemPrompt.length + userPrompt.length} chars`);
    console.log(`- Max completion tokens: 10000`);
    
    const requestBody = {
      model: selectedModel,
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