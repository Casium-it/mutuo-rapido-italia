import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface PDFGenerationRequest {
  submissionId: string
}

interface PDFSubmissionData {
  id: string
  created_at: string
  form_title: string
  phone_number: string | null
  consulting: boolean | null
  user_identifier: string | null
  metadata: any
  first_name: string | null
  last_name: string | null
  email: string | null
  notes: string | null
  ai_notes: string | null
  lead_status: string
  mediatore: string | null
  form_id: string | null
  responses: Array<{
    id: string
    question_id: string
    question_text: string
    block_id: string
    response_value: any
    created_at: string
  }>
  formBlocks?: any[]
}

// PDF layout constants
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20; // Margin in mm
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

// Font sizes
const FONT_SIZE_TITLE = 18;
const FONT_SIZE_SUBTITLE = 14;
const FONT_SIZE_SECTION = 12;
const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_SMALL = 9;

// Line heights
const LINE_HEIGHT_TITLE = 8;
const LINE_HEIGHT_NORMAL = 5;
const LINE_HEIGHT_SECTION = 7;

// Helper function to get lead status label in Italian
function getLeadStatusLabel(status: string): string {
  const statusLabels: { [key: string]: string } = {
    'not_contacted': 'Non contattato',
    'contacted': 'Contattato',
    'interested': 'Interessato',
    'not_interested': 'Non interessato',
    'callback_requested': 'Richiamata richiesta',
    'qualified': 'Qualificato',
    'converted': 'Convertito',
    'da_risentire': 'Da risentire',
    'da_assegnare': 'Da assegnare'
  }
  return statusLabels[status] || status
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Add text with automatic line wrapping and return new Y position
 * Preserves manual line breaks from the original text
 */
function addWrappedText(
  pdf: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number,
  fontSize: number = FONT_SIZE_NORMAL,
  lineHeight: number = LINE_HEIGHT_NORMAL
): number {
  pdf.setFontSize(fontSize);
  
  // Split by manual line breaks first to preserve intentional formatting
  const paragraphs = text.split('\n');
  
  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p].trim();
    
    // Handle empty lines (preserve spacing)
    if (paragraph === '') {
      y += lineHeight * 0.5; // Add half line height for empty lines
      continue;
    }
    
    // Split paragraph into lines that fit within maxWidth
    const lines = pdf.splitTextToSize(paragraph, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (y > PAGE_HEIGHT - MARGIN - 10) {
        pdf.addPage();
        y = MARGIN;
      }
      pdf.text(lines[i], x, y);
      y += lineHeight;
    }
    
    // Add extra spacing between paragraphs (except for the last one)
    if (p < paragraphs.length - 1) {
      y += lineHeight * 0.3;
    }
  }
  
  return y;
}

/**
 * Add a section title
 */
function addSectionTitle(
  pdf: jsPDF,
  title: string,
  x: number,
  y: number
): number {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZE_SECTION);
  pdf.setTextColor(36, 92, 79); // #245C4F
  pdf.text(title, x, y);
  pdf.setTextColor(0, 0, 0); // Reset to black
  pdf.setFont('helvetica', 'normal');
  return y + LINE_HEIGHT_SECTION;
}

/**
 * Replace emojis with Italian text alternatives for PDF rendering
 */
function replaceEmojisWithText(text: string): string {
  return text
    // Common property/home emojis
    .replace(/🏠/g, '🏠 Casa')
    .replace(/🏡/g, '🏡 Abitazione')
    .replace(/🏢/g, '🏢 Ufficio')  
    .replace(/🏪/g, '🏪 Negozio')
    .replace(/🏬/g, '🏬 Centro Commerciale')
    .replace(/🏭/g, '🏭 Fabbrica')
    .replace(/🏘️/g, '🏘️ Quartiere')
    
    // Work/profession emojis
    .replace(/💼/g, '💼 Lavoro')
    .replace(/👔/g, '👔 Professionale')
    .replace(/🧑‍💼/g, '🧑‍💼 Impiegato')
    .replace(/👨‍💼/g, '👨‍💼 Manager')
    .replace(/👩‍💼/g, '👩‍💼 Manager')
    .replace(/🔧/g, '🔧 Tecnico')
    .replace(/🚛/g, '🚛 Trasporti')
    .replace(/⚓/g, '⚓ Marino')
    
    // People/family emojis
    .replace(/👤/g, '👤 Persona')
    .replace(/👥/g, '👥 Persone')
    .replace(/👪/g, '👪 Famiglia')
    .replace(/👫/g, '👫 Coppia')
    .replace(/👨‍👩‍👧‍👦/g, '👨‍👩‍👧‍👦 Famiglia')
    
    // Money/finance emojis
    .replace(/💰/g, '💰 Denaro')
    .replace(/💵/g, '💵 Euro')
    .replace(/💳/g, '💳 Carta')
    .replace(/🏦/g, '🏦 Banca')
    .replace(/📊/g, '📊 Grafico')
    .replace(/📈/g, '📈 Crescita')
    .replace(/📉/g, '📉 Calo')
    
    // Documents/admin emojis
    .replace(/📜/g, '📜 Documento')
    .replace(/📋/g, '📋 Modulo')
    .replace(/📄/g, '📄 Pagina')
    .replace(/📃/g, '📃 Carta')
    .replace(/📝/g, '📝 Note')
    .replace(/✍️/g, '✍️ Scrivere')
    .replace(/📁/g, '📁 Cartella')
    .replace(/📂/g, '📂 Archivio')
    
    // Time/calendar emojis
    .replace(/📆/g, '📆 Data')
    .replace(/📅/g, '📅 Calendario')
    .replace(/🗓️/g, '🗓️ Pianificazione')
    .replace(/⏰/g, '⏰ Orario')
    .replace(/⏳/g, '⏳ Attesa')
    .replace(/⌛/g, '⌛ Tempo')
    
    // Status/confirmation emojis
    .replace(/✅/g, '✅ Confermato')
    .replace(/❌/g, '❌ Negato')
    .replace(/⚠️/g, '⚠️ Attenzione')
    .replace(/🔴/g, '🔴 Rosso')
    .replace(/🟡/g, '🟡 Giallo')
    .replace(/🟢/g, '🟢 Verde')
    .replace(/❗/g, '❗ Importante')
    .replace(/❓/g, '❓ Domanda')
    
    // Communication emojis
    .replace(/📞/g, '📞 Telefono')
    .replace(/📱/g, '📱 Cellulare')
    .replace(/📧/g, '📧 Email')
    .replace(/💬/g, '💬 Messaggio')
    .replace(/🗣️/g, '🗣️ Parlare')
    .replace(/👂/g, '👂 Ascoltare')
    
    // General symbols
    .replace(/🎯/g, '🎯 Obiettivo')
    .replace(/🔍/g, '🔍 Ricerca')
    .replace(/🔑/g, '🔑 Chiave')
    .replace(/🚀/g, '🚀 Lancio')
    .replace(/💡/g, '💡 Idea')
    .replace(/⭐/g, '⭐ Stella')
    .replace(/🎉/g, '🎉 Festa')
    .replace(/🎊/g, '🎊 Celebrazione');
}

/**
 * Format response value for display
 */
function formatResponseValue(value: any): string {
  if (value === null || value === undefined) {
    return 'Non specificato';
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return replaceEmojisWithText(value.join(', '));
    }
    
    // Handle placeholder responses
    const placeholderKeys = Object.keys(value).filter(key => key.startsWith('placeholder'));
    if (placeholderKeys.length > 0) {
      return replaceEmojisWithText(placeholderKeys.map(key => value[key]).filter(v => v).join(', '));
    }
    
    return replaceEmojisWithText(JSON.stringify(value));
  }
  
  return replaceEmojisWithText(String(value));
}

/**
 * Get option label from form blocks data
 */
function getOptionLabel(
  responseValue: any,
  placeholderKey: string,
  formBlocks: any[]
): string {
  if (!responseValue || !formBlocks || formBlocks.length === 0) {
    return "";
  }

  let optionValue = "";
  
  // Try to get the response value for this placeholder
  if (typeof responseValue === 'object') {
    const responseForPlaceholder = responseValue[placeholderKey];
    
    if (responseForPlaceholder !== undefined && responseForPlaceholder !== null) {
      optionValue = Array.isArray(responseForPlaceholder) 
        ? responseForPlaceholder[0] // Take first value if array
        : responseForPlaceholder.toString();
    }
  }
  
  // If no response found, try to use the response value directly if it's a simple value
  if (!optionValue && responseValue && typeof responseValue !== 'object') {
    optionValue = responseValue.toString();
  }
  
  if (!optionValue) {
    return "";
  }

  // Search through all form blocks to find the matching option
  for (const block of formBlocks) {
    if (!block.block_data?.questions) continue;
    
    for (const question of block.block_data.questions) {
      if (!question.placeholders) continue;
      
      for (const [phKey, placeholder] of Object.entries(question.placeholders)) {
        if (phKey === placeholderKey && placeholder.options) {
          const matchingOption = placeholder.options.find(opt => opt.id === optionValue);
          if (matchingOption?.label) {
            return matchingOption.label;
          }
        }
      }
    }
  }
  
  // If no label found, return the original value
  return optionValue;
}

