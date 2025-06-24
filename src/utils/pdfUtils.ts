
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
 */
const renderQuestionTextForPDF = (questionText: string, responseValue: any): string => {
  if (!questionText) return '';

  const { parts } = getQuestionTextWithStyledResponses(questionText, '', responseValue);
  
  return parts.map(part => {
    if (part.type === 'response') {
      return `<span style="font-weight: bold; text-decoration: underline; color: #245C4F;">${escapeHtml(part.content)}</span>`;
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
 * Creates a temporary container to measure content height
 */
const createMeasurementContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    width: 210mm;
    background: white;
    padding: 20mm;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    color: #000;
    visibility: hidden;
  `;
  document.body.appendChild(container);
  return container;
};

/**
 * Measures the actual height of content in pixels
 */
const measureContentHeight = async (htmlContent: string): Promise<number> => {
  const container = createMeasurementContainer();
  container.innerHTML = htmlContent;
  
  // Let the browser render the content
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const height = container.offsetHeight;
  document.body.removeChild(container);
  return height;
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
 * Creates a single question/response item
 */
const createQuestionItem = (response: PDFSubmissionData['responses'][0]): string => {
  return `
    <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #245C4F; background: #fafafa; border-radius: 0 6px 6px 0; page-break-inside: avoid;">
      <div style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
        ${renderQuestionTextForPDF(response.question_text, response.response_value)}
      </div>
      <div style="color: #666; font-size: 11px; margin-top: 8px;">
        ID: ${response.question_id} | Blocco: ${response.block_id}
      </div>
    </div>
  `;
};

/**
 * Creates a block header
 */
const createBlockHeader = (blockId: string, responseCount: number): string => {
  return `
    <div style="margin: 25px 0 15px 0; page-break-inside: avoid;">
      <h3 style="color: #245C4F; font-size: 16px; margin: 0; padding: 12px 15px; background: #f8f5f1; border-radius: 8px; border-left: 4px solid #245C4F;">
        Blocco: ${blockId} (${responseCount} risposte)
      </h3>
    </div>
  `;
};

export const generateSubmissionPDF = async (data: PDFSubmissionData): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const pageMargin = 20;
    const headerHeight = 35; // Increased for safety
    const footerHeight = 20; // Increased for safety
    const safetyMargin = 30; // Increased safety margin
    const maxContentHeight = pageHeight - (pageMargin * 2) - headerHeight - footerHeight - safetyMargin;
    const maxContentHeightPx = maxContentHeight * 3.78; // Convert mm to px

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Prepare first page content (General Information and Lead Details)
    const leadStatusLabel = getLeadStatusLabel(data.lead_status);
    const leadStatusColor = getLeadStatusColor(data.lead_status);
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');

    const firstPageContent = `
      <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #BEB8AE; border-radius: 8px;">
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

    // Process responses with improved pagination
    const pages: Array<{ content: string; isFirstPage: boolean }> = [];
    
    // Add first page
    pages.push({ content: firstPageContent, isFirstPage: true });

    // Group responses by block
    const responsesByBlock = data.responses.reduce((acc, response) => {
      if (!acc[response.block_id]) {
        acc[response.block_id] = [];
      }
      acc[response.block_id].push(response);
      return acc;
    }, {} as Record<string, typeof data.responses>);

    if (Object.keys(responsesByBlock).length === 0) {
      // Add empty responses page
      const emptyContent = `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #245C4F; font-size: 16px;">Risposte</h2>
        </div>
        <div style="text-align: center; padding: 40px; color: #666;">
          <p>Nessuna risposta trovata per questa submission.</p>
        </div>
      `;
      pages.push({ content: emptyContent, isFirstPage: false });
    } else {
      // Process responses with atomic question handling
      let currentPageContent = `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #245C4F; font-size: 16px;">Risposte (${data.responses.length} totali)</h2>
        </div>
      `;
      let currentPageHeight = await measureContentHeight(currentPageContent);

      for (const [blockId, blockResponses] of Object.entries(responsesByBlock)) {
        // Create block header
        const blockHeader = createBlockHeader(blockId, blockResponses.length);
        const blockHeaderHeight = await measureContentHeight(blockHeader);

        // Check if block header fits on current page
        if (currentPageHeight + blockHeaderHeight > maxContentHeightPx && currentPageContent.trim()) {
          // Start new page with block header
          pages.push({ content: currentPageContent, isFirstPage: false });
          currentPageContent = blockHeader;
          currentPageHeight = blockHeaderHeight;
        } else {
          // Add block header to current page
          currentPageContent += blockHeader;
          currentPageHeight += blockHeaderHeight;
        }

        // Process each question individually
        for (const response of blockResponses) {
          const questionItem = createQuestionItem(response);
          const questionHeight = await measureContentHeight(questionItem);
          const bufferSpace = 10; // Add 10px buffer between questions

          // Check if question fits on current page with buffer
          if (currentPageHeight + questionHeight + bufferSpace > maxContentHeightPx) {
            // Question doesn't fit, start new page
            if (currentPageContent.trim()) {
              pages.push({ content: currentPageContent, isFirstPage: false });
            }
            currentPageContent = questionItem;
            currentPageHeight = questionHeight;
          } else {
            // Question fits, add to current page
            currentPageContent += questionItem;
            currentPageHeight += questionHeight + bufferSpace;
          }
        }
      }

      // Add the last page if it has content
      if (currentPageContent.trim()) {
        pages.push({ content: currentPageContent, isFirstPage: false });
      }
    }

    // Generate PDF pages
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      // Create page container with proper dimensions
      const pageContainer = document.createElement('div');
      pageContainer.style.cssText = `
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

      const pageHeader = createPageHeader(data, i + 1, pages.length);
      
      pageContainer.innerHTML = `
        ${pageHeader}
        <div style="max-height: ${maxContentHeight}mm; overflow: hidden;">
          ${pages[i].content}
        </div>
        <div style="position: absolute; bottom: 15px; left: 20px; right: 20px; text-align: center; color: #666; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px;">
          PDF generato il ${formatDate(new Date().toISOString())} - GoMutuo
        </div>
      `;

      document.body.appendChild(pageContainer);

      const canvas = await html2canvas(pageContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pageContainer.offsetWidth,
        height: pageContainer.offsetHeight,
        logging: false
      });

      document.body.removeChild(pageContainer);

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const finalHeight = Math.min(imgHeight, pageHeight);
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, finalHeight);
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
