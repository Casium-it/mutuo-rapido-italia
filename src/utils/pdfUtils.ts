
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

export const generateSubmissionPDF = async (data: PDFSubmissionData): Promise<void> => {
  try {
    // Create a hidden container for PDF content
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-container';
    pdfContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 210mm;
      background: white;
      padding: 20px;
      font-family: Arial, sans-serif;
      color: #000;
    `;

    // Format date
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Format response value
    const formatResponseValue = (value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    };

    // Group responses by block
    const responsesByBlock = data.responses.reduce((acc, response) => {
      if (!acc[response.block_id]) {
        acc[response.block_id] = [];
      }
      acc[response.block_id].push(response);
      return acc;
    }, {} as Record<string, typeof data.responses>);

    // Build PDF content
    pdfContainer.innerHTML = `
      <div style="margin-bottom: 30px;">
        <h1 style="color: #245C4F; font-size: 24px; margin-bottom: 10px;">GoMutuo - Dettagli Submission</h1>
        <p style="color: #666; font-size: 14px;">ID: ${data.id}</p>
      </div>

      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #BEB8AE; border-radius: 8px;">
        <h2 style="color: #245C4F; font-size: 18px; margin-bottom: 15px;">Informazioni Generali</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <strong>Tipo Form:</strong> ${data.form_type}
          </div>
          <div>
            <strong>Data Invio:</strong> ${formatDate(data.created_at)}
          </div>
          ${data.phone_number ? `
          <div>
            <strong>Telefono:</strong> ${data.phone_number}
          </div>
          ` : ''}
          ${data.user_identifier ? `
          <div>
            <strong>ID Utente:</strong> ${data.user_identifier}
          </div>
          ` : ''}
          <div>
            <strong>Consulenza:</strong> ${data.consulting ? 'Richiesta' : 'Non richiesta'}
          </div>
        </div>
        
        ${data.metadata ? `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 6px;">
          <h4 style="margin-bottom: 10px;">Metadata</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 12px;">
            <div><strong>Blocchi attivi:</strong> ${data.metadata.blocks?.length || 0}</div>
            <div><strong>Blocchi completati:</strong> ${data.metadata.completedBlocks?.length || 0}</div>
            <div><strong>Blocchi dinamici:</strong> ${data.metadata.dynamicBlocks || 0}</div>
            ${data.metadata.slug ? `<div style="grid-column: 1/-1;"><strong>Slug:</strong> ${data.metadata.slug}</div>` : ''}
          </div>
        </div>
        ` : ''}
      </div>

      <div>
        <h2 style="color: #245C4F; font-size: 18px; margin-bottom: 20px;">Risposte (${data.responses.length} totali)</h2>
        
        ${Object.keys(responsesByBlock).length === 0 ? `
          <div style="text-align: center; padding: 40px; color: #666;">
            <p>Nessuna risposta trovata per questa submission.</p>
          </div>
        ` : Object.entries(responsesByBlock).map(([blockId, blockResponses]) => `
          <div style="margin-bottom: 25px; border: 1px solid #BEB8AE; border-radius: 8px; padding: 20px;">
            <h3 style="color: #245C4F; font-size: 16px; margin-bottom: 15px;">
              Blocco: ${blockId} (${blockResponses.length} risposte)
            </h3>
            <div>
              ${blockResponses.map(response => `
                <div style="margin-bottom: 15px; padding-left: 15px; border-left: 4px solid #245C4F;">
                  <div style="margin-bottom: 8px;">
                    ${renderQuestionTextForPDF(response.question_text, response.response_value)}
                  </div>
                  <div style="color: #666; font-size: 12px; margin-bottom: 5px;">
                    ID: ${response.question_id}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #BEB8AE; text-align: center; color: #666; font-size: 12px;">
        <p>PDF generato il ${formatDate(new Date().toISOString())} - GoMutuo</p>
      </div>
    `;

    // Add container to document
    document.body.appendChild(pdfContainer);

    // Generate canvas from HTML
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove container
    document.body.removeChild(pdfContainer);

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `submission_${data.id.substring(0, 8)}_${date}.pdf`;

    // Save PDF
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Errore nella generazione del PDF');
  }
};
