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
 * Gets the color for lead status
 */
const getLeadStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'not_contacted': '#6b7280', // gray
    'first_contact': '#3b82f6', // blue
    'advanced_conversations': '#f59e0b', // yellow
    'converted': '#10b981', // green
    'rejected': '#ef4444' // red
  };
  return colorMap[status] || '#6b7280';
};

/**
 * Renders question text with styled placeholders for PDF display
 * @param questionText The original question text
 * @param responseValue The response value containing placeholder data
 * @returns HTML string with styled placeholders
 */
const renderQuestionTextForPDF = (questionText: string, responseValue: any): string => {
  if (!questionText) return '';

  const { parts } = getQuestionTextWithStyledResponses(questionText, '', responseValue);
  
  return parts.map(part => {
    if (part.type === 'response') {
      // Style response parts with bold, underline, and brand color
      return `<span style="font-weight: bold; text-decoration: underline; color: #245C4F;">${escapeHtml(part.content)}</span>`;
    } else {
      // Regular text parts
      return escapeHtml(part.content);
    }
  }).join('');
};

/**
 * Escapes HTML special characters to prevent XSS and rendering issues
 * @param text The text to escape
 * @returns Escaped HTML string
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Creates a page container with proper A4 dimensions and styling
 */
const createPageContainer = (pageNumber: number): HTMLDivElement => {
  const page = document.createElement('div');
  page.className = `pdf-page-${pageNumber}`;
  page.style.cssText = `
    width: 210mm;
    min-height: 297mm;
    max-height: 297mm;
    background: white;
    padding: 20mm;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    color: #000;
    page-break-after: always;
    overflow: hidden;
  `;
  return page;
};

/**
 * Creates the header section for each page
 */
