
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
 * Simple text wrapping function for jsPDF
 */
const wrapText = (pdf: jsPDF, text: string, maxWidth: number): string[] => {
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
        // Word is too long, just add it
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
 * Renders question text with styled response values
 */
const renderStyledQuestionText = (pdf: jsPDF, questionText: string, responseValue: any, xPos: number, yPos: number, maxWidth: number): number => {
  if (!questionText) return yPos;

  const { parts } = getQuestionTextWithStyledResponses(questionText, '', responseValue);
  let currentY = yPos;
  let currentLine = '';
  let currentX = xPos;
  
  // Process each part and handle line wrapping
  for (const part of parts) {
    const words = part.content.split(' ');
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      // Set font for width calculation
      if (part.isResponse) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(36, 92, 79); // Green color for responses
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
      }
      
      const testWidth = pdf.getTextWidth(testLine);
      
      if (testWidth <= maxWidth - (currentX - xPos)) {
        currentLine = testLine;
      } else {
        // Print current line if it exists
        if (currentLine) {
          pdf.text(currentLine, currentX, currentY);
          currentY += 7; // Increased line height
          currentX = xPos;
          currentLine = word;
        } else {
          // Word is too long, just add it
          pdf.text(word, currentX, currentY);
          currentY += 7;
          currentX = xPos;
          currentLine = '';
        }
      }
    }
    
    // Add space after each part if not at line end
    if (currentLine) {
      currentLine += ' ';
    }
  }
  
  // Print remaining text
  if (currentLine.trim()) {
    pdf.text(currentLine.trim(), currentX, currentY);
    currentY += 7;
  }
  
  // Reset font
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  return currentY;
};

/**
 * Adds header to page
 */
const addPageHeader = (pdf: jsPDF, data: PDFSubmissionData, pageNumber: number): number => {
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = margin;

  // Header background
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(36, 92, 79); // #245C4F
  
  const headerName = [data.first_name, data.last_name].filter(Boolean).join(' ');
  const title = headerName ? `GoMutuo - ${headerName}` : 'GoMutuo - Dettagli Submission';
  pdf.text(title, margin, yPos);

  // Page number and date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const dateText = formatDate(data.created_at);
  const pageText = `Pagina ${pageNumber}`;
  
  pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), yPos);
  pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), yPos + 5);

  yPos += 10;

  // Submission ID
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`ID: ${data.id}`, margin, yPos);

  yPos += 15;

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  return yPos;
};

/**
 * Adds footer to page
 */
const addPageFooter = (pdf: jsPDF): void => {
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

/**
 * Adds section title
 */
const addSectionTitle = (pdf: jsPDF, title: string, yPos: number): number => {
  const margin = 20;
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(36, 92, 79); // #245C4F
  pdf.text(title, margin, yPos);
  
  // Reset for content
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  return yPos + 12; // Increased spacing after titles
};

/**
 * Adds text lines with improved spacing
 */
const addTextLines = (pdf: jsPDF, lines: string[], yPos: number): number => {
  const margin = 20;
  const lineHeight = 8; // Increased from 6 to 8 for better readability
  
  for (const line of lines) {
    pdf.text(line, margin, yPos);
    yPos += lineHeight;
  }
  
  return yPos;
};

/**
 * Checks if content fits on current page, adds new page if needed
 */
const checkPageSpace = (pdf: jsPDF, yPos: number, contentHeight: number, data: PDFSubmissionData, pageNum: { current: number }): number => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const footerSpace = 30;
  
  if (yPos + contentHeight > pageHeight - footerSpace) {
    addPageFooter(pdf);
    pdf.addPage();
    pageNum.current++;
    return addPageHeader(pdf, data, pageNum.current);
  }
  
  return yPos;
};

