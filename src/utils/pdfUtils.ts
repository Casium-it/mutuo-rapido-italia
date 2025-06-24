
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getQuestionTextWithStyledResponses } from './formUtils';

export interface PDFSubmissionData {
  id: string;
  created_at: string;
  form_type: string;
  phone_number: string | null;
  consulting: boolean | null;
  user_identifier: string | null;
  metadata: any;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  notes: string | null;
  lead_status: 'not_contacted' | 'first_contact' | 'advanced_conversations' | 'converted' | 'rejected';
  responses: Array<{
    id: string;
    question_id: string;
    question_text: string;
    block_id: string;
    response_value: any;
    created_at: string;
  }>;
}

/**
 * Maps lead status values to Italian labels
 */
const getLeadStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'not_contacted': 'Non Contattato',
    'first_contact': 'Primo Contatto',
    'advanced_conversations': 'Conversazioni Avanzate',
    'converted': 'Convertito',
    'rejected': 'Rifiutato'
  };
  return statusMap[status] || status;
};

/**
 * Renders question text with styled placeholders for PDF display
 */
const renderQuestionTextForPDF = (questionText: string, responseValue: any): string => {
  if (!questionText) return '';

  const { parts } = getQuestionTextWithStyledResponses(questionText, '', responseValue);
  
  return parts.map(part => {
    if (part.type === 'response') {
      return `<strong style="color: #245C4F;">${escapeHtml(part.content)}</strong>`;
    } else {
      return escapeHtml(part.content);
    }
  }).join('');
};

/**
 * Escapes HTML special characters
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Format response value for display
 */
