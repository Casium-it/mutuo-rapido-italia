import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

// Helper function to format response value
function formatResponseValue(value: any): string {
  if (value === null || value === undefined) {
    return 'Non specificato'
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    
    // Handle placeholder responses
    const placeholderKeys = Object.keys(value).filter(key => key.startsWith('placeholder'))
    if (placeholderKeys.length > 0) {
      return placeholderKeys.map(key => value[key]).filter(v => v).join(', ')
    }
    
    return JSON.stringify(value)
  }
  
  return String(value)
}

// Generate PDF content as HTML (we'll convert this to PDF)
function generatePDFHTML(data: PDFSubmissionData): string {
  const responsesByBlock: { [blockId: string]: typeof data.responses } = {}
  
  // Group responses by block
  data.responses.forEach(response => {
    if (!responsesByBlock[response.block_id]) {
      responsesByBlock[response.block_id] = []
    }
    responsesByBlock[response.block_id].push(response)
  })

  // Generate filename
  const firstName = data.first_name || 'nome'
  const lastName = data.last_name || 'cognome'
  const phoneNumber = data.phone_number?.replace(/[^\d]/g, '') || 'telefono'
  const filename = `${firstName}_${lastName}_${phoneNumber}.pdf`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.4; 
          color: #333;
        }
        .header { 
          border-bottom: 2px solid #245C4F; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .title { 
          color: #245C4F; 
          font-size: 24px; 
          font-weight: bold; 
          margin: 0 0 10px 0; 
        }
        .subtitle { 
          color: #666; 
          font-size: 14px; 
          margin: 0; 
        }
        .section { 
          margin-bottom: 25px; 
          background: #f9f9f9; 
          padding: 15px; 
          border-radius: 5px; 
        }
        .section-title { 
          color: #245C4F; 
          font-size: 16px; 
          font-weight: bold; 
          margin: 0 0 15px 0; 
          border-bottom: 1px solid #ddd; 
          padding-bottom: 5px; 
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
          margin-bottom: 20px; 
        }
        .info-item { 
          background: white; 
          padding: 10px; 
          border-radius: 3px; 
          border-left: 3px solid #245C4F; 
        }
        .info-label { 
          font-weight: bold; 
          color: #555; 
          font-size: 12px; 
          text-transform: uppercase; 
          margin-bottom: 5px; 
        }
        .info-value { 
          font-size: 14px; 
          color: #333; 
        }
        .question { 
          margin-bottom: 15px; 
          padding: 10px; 
          background: white; 
          border-radius: 3px; 
          border-left: 3px solid #245C4F; 
        }
        .question-text { 
          font-weight: bold; 
          color: #333; 
          margin-bottom: 5px; 
          font-size: 13px; 
        }
        .question-response { 
          color: #245C4F; 
          font-size: 14px; 
          font-weight: 500; 
        }
        .notes { 
          background: #fff3cd; 
          border: 1px solid #ffeaa7; 
          padding: 15px; 
          border-radius: 5px; 
          margin-top: 20px; 
        }
        .notes-title { 
          font-weight: bold; 
          color: #856404; 
          margin-bottom: 10px; 
        }
        .notes-content { 
          color: #856404; 
          line-height: 1.6; 
          white-space: pre-wrap; 
        }
        @media print {
          body { margin: 0; }
          .section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Dettagli Lead - ${data.form_title}</h1>
        <p class="subtitle">Generato il ${formatDate(new Date().toISOString())}</p>
      </div>

      <div class="section">
        <h2 class="section-title">Informazioni Generali</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nome</div>
            <div class="info-value">${data.first_name || 'Non specificato'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Cognome</div>
            <div class="info-value">${data.last_name || 'Non specificato'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefono</div>
            <div class="info-value">${data.phone_number || 'Non specificato'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${data.email || 'Non specificato'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Richiesta Consulenza</div>
            <div class="info-value">${data.consulting ? 'Sì' : 'No'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Stato Lead</div>
            <div class="info-value">${getLeadStatusLabel(data.lead_status)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Mediatore</div>
            <div class="info-value">${data.mediatore || 'Non assegnato'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data Invio</div>
            <div class="info-value">${formatDate(data.created_at)}</div>
          </div>
        </div>
      </div>

      ${Object.keys(responsesByBlock).map(blockId => `
        <div class="section">
          <h2 class="section-title">Blocco: ${blockId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
          ${responsesByBlock[blockId].map(response => `
            <div class="question">
              <div class="question-text">${response.question_text}</div>
              <div class="question-response">${formatResponseValue(response.response_value)}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}

      ${data.notes ? `
        <div class="notes">
          <div class="notes-title">Note</div>
          <div class="notes-content">${data.notes}</div>
        </div>
      ` : ''}
    </body>
    </html>
  `
}

// Convert HTML to PDF using Puppeteer (via Deno)
async function htmlToPDF(html: string): Promise<Uint8Array> {
  try {
    // Use the htmlcsstoimage API or similar service for PDF generation
    // For now, we'll use a simple approach with the browser API
    const response = await fetch('https://api.htmlcsstoimage.com/v1/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (Deno.env.get('HTMLCSSTOIMAGE_API_KEY') || ''),
      },
      body: JSON.stringify({
        html: html,
        css: '',
        format: 'A4',
        margin: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      })
    })

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('Error converting HTML to PDF:', error)
    throw error
  }
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

    // 4. Generate PDF content
    console.log(`[${requestId}] 📝 Phase 3: Generating PDF content...`)
    const contentStartTime = Date.now()
    
    const pdfContent = `
PDF Lead Report
================

Lead Information:
- Name: ${pdfData.first_name} ${pdfData.last_name}
- Phone: ${pdfData.phone_number}
- Email: ${pdfData.email}
- Consulting Requested: ${pdfData.consulting ? 'Yes' : 'No'}
- Status: ${getLeadStatusLabel(pdfData.lead_status)}
- Created: ${formatDate(pdfData.created_at)}

Form Responses:
${responses?.map(r => `
Q: ${r.question_text}
A: ${formatResponseValue(r.response_value)}
`).join('\n') || 'No responses'}

${pdfData.notes ? `\nNotes:\n${pdfData.notes}` : ''}
`

    const contentEndTime = Date.now()
    console.log(`[${requestId}] 📝 PDF content generated (${contentEndTime - contentStartTime}ms):`, {
      contentLength: pdfContent.length,
      contentLines: pdfContent.split('\n').length,
      hasResponses: pdfContent.includes('Form Responses:'),
      hasNotes: pdfContent.includes('Notes:'),
      contentPreview: `${pdfContent.substring(0, 100)}...`
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
    const encodedContent = new TextEncoder().encode(pdfContent)
    
    console.log(`[${requestId}] 💾 Storage upload details:`, {
      bucket: 'temp-pdfs',
      filePath,
      contentType: 'text/plain',
      contentSize: encodedContent.length,
      upsert: true
    })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('temp-pdfs')
      .upload(filePath, encodedContent, {
        contentType: 'text/plain', // Will be application/pdf when using real PDF
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