export const generateSubmissionPDF = async (data: PDFSubmissionData): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - (margin * 2);
    const pageNumber = { current: 1 };

    // Add header to first page
    let yPosition = addPageHeader(pdf, data, pageNumber.current);

    // === FIRST PAGE: GENERAL INFORMATION ===
    
    // General Information Section
    yPosition = addSectionTitle(pdf, 'Informazioni Generali', yPosition);

    const generalInfo = [
      `Tipo Form: ${data.form_type}`,
      `Data Invio: ${formatDate(data.created_at)}`,
      `Consulenza: ${data.consulting ? 'Richiesta' : 'Non richiesta'}`
    ];

    if (data.phone_number) {
      generalInfo.push(`Telefono: ${data.phone_number}`);
    }

    if (data.user_identifier) {
      generalInfo.push(`ID Utente: ${data.user_identifier}`);
    }

    yPosition = addTextLines(pdf, generalInfo, yPosition);
    yPosition += 15; // Extra spacing between sections

    // Lead Information Section
    yPosition = addSectionTitle(pdf, 'Informazioni Lead', yPosition);

    const leadName = [data.first_name, data.last_name].filter(Boolean).join(' ');
    const leadInfo = [
      `Nome: ${leadName || 'Non specificato'}`,
      `Email: ${data.email || 'Non specificata'}`,
      `Status: ${getLeadStatusLabel(data.lead_status)}`
    ];

    yPosition = addTextLines(pdf, leadInfo, yPosition);
    yPosition += 15; // Extra spacing

    // Notes section (with improved spacing)
    if (data.notes) {
      yPosition = addSectionTitle(pdf, 'Note', yPosition);
      
      const notesLines = wrapText(pdf, data.notes, maxWidth);
      yPosition = addTextLines(pdf, notesLines, yPosition);
      yPosition += 20; // Extra spacing after notes
    }

    // === FORCE PAGE BREAK BEFORE RESPONSES ===
    // Add footer to first page and start responses on second page
    addPageFooter(pdf);
    pdf.addPage();
    pageNumber.current++;
    yPosition = addPageHeader(pdf, data, pageNumber.current);

    // === SECOND PAGE ONWARDS: RESPONSES ===
    if (data.responses.length > 0) {
      yPosition = addSectionTitle(pdf, `Risposte (${data.responses.length} totali)`, yPosition);

      // Group responses by block
      const responsesByBlock = data.responses.reduce((acc, response) => {
        if (!acc[response.block_id]) {
          acc[response.block_id] = [];
        }
        acc[response.block_id].push(response);
        return acc;
      }, {} as Record<string, typeof data.responses>);

      // Process each block
      for (const [blockId, blockResponses] of Object.entries(responsesByBlock)) {
        yPosition = checkPageSpace(pdf, yPosition, 50, data, pageNumber);
        
        // Block title
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(36, 92, 79);
        pdf.text(`Blocco: ${blockId} (${blockResponses.length} risposte)`, margin, yPosition);
        yPosition += 15; // Increased spacing after block title

        // Reset for questions
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);

        // Process each response in the block
        for (const response of blockResponses) {
          // Estimate height needed for this question
          const estimatedHeight = Math.max(40, response.question_text.length / 8);
          yPosition = checkPageSpace(pdf, yPosition, estimatedHeight, data, pageNumber);

          // Question border (left side)
          pdf.setDrawColor(36, 92, 79);
          pdf.setLineWidth(1);
          const borderStartY = yPosition - 2;
          
          // Render styled question text with responses
          const questionEndY = renderStyledQuestionText(
            pdf, 
            response.question_text, 
            response.response_value, 
            margin + 5, 
            yPosition, 
            maxWidth - 10
          );

          // Draw the border for the full height of the question
          pdf.line(margin, borderStartY, margin, questionEndY + 5);

          yPosition = questionEndY + 5;

          // Question ID
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`ID: ${response.question_id}`, margin + 5, yPosition);
          yPosition += 15; // Increased spacing between questions
          
          // Reset
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }

        yPosition += 15; // Extra space between blocks
      }
    } else {
      yPosition = addSectionTitle(pdf, 'Risposte', yPosition);
      
      pdf.setTextColor(128, 128, 128);
      pdf.text('Nessuna risposta trovata per questa submission.', margin, yPosition);
      pdf.setTextColor(0, 0, 0);
    }

    // Add footer to last page
    addPageFooter(pdf);

    // Generate filename and save
    const date = new Date().toISOString().split('T')[0];
    const filenameName = [data.first_name, data.last_name].filter(Boolean).join(' ');
    const nameForFilename = filenameName ? `_${filenameName.replace(/\s+/g, '_')}` : '';
    const filename = `submission_${data.id.substring(0, 8)}${nameForFilename}_${date}.pdf`;
    
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Errore nella generazione del PDF');
  }
};