/**
 * Get styled responses for inline display like admin dashboard
 */
function getQuestionTextWithStyledResponses(
  questionText: string,
  responseValue: any,
  formBlocks: any[] = []
): Array<{type: 'text' | 'response', content: string}> {
  if (!questionText) return [{ type: 'text', content: '' }];

  const parts: Array<{type: 'text' | 'response', content: string}> = [];
  
  let lastIndex = 0;
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(questionText)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: questionText.slice(lastIndex, match.index)
      });
    }

    const placeholderKey = match[1];
    let displayValue = "";
    
    // Try to get the option label instead of just the value
    displayValue = getOptionLabel(responseValue, placeholderKey, formBlocks);
    
    // If no label found, try fallback to direct value
    if (!displayValue) {
      // Try to get the response value for this placeholder
      if (responseValue && typeof responseValue === 'object') {
        const responseForPlaceholder = responseValue[placeholderKey];
        
        if (responseForPlaceholder !== undefined && responseForPlaceholder !== null) {
          displayValue = Array.isArray(responseForPlaceholder) 
            ? responseForPlaceholder.join(", ") 
            : responseForPlaceholder.toString();
        }
      }
      
      // If no response found, try to use the response value directly if it's a simple value
      if (!displayValue && responseValue && typeof responseValue !== 'object') {
        displayValue = responseValue.toString();
      }
      
      // Fallback to placeholder if no response found
      if (!displayValue) {
        displayValue = "____";
      }
    }
    
    parts.push({
      type: 'response',
      content: displayValue
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last placeholder
  if (lastIndex < questionText.length) {
    parts.push({
      type: 'text',
      content: questionText.slice(lastIndex)
    });
  }

  return parts;
}

/**
 * Add question with inline styled responses like admin dashboard
 */
function addQuestionWithInlineResponse(
  pdf: jsPDF,
  questionText: string,
  responseValue: any,
  questionId: string,
  x: number,
  y: number,
  formBlocks: any[] = []
): number {
  // Check if we need a new page
  if (y > PAGE_HEIGHT - MARGIN - 20) {
    pdf.addPage();
    y = MARGIN;
  }

  const parts = getQuestionTextWithStyledResponses(questionText, responseValue, formBlocks);
  
  pdf.setFontSize(FONT_SIZE_NORMAL);
  let currentX = x;
  
  for (const part of parts) {
    if (part.type === 'response') {
      // Style responses as bold and colored
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(36, 92, 79); // #245C4F
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0); // Black
    }
    
    const textWidth = pdf.getTextWidth(part.content);
    
    // Check if text fits on current line
    if (currentX + textWidth > MARGIN + CONTENT_WIDTH) {
      y += LINE_HEIGHT_NORMAL;
      currentX = x;
      
      // Check if we need a new page
      if (y > PAGE_HEIGHT - MARGIN - 10) {
        pdf.addPage();
        y = MARGIN;
      }
    }
    
    pdf.text(part.content, currentX, y);
    currentX += textWidth;
  }
  
  // Reset font and color
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  // Add question ID
  y += LINE_HEIGHT_NORMAL;
  pdf.setFontSize(FONT_SIZE_SMALL);
  pdf.setTextColor(100, 100, 100); // Gray
  y = addWrappedText(pdf, `ID: ${questionId}`, x, y, CONTENT_WIDTH, FONT_SIZE_SMALL, 4);
  pdf.setTextColor(0, 0, 0); // Reset to black
  
  return y + 3; // Extra spacing after each question
}

/**
 * Generate PDF using jsPDF
 */