const formatResponseValue = (value: any): string => {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

export const generateSubmissionPDF = async (data: PDFSubmissionData): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const pageMargin = 20;
    const maxContentWidth = pageWidth - (pageMargin * 2);

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
    const displayTitle = fullName ? `GoMutuo - ${fullName}` : 'GoMutuo - Dettagli Submission';
    const leadStatusLabel = getLeadStatusLabel(data.lead_status);

    // Create complete HTML content
    const htmlContent = `
      <div style="
        width: ${maxContentWidth}mm; 
        font-family: Arial, sans-serif; 
        color: #000; 
        background: white;
        padding: 20px;
        box-sizing: border-box;
        line-height: 1.4;
      ">
        <!-- Header -->
        <div style="margin-bottom: 30px; text-align: center;">
          <h1 style="color: #245C4F; font-size: 24px; margin: 0 0 10px 0;">${displayTitle}</h1>
          <p style="color: #666; font-size: 14px; margin: 0;">ID: ${data.id}</p>
          <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">${formatDate(data.created_at)}</p>
        </div>

        <!-- General Information -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #245C4F; font-size: 18px; margin-bottom: 15px;">Informazioni Generali</h2>
          <div style="margin-bottom: 15px;">
            <div style="margin-bottom: 10px;"><strong>Tipo Form:</strong> ${data.form_type}</div>
            <div style="margin-bottom: 10px;"><strong>Data Invio:</strong> ${formatDate(data.created_at)}</div>
            ${data.phone_number ? `<div style="margin-bottom: 10px;"><strong>Telefono:</strong> ${data.phone_number}</div>` : ''}
            ${data.user_identifier ? `<div style="margin-bottom: 10px;"><strong>ID Utente:</strong> ${data.user_identifier}</div>` : ''}
            <div style="margin-bottom: 10px;"><strong>Consulenza:</strong> ${data.consulting ? 'Richiesta' : 'Non richiesta'}</div>
          </div>
        </div>

        <!-- Lead Information -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #245C4F; font-size: 18px; margin-bottom: 15px;">Informazioni Lead</h2>
          <div style="margin-bottom: 15px;">
            ${fullName ? `<div style="margin-bottom: 10px;"><strong>Nome Completo:</strong> ${fullName}</div>` : '<div style="margin-bottom: 10px;"><strong>Nome:</strong> Non specificato</div>'}
            ${data.email ? `<div style="margin-bottom: 10px;"><strong>Email:</strong> ${data.email}</div>` : '<div style="margin-bottom: 10px;"><strong>Email:</strong> Non specificata</div>'}
            <div style="margin-bottom: 10px;"><strong>Status Lead:</strong> ${leadStatusLabel}</div>
          </div>
          
          ${data.notes ? `
          <div style="margin-bottom: 15px;">
            <div style="margin-bottom: 8px;"><strong>Note:</strong></div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; line-height: 1.6; font-size: 14px;">
              ${escapeHtml(data.notes)}
            </div>
          </div>
          ` : ''}
        </div>

        ${data.metadata ? `
        <!-- Metadata -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #245C4F; font-size: 18px; margin-bottom: 15px;">Metadata</h2>
          <div style="margin-bottom: 15px;">
            <div style="margin-bottom: 8px;"><strong>Blocchi attivi:</strong> ${data.metadata.blocks?.length || 0}</div>
            <div style="margin-bottom: 8px;"><strong>Blocchi completati:</strong> ${data.metadata.completedBlocks?.length || 0}</div>
            <div style="margin-bottom: 8px;"><strong>Blocchi dinamici:</strong> ${data.metadata.dynamicBlocks || 0}</div>
            ${data.metadata.slug ? `<div style="margin-bottom: 8px;"><strong>Slug:</strong> ${data.metadata.slug}</div>` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Responses -->
        <div style="margin-bottom: 20px;">
          <h2 style="color: #245C4F; font-size: 18px; margin-bottom: 15px;">Risposte (${data.responses.length} totali)</h2>
          
          ${data.responses.length === 0 ? `
          <div style="text-align: center; padding: 40px; color: #666;">
            <p>Nessuna risposta trovata per questa submission.</p>
          </div>
          ` : ''}
          
          ${Object.entries(data.responses.reduce((acc, response) => {
            if (!acc[response.block_id]) {
              acc[response.block_id] = [];
            }
            acc[response.block_id].push(response);
            return acc;
          }, {} as Record<string, typeof data.responses>)).map(([blockId, blockResponses]) => `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #245C4F; font-size: 16px; margin-bottom: 15px; background: #f8f5f1; padding: 10px; border-radius: 6px;">
                Blocco: ${blockId} (${blockResponses.length} risposte)
              </h3>
              
              ${blockResponses.map(response => `
                <div style="margin-bottom: 15px; padding: 15px; background: #fafafa; border-radius: 6px;">
                  <div style="margin-bottom: 8px; line-height: 1.6;">
                    ${renderQuestionTextForPDF(response.question_text, response.response_value)}
                  </div>
                  <div style="color: #666; font-size: 11px; margin-top: 8px;">
                    ID: ${response.question_id}
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666; font-size: 10px; margin-top: 40px; padding-top: 20px;">
          PDF generato il ${formatDate(new Date().toISOString())} - GoMutuo
        </div>
      </div>
    `;

    // Create temporary container for rendering
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: ${maxContentWidth}mm;
      background: white;
      visibility: hidden;
    `;
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: container.offsetWidth,
      height: container.offsetHeight,
      logging: false
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Calculate PDF dimensions
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add content to PDF, splitting across pages if needed
    let remainingHeight = imgHeight;
    let sourceY = 0;
    let pageCount = 0;

    while (remainingHeight > 0) {
      if (pageCount > 0) {
        pdf.addPage();
      }

      const pageContentHeight = Math.min(remainingHeight, pageHeight);
      const sourceHeight = (pageContentHeight * canvas.width) / imgWidth;

      // Create canvas for this page
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      if (pageCtx) {
        pageCtx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );

        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG',
          0, 0,
          imgWidth, pageContentHeight
        );
      }

      remainingHeight -= pageContentHeight;
      sourceY += sourceHeight;
      pageCount++;
    }

    // Generate filename and save
    const date = new Date().toISOString().split('T')[0];
    const nameForFilename = fullName ? `_${fullName.replace(/\s+/g, '_')}` : '';
    const filename = `submission_${data.id.substring(0, 8)}${nameForFilename}_${date}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Errore nella generazione del PDF');
  }
};
