
import jsPDF from 'jspdf';
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
 * Formats a date string to Italian format
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Renders question text with response values
 */
const renderQuestionText = (questionText: string, responseValue: any): string => {
  if (!questionText) return '';

  const { parts } = getQuestionTextWithStyledResponses(questionText, '', responseValue);
  
  return parts.map(part => part.content).join('');
};

/**
 * Wraps text to fit within specified width
 */
const wrapText = (pdf: jsPDF, text: string, maxWidth: number, fontSize: number = 10): string[] => {
  pdf.setFontSize(fontSize);
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = pdf.getTextWidth(testLine);
    
    if (textWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, split it
        lines.push(word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

/**
 * Adds a new page with header
 */
const addPageWithHeader = (pdf: jsPDF, data: PDFSubmissionData, pageNumber: number): number => {
  if (pageNumber > 1) {
    pdf.addPage();
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Header
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
  const title = fullName ? `GoMutuo - ${fullName}` : 'GoMutuo - Dettagli Submission';
  
  pdf.text(title, margin, yPosition);
  
  // Page number and date on the right
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const dateText = formatDate(data.created_at);
  const pageText = `Pagina ${pageNumber}`;
  
  pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), yPosition);
  pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), yPosition + 5);
  
  yPosition += 15;

  // Submission ID
  pdf.setFontSize(8);
  pdf.text(`ID: ${data.id}`, margin, yPosition);
  yPosition += 10;

  // Line separator
  pdf.setDrawColor(36, 92, 79); // #245C4F
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  return yPosition;
};

/**
 * Adds footer to the page
 */
const addFooter = (pdf: jsPDF): void => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(128, 128, 128);
  
  const footerText = `PDF generato il ${formatDate(new Date().toISOString())} - GoMutuo`;
  const textWidth = pdf.getTextWidth(footerText);
  
  pdf.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 15);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
};

export const generateSubmissionPDF = async (data: PDFSubmissionData): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - 40; // Leave space for header and footer
    
    let pageNumber = 1;
    let yPosition = addPageWithHeader(pdf, data, pageNumber);

    // General Information Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(36, 92, 79); // #245C4F
    pdf.text('Informazioni Generali', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    // Form info
    const formInfoLines = [
      `Tipo Form: ${data.form_type}`,
      `Data Invio: ${formatDate(data.created_at)}`,
      `Consulenza: ${data.consulting ? 'Richiesta' : 'Non richiesta'}`
    ];

    if (data.phone_number) {
      formInfoLines.push(`Telefono: ${data.phone_number}`);
    }

    if (data.user_identifier) {
      formInfoLines.push(`ID Utente: ${data.user_identifier}`);
    }

    for (const line of formInfoLines) {
      if (yPosition + 6 > maxHeight) {
        addFooter(pdf);
        pageNumber++;
        yPosition = addPageWithHeader(pdf, data, pageNumber);
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 5;

    // Lead Information
    if (yPosition + 30 > maxHeight) {
      addFooter(pdf);
      pageNumber++;
      yPosition = addPageWithHeader(pdf, data, pageNumber);
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(36, 92, 79);
    pdf.text('Informazioni Lead', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
    const leadInfoLines = [
      `Nome: ${fullName || 'Non specificato'}`,
      `Email: ${data.email || 'Non specificata'}`,
      `Status: ${getLeadStatusLabel(data.lead_status)}`
    ];

    for (const line of leadInfoLines) {
      if (yPosition + 6 > maxHeight) {
        addFooter(pdf);
        pageNumber++;
        yPosition = addPageWithHeader(pdf, data, pageNumber);
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    }

    if (data.notes) {
      yPosition += 3;
      if (yPosition + 6 > maxHeight) {
        addFooter(pdf);
        pageNumber++;
        yPosition = addPageWithHeader(pdf, data, pageNumber);
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Note:', margin, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'normal');
      const notesLines = wrapText(pdf, data.notes, maxWidth, 10);
      for (const line of notesLines) {
        if (yPosition + 5 > maxHeight) {
          addFooter(pdf);
          pageNumber++;
          yPosition = addPageWithHeader(pdf, data, pageNumber);
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      }
    }

    yPosition += 10;

    // Responses Section
    if (data.responses.length > 0) {
      if (yPosition + 15 > maxHeight) {
        addFooter(pdf);
        pageNumber++;
        yPosition = addPageWithHeader(pdf, data, pageNumber);
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(36, 92, 79);
      pdf.text(`Risposte (${data.responses.length} totali)`, margin, yPosition);
      yPosition += 10;

      // Group responses by block
      const responsesByBlock = data.responses.reduce((acc, response) => {
        if (!acc[response.block_id]) {
          acc[response.block_id] = [];
        }
        acc[response.block_id].push(response);
        return acc;
      }, {} as Record<string, typeof data.responses>);

      for (const [blockId, blockResponses] of Object.entries(responsesByBlock)) {
        // Block header
        if (yPosition + 20 > maxHeight) {
          addFooter(pdf);
          pageNumber++;
          yPosition = addPageWithHeader(pdf, data, pageNumber);
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(36, 92, 79);
        pdf.text(`Blocco: ${blockId} (${blockResponses.length} risposte)`, margin, yPosition);
        yPosition += 8;

        // Process each response
        for (const response of blockResponses) {
          const questionText = renderQuestionText(response.question_text, response.response_value);
          const wrappedLines = wrapText(pdf, questionText, maxWidth - 10, 10);
          const questionHeight = wrappedLines.length * 5 + 8; // 5mm per line + spacing

          // Check if question fits on current page
          if (yPosition + questionHeight > maxHeight) {
            addFooter(pdf);
            pageNumber++;
            yPosition = addPageWithHeader(pdf, data, pageNumber);
          }

          // Question border (left border like in the web version)
          pdf.setDrawColor(36, 92, 79);
          pdf.setLineWidth(1);
          pdf.line(margin, yPosition - 2, margin, yPosition + questionHeight - 6);

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);

          // Add question text
          for (const line of wrappedLines) {
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
          }

          // Question ID
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`ID: ${response.question_id}`, margin + 5, yPosition);
          yPosition += 8;
          
          pdf.setTextColor(0, 0, 0);
        }

        yPosition += 5; // Space between blocks
      }
    } else {
      // No responses message
      if (yPosition + 15 > maxHeight) {
        addFooter(pdf);
        pageNumber++;
        yPosition = addPageWithHeader(pdf, data, pageNumber);
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(36, 92, 79);
      pdf.text('Risposte', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      pdf.text('Nessuna risposta trovata per questa submission.', margin, yPosition);
    }

    // Add footer to last page
    addFooter(pdf);

    // Generate filename and save
    const date = new Date().toISOString().split('T')[0];
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
    const nameForFilename = fullName ? `_${fullName.replace(/\s+/g, '_')}` : '';
    const filename = `submission_${data.id.substring(0, 8)}${nameForFilename}_${date}.pdf`;
    
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Errore nella generazione del PDF');
  }
};