function generateSubmissionPDF(data: PDFSubmissionData): Uint8Array {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let y = MARGIN;
  
  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZE_TITLE);
  pdf.setTextColor(36, 92, 79); // #245C4F
  
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
  const title = fullName ? `GoMutuo - ${fullName}` : 'GoMutuo - Dettagli Lead';
  
  y = addWrappedText(pdf, title, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_TITLE, LINE_HEIGHT_TITLE);
  
  // Submission ID
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(FONT_SIZE_NORMAL);
  pdf.setTextColor(100, 100, 100); // Gray
  y = addWrappedText(pdf, `ID: ${data.id}`, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
  y += 5;
  
  // Lead Information Section
  pdf.setTextColor(0, 0, 0);
  y = addSectionTitle(pdf, 'Informazioni Lead', MARGIN, y);
  
  const leadInfo = [
    `Nome: ${fullName || 'Non specificato'}`,
    `Email: ${data.email || 'Non specificata'}`,
    `Telefono: ${data.phone_number || 'Non specificato'}`,
    `Status: ${getLeadStatusLabel(data.lead_status)}`,
    `Tipo Form: ${data.form_title}`,
    `Data Invio: ${formatDate(data.created_at)}`,
    `Consulenza: ${data.consulting ? 'Richiesta' : 'Non richiesta'}`,
    `Mediatore: ${data.mediatore || 'Non specificato'}`
  ];
  
  leadInfo.forEach(info => {
    y = addWrappedText(pdf, info, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
  });
  
  y += 10;
  
  // Notes Section - Prioritize AI notes over regular notes
  const notesToDisplay = (data.ai_notes && data.ai_notes.trim()) ? data.ai_notes : data.notes;
  if (notesToDisplay && notesToDisplay.trim()) {
    const noteTitle = (data.ai_notes && data.ai_notes.trim()) ? 'Note AI' : 'Note';
    y = addSectionTitle(pdf, noteTitle, MARGIN, y);
    // Replace emojis with text alternatives for PDF rendering
    const processedNotes = replaceEmojisWithText(notesToDisplay);
    y = addWrappedText(pdf, processedNotes, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
    y += 10;
  }
  
  // Responses Section
  if (data.responses.length > 0) {
    // Start new page for responses if needed
    if (y > PAGE_HEIGHT - MARGIN - 50) {
      pdf.addPage();
      y = MARGIN;
    }
    
    y = addSectionTitle(pdf, `Risposte (${data.responses.length} totali)`, MARGIN, y);
    y += 5;
    
    // Group responses by block
    const responsesByBlock = data.responses.reduce((acc, response) => {
      if (!acc[response.block_id]) {
        acc[response.block_id] = [];
      }
      acc[response.block_id].push(response);
      return acc;
    }, {} as Record<string, typeof data.responses>);
    
    // Process each block
    Object.entries(responsesByBlock).forEach(([blockId, blockResponses]) => {
      // Check if we need a new page for the block header
      if (y > PAGE_HEIGHT - MARGIN - 30) {
        pdf.addPage();
        y = MARGIN;
      }
      
      // Block header
      const blockTitle = `Blocco: ${blockId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (${blockResponses.length} risposte)`;
      y = addSectionTitle(pdf, blockTitle, MARGIN, y);
      y += 3;
      
      // Process each response in the block
      blockResponses.forEach(response => {
        y = addQuestionWithInlineResponse(
          pdf,
          response.question_text,
          response.response_value,
          response.question_id,
          MARGIN,
          y,
          data.formBlocks || []
        );
        y += 2;
      });
      
      y += 5;
    });
  }
  
  // Return PDF as Uint8Array
  const pdfOutput = pdf.output('arraybuffer');
  return new Uint8Array(pdfOutput);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] === PDF Generation Started ===`)

  try {
    const { submissionId }: PDFGenerationRequest = await req.json()
    
    if (!submissionId) {
      console.error(`[${requestId}] Missing submissionId`)
      return Response.json({
        success: false,
        error: "Missing submissionId"
      }, { status: 400, headers: corsHeaders })
    }

    console.log(`[${requestId}] 🔄 Phase 1: Starting PDF generation for submission:`, submissionId)

    // 1. Fetch submission data with responses
    console.log(`[${requestId}] 📊 Fetching submission data from database...`)
    const submissionStartTime = Date.now()
    
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select(`
        *,
        forms(title)
      `)
      .eq('id', submissionId)
      .single()

    const submissionEndTime = Date.now()
    console.log(`[${requestId}] 📊 Submission data fetched (${submissionEndTime - submissionStartTime}ms):`, {
      hasSubmission: !!submission,
      hasError: !!submissionError,
      errorDetails: submissionError,
      submissionKeys: submission ? Object.keys(submission) : [],
      formTitle: submission?.forms?.title,
      firstName: submission?.first_name,
      lastName: submission?.last_name,
      phoneNumber: submission?.phone_number ? 'Present' : 'Missing',
      createdAt: submission?.created_at
    })

    if (submissionError || !submission) {
      console.error(`[${requestId}] ❌ Error fetching submission:`, {
        errorType: typeof submissionError,
        errorMessage: submissionError?.message || submissionError,
        errorCode: submissionError?.code,
        fullError: submissionError
      })
      return Response.json({
        success: false,
        error: "Failed to fetch submission data"
      }, { status: 404, headers: corsHeaders })
    }

    // 2. Fetch form responses
    console.log(`[${requestId}] 📝 Fetching form responses...`)
    const responsesStartTime = Date.now()
    
    const { data: responses, error: responsesError } = await supabase
      .from('form_responses')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true })

    const responsesEndTime = Date.now()
    console.log(`[${requestId}] 📝 Form responses fetched (${responsesEndTime - responsesStartTime}ms):`, {
      hasResponses: !!responses,
      hasError: !!responsesError,
      errorDetails: responsesError,
      responseCount: responses?.length || 0,
      sampleQuestionIds: responses?.slice(0, 3).map(r => r.question_id) || []
    })

    if (responsesError) {
      console.error(`[${requestId}] ❌ Error fetching responses:`, {
        errorType: typeof responsesError,
        errorMessage: responsesError?.message || responsesError,
        errorCode: responsesError?.code,
        fullError: responsesError
      })
      return Response.json({
        success: false,
        error: "Failed to fetch form responses"
      }, { status: 500, headers: corsHeaders })
    }

    // 2.5. Fetch form blocks for option labels
    console.log(`[${requestId}] 📚 Fetching form blocks for option labels...`)
    const formBlocksStartTime = Date.now()
    
    let formBlocks = []
    if (submission.form_id) {
      const { data: blocks, error: blocksError } = await supabase
        .from('form_blocks')
        .select('*')
        .eq('form_id', submission.form_id)
        .order('sort_order', { ascending: true })
      
      const formBlocksEndTime = Date.now()
      console.log(`[${requestId}] 📚 Form blocks fetched (${formBlocksEndTime - formBlocksStartTime}ms):`, {
        hasBlocks: !!blocks,
        hasError: !!blocksError,
        errorDetails: blocksError,
        blockCount: blocks?.length || 0,
        formId: submission.form_id
      })
      
      if (!blocksError && blocks) {
        formBlocks = blocks
      }
    }

    // 3. Prepare PDF data
    console.log(`[${requestId}] 🔄 Phase 2: Preparing PDF data structure...`)
    const pdfData: PDFSubmissionData = {
      ...submission,
      form_title: submission.forms?.title || 'Form',
      responses: responses || [],
      formBlocks: formBlocks
    }

    console.log(`[${requestId}] 📋 PDF data structure prepared:`, {
      hasData: !!pdfData,
      formTitle: pdfData.form_title,
      responseCount: pdfData.responses.length,
      hasFirstName: !!pdfData.first_name,
      hasLastName: !!pdfData.last_name,
      hasPhoneNumber: !!pdfData.phone_number,
      leadStatus: pdfData.lead_status,
      consultingRequested: pdfData.consulting,
      hasNotes: !!pdfData.notes,
      sampleResponses: pdfData.responses.slice(0, 2).map(r => ({
        questionId: r.question_id,
        blockId: r.block_id,
        hasResponse: !!r.response_value
      }))
    })

    // 4. Generate PDF content using jsPDF
    console.log(`[${requestId}] 📝 Phase 3: Generating PDF content...`)
    const contentStartTime = Date.now()
    
    const pdfBuffer = generateSubmissionPDF(pdfData)

    const contentEndTime = Date.now()
    console.log(`[${requestId}] 📝 PDF content generated (${contentEndTime - contentStartTime}ms):`, {
      contentLength: pdfBuffer.length,
      contentType: 'application/pdf',
      hasResponses: pdfData.responses.length > 0,
      hasNotes: !!pdfData.notes,
      bufferSize: `${(pdfBuffer.length / 1024).toFixed(1)} KB`
    })

    // 5. Generate filename and path
    console.log(`[${requestId}] 📁 Phase 4: Generating filename and storage path...`)
    const firstName = pdfData.first_name || 'nome'
    const lastName = pdfData.last_name || 'cognome'
    const phoneNumber = pdfData.phone_number?.replace(/[^\d]/g, '') || 'telefono'
    const timestamp = Date.now()
    const filename = `${firstName}_${lastName}_${phoneNumber}_${timestamp}.pdf`
    const datePath = new Date().toISOString().split('T')[0]
    const filePath = `${datePath}/${filename}`

    console.log(`[${requestId}] 📁 File details prepared:`, {
      firstName,
      lastName,
      phoneNumber: phoneNumber !== 'telefono' ? `${phoneNumber.substring(0, 3)}...` : 'telefono',
      filename,
      datePath,
      filePath,
      filenameLength: filename.length
    })

    // 6. Upload to storage
    console.log(`[${requestId}] 💾 Phase 5: Uploading to storage...`)
    const uploadStartTime = Date.now()
    
    console.log(`[${requestId}] 💾 Storage upload details:`, {
      bucket: 'temp-pdfs',
      filePath,
      contentType: 'application/pdf',
      contentSize: pdfBuffer.length,
      upsert: true
    })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('temp-pdfs')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    const uploadEndTime = Date.now()
    console.log(`[${requestId}] 💾 Storage upload result (${uploadEndTime - uploadStartTime}ms):`, {
      hasUploadData: !!uploadData,
      hasUploadError: !!uploadError,
      uploadError: uploadError,
      uploadPath: uploadData?.path,
      uploadId: uploadData?.id,
      uploadFullPath: uploadData?.fullPath
    })

    if (uploadError) {
      console.error(`[${requestId}] ❌ Storage upload failed:`, {
        errorType: typeof uploadError,
        errorMessage: uploadError?.message || uploadError,
        errorCode: uploadError?.code,
        fullError: uploadError
      })
      return Response.json({
        success: false,
        error: "Failed to upload PDF"
      }, { status: 500, headers: corsHeaders })
    }

    // 7. Get public URL
    console.log(`[${requestId}] 🔗 Phase 6: Generating public URL...`)
    const { data: urlData } = supabase.storage
      .from('temp-pdfs')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    console.log(`[${requestId}] 🔗 Public URL generated:`, {
      hasUrlData: !!urlData,
      hasPublicUrl: !!publicUrl,
      urlLength: publicUrl?.length,
      urlPrefix: publicUrl ? `${publicUrl.substring(0, 50)}...` : 'MISSING',
      isValidUrl: publicUrl?.startsWith('http')
    })

    console.log(`[${requestId}] ✅ PDF generation COMPLETED successfully:`, {
      filename,
      filePath,
      publicUrl: `${publicUrl.substring(0, 50)}...`,
      totalProcessingTime: Date.now() - contentStartTime,
      success: true
    })

    // Schedule PDF deletion after 2 minutes using background task
    const deletePdfAfterDelay = async () => {
      console.log(`[${requestId}] 🗑️ Scheduling PDF deletion in 2 minutes for: ${filename}`);
      await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000)); // 2 minutes
      
      try {
        const { error: deleteError } = await supabase.storage
          .from('temp-pdfs')
          .remove([filePath]);
          
        if (deleteError) {
          console.error(`[${requestId}] ❌ Error deleting PDF:`, deleteError);
        } else {
          console.log(`[${requestId}] ✅ PDF deleted successfully after 2 minutes: ${filename}`);
        }
      } catch (error) {
        console.error(`[${requestId}] ❌ Error in PDF deletion task:`, error);
      }
    };
    
    // Start background deletion task
    EdgeRuntime.waitUntil(deletePdfAfterDelay());

    return Response.json({
      success: true,
      pdfUrl: publicUrl,
      filename: filename
    }, { headers: corsHeaders })

  } catch (error) {
    console.error(`[${requestId}] ❌ Error in PDF generation:`, {
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorType: typeof error,
      submissionId: submissionId || 'UNKNOWN',
      currentPhase: 'Unknown - check logs above',
      fullError: error
    })
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500, headers: corsHeaders })
  }
})