const createPageHeader = (data: PDFSubmissionData, pageNumber: number, totalPages: number): string => {
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

  return `
    <div style="margin-bottom: 20px; border-bottom: 2px solid #245C4F; padding-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="color: #245C4F; font-size: 20px; margin: 0 0 5px 0;">${displayTitle}</h1>
          <p style="color: #666; font-size: 12px; margin: 0;">ID: ${data.id}</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #666;">
          <div>Pagina ${pageNumber} di ${totalPages}</div>
          <div>${formatDate(data.created_at)}</div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Estimates the height of a question block in pixels
 */
const estimateQuestionHeight = (response: any): number => {
  const baseHeight = 60; // Base height for question container
  const textHeight = Math.ceil(response.question_text.length / 80) * 20; // Estimate text lines
  const idHeight = 20; // Height for question ID
  return baseHeight + textHeight + idHeight;
};

export const generateSubmissionPDF = async (data: PDFSubmissionData): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const pageMargin = 20;
    const contentHeight = pageHeight - (pageMargin * 2);
    const maxContentHeightPx = contentHeight * 3.78; // Convert mm to px (approximately)

    // Format helper functions
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Group responses by block
    const responsesByBlock = data.responses.reduce((acc, response) => {
      if (!acc[response.block_id]) {
        acc[response.block_id] = [];
      }
      acc[response.block_id].push(response);
      return acc;
    }, {} as Record<string, typeof data.responses>);

    const pages: string[] = [];
    let currentPageContent = '';
    let currentPageHeight = 0;
    
    // First page - General Information with Lead Details
    const leadStatusLabel = getLeadStatusLabel(data.lead_status);
    const leadStatusColor = getLeadStatusColor(data.lead_status);
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');

    const generalInfoContent = `
      <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #BEB8AE; border-radius: 8px; break-inside: avoid;">
        <h2 style="color: #245C4F; font-size: 16px; margin-bottom: 15px;">Informazioni Generali</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div><strong>Tipo Form:</strong> ${data.form_type}</div>
          <div><strong>Data Invio:</strong> ${formatDate(data.created_at)}</div>
          ${data.phone_number ? `<div><strong>Telefono:</strong> ${data.phone_number}</div>` : ''}
          ${data.user_identifier ? `<div><strong>ID Utente:</strong> ${data.user_identifier}</div>` : ''}
          <div><strong>Consulenza:</strong> ${data.consulting ? 'Richiesta' : 'Non richiesta'}</div>
        </div>
        
        ${data.metadata ? `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h4 style="margin-bottom: 10px;">Metadata</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 12px;">
            <div><strong>Blocchi attivi:</strong> ${data.metadata.blocks?.length || 0}</div>
            <div><strong>Blocchi completati:</strong> ${data.metadata.completedBlocks?.length || 0}</div>
            <div><strong>Blocchi dinamici:</strong> ${data.metadata.dynamicBlocks || 0}</div>
            ${data.metadata.slug ? `<div style="grid-column: 1/-1;"><strong>Slug:</strong> ${data.metadata.slug}</div>` : ''}
          </div>
        </div>
        ` : ''}

        <div style="background: #f8f5f1; padding: 15px; border-radius: 6px; border-left: 4px solid #245C4F;">
          <h4 style="color: #245C4F; margin-bottom: 15px;">Informazioni Lead</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            ${fullName ? `<div><strong>Nome Completo:</strong> ${fullName}</div>` : '<div><strong>Nome:</strong> Non specificato</div>'}
            ${data.email ? `<div><strong>Email:</strong> ${data.email}</div>` : '<div><strong>Email:</strong> Non specificata</div>'}
          </div>
          <div style="margin-bottom: 15px;">
            <div style="margin-bottom: 8px;"><strong>Status Lead:</strong></div>
            <span style="display: inline-block; background: ${leadStatusColor}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
              ${leadStatusLabel}
            </span>
          </div>
          ${data.notes ? `
          <div>
            <div style="margin-bottom: 8px;"><strong>Note:</strong></div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #BEB8AE; line-height: 1.4; font-size: 14px;">
              ${escapeHtml(data.notes)}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    currentPageContent = generalInfoContent;
    currentPageHeight = 400; // Estimated height for general info with lead details

    // Add responses section header
    const responsesHeaderContent = `
      <div style="margin-bottom: 20px;">
        <h2 style="color: #245C4F; font-size: 16px;">Risposte (${data.responses.length} totali)</h2>
      </div>
    `;

    if (currentPageHeight + 100 > maxContentHeightPx) {
      // Start new page for responses
      pages.push(currentPageContent);
      currentPageContent = responsesHeaderContent;
      currentPageHeight = 100;
    } else {
      currentPageContent += responsesHeaderContent;
      currentPageHeight += 100;
    }

    // Process each block
    if (Object.keys(responsesByBlock).length === 0) {
      const emptyContent = `
        <div style="text-align: center; padding: 40px; color: #666; break-inside: avoid;">
          <p>Nessuna risposta trovata per questa submission.</p>
        </div>
      `;
      currentPageContent += emptyContent;
    } else {
      for (const [blockId, blockResponses] of Object.entries(responsesByBlock)) {
        const blockHeaderHeight = 80;
        
        // Check if we need a new page for the block header
        if (currentPageHeight + blockHeaderHeight > maxContentHeightPx) {
          pages.push(currentPageContent);
          currentPageContent = '';
          currentPageHeight = 0;
        }

        // Add block header
        const blockHeader = `
          <div style="margin-bottom: 15px; margin-top: 25px; break-inside: avoid;">
            <h3 style="color: #245C4F; font-size: 14px; margin-bottom: 10px; padding: 10px; background: #f8f5f1; border-radius: 6px;">
              Blocco: ${blockId} (${blockResponses.length} risposte)
            </h3>
          </div>
        `;

        currentPageContent += blockHeader;
        currentPageHeight += blockHeaderHeight;

        // Process each question in the block
        for (const response of blockResponses) {
          const questionHeight = estimateQuestionHeight(response);
          
          // Check if question fits on current page
          if (currentPageHeight + questionHeight > maxContentHeightPx) {
            // Start new page
            pages.push(currentPageContent);
            currentPageContent = '';
            currentPageHeight = 0;
          }

          const questionContent = `
            <div style="margin-bottom: 15px; padding: 12px; border-left: 4px solid #245C4F; background: #fafafa; break-inside: avoid;">
              <div style="margin-bottom: 8px; line-height: 1.4;">
                ${renderQuestionTextForPDF(response.question_text, response.response_value)}
              </div>
              <div style="color: #666; font-size: 11px;">
                ID: ${response.question_id}
              </div>
            </div>
          `;

          currentPageContent += questionContent;
          currentPageHeight += questionHeight;
        }
      }
    }

    // Add the last page if it has content
    if (currentPageContent.trim()) {
      pages.push(currentPageContent);
    }

    // Generate PDF pages
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      // Create page container
      const pageContainer = createPageContainer(i + 1);
      const pageHeader = createPageHeader(data, i + 1, pages.length);
      
      pageContainer.innerHTML = `
        ${pageHeader}
        <div style="break-inside: avoid;">
          ${pages[i]}
        </div>
        <div style="position: absolute; bottom: 15px; left: 20px; right: 20px; text-align: center; color: #666; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px;">
          PDF generato il ${formatDate(new Date().toISOString())} - GoMutuo
        </div>
      `;

      // Add to document temporarily
      document.body.appendChild(pageContainer);

      // Generate canvas for this page
      const canvas = await html2canvas(pageContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pageContainer.offsetWidth,
        height: pageContainer.offsetHeight
      });

      // Remove from document
      document.body.removeChild(pageContainer);

      // Add to PDF
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
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
