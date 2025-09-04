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
  lead_status: string
  mediatore: string | null
  responses: Array<{
    id: string
    question_id: string
    question_text: string
    block_id: string
    response_value: any
    created_at: string
  }>
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
  const lines = pdf.splitTextToSize(text, maxWidth);
  
  for (let i = 0; i < lines.length; i++) {
    if (y > PAGE_HEIGHT - MARGIN - 10) {
      pdf.addPage();
      y = MARGIN;
    }
    pdf.text(lines[i], x, y);
    y += lineHeight;
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
 * Format response value for display
 */
function formatResponseValue(value: any): string {
  if (value === null || value === undefined) {
    return 'Non specificato';
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    // Handle placeholder responses
    const placeholderKeys = Object.keys(value).filter(key => key.startsWith('placeholder'));
    if (placeholderKeys.length > 0) {
      return placeholderKeys.map(key => value[key]).filter(v => v).join(', ');
    }
    
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Add question with response
 */
function addQuestionWithResponse(
  pdf: jsPDF,
  questionText: string,
  responseValue: any,
  questionId: string,
  x: number,
  y: number
): number {
  // Check if we need a new page
  if (y > PAGE_HEIGHT - MARGIN - 20) {
    pdf.addPage();
    y = MARGIN;
  }
  
  // Question text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(FONT_SIZE_NORMAL);
  pdf.setTextColor(0, 0, 0);
  y = addWrappedText(pdf, `D: ${questionText}`, x, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
  
  // Response value
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(36, 92, 79); // #245C4F
  const responseText = formatResponseValue(responseValue);
  y = addWrappedText(pdf, `R: ${responseText}`, x, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
  
  // Question ID
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(FONT_SIZE_SMALL);
  pdf.setTextColor(100, 100, 100); // Gray
  y = addWrappedText(pdf, `ID: ${questionId}`, x, y, CONTENT_WIDTH, FONT_SIZE_SMALL, 4);
  
  // Reset colors
  pdf.setTextColor(0, 0, 0);
  
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
  
  // Notes Section
  if (data.notes && data.notes.trim()) {
    y = addSectionTitle(pdf, 'Note', MARGIN, y);
    y = addWrappedText(pdf, data.notes, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
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
        y = addQuestionWithResponse(
          pdf,
          response.question_text,
          response.response_value,
          response.question_id,
          MARGIN,
          y
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

    // 3. Prepare PDF data
    console.log(`[${requestId}] 🔄 Phase 2: Preparing PDF data structure...`)
    const pdfData: PDFSubmissionData = {
      ...submission,
      form_title: submission.forms?.title || 'Form',
      responses: responses || []
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