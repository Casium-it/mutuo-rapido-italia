
import jsPDF from 'jspdf';
import { getQuestionTextWithStyledResponses } from './formUtils';
import { LeadStatus } from '@/types/leadStatus';

export interface PDFSubmissionData {
  id: string;
  created_at: string;
  form_title: string;
  phone_number: string | null;
  consulting: boolean | null;
  user_identifier: string | null;
  metadata: any;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  notes: string | null;
  lead_status: LeadStatus;
  mediatore: string | null;
  responses: Array<{
    id: string;
    question_id: string;
    question_text: string;
    block_id: string;
    response_value: any;
    created_at: string;
  }>;
}

// PDF layout constants
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20; // Margin in mm
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const CONTENT_HEIGHT = PAGE_HEIGHT - (MARGIN * 2);

// Font sizes
const FONT_SIZE_TITLE = 18;
const FONT_SIZE_SUBTITLE = 14;
const FONT_SIZE_SECTION = 12;
const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_SMALL = 9;

// Line heights (spacing between lines)
const LINE_HEIGHT_TITLE = 8;
const LINE_HEIGHT_NORMAL = 5;
const LINE_HEIGHT_SECTION = 7;

/**
 * Maps lead status values to Italian labels
 */
const getLeadStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'not_contacted': 'Non Contattato',
    'non_risponde_x1': 'Non Risponde x1',
    'non_risponde_x2': 'Non Risponde x2',
    'non_risponde_x3': 'Non Risponde x3',
    'non_interessato': 'Non Interessato',
    'da_risentire': 'Da Risentire',
    'prenotata_consulenza': 'Prenotata Consulenza',
    'pratica_bocciata': 'Pratica Bocciata',
    'converted': 'Convertito',
    // Legacy mappings
    'first_contact': 'Primo Contatto',
    'advanced_conversations': 'Conversazioni Avanzate',
    'rejected': 'Rifiutato'
  };
  return statusMap[status] || status;
};

/**
 * Format date for Italian locale
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
 * Add text with automatic line wrapping and return new Y position
 */
const addWrappedText = (
  pdf: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number,
  fontSize: number = FONT_SIZE_NORMAL,
  lineHeight: number = LINE_HEIGHT_NORMAL
): number => {
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
};

/**
 * Add a section title
 */
const addSectionTitle = (
  pdf: jsPDF,
  title: string,
  x: number,
  y: number
): number => {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZE_SECTION);
  pdf.setTextColor(36, 92, 79); // #245C4F
  pdf.text(title, x, y);
  pdf.setTextColor(0, 0, 0); // Reset to black
  pdf.setFont('helvetica', 'normal');
  return y + LINE_HEIGHT_SECTION;
};

/**
 * Format response value for display
 */
const formatResponseValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return JSON.stringify(value, null, 2);
  }
  
  return String(value);
};

/**
 * Process question text and return parts with responses highlighted
 */
const processQuestionText = (
  questionText: string,
  responseValue: any
): Array<{type: 'text' | 'response', content: string}> => {
  if (!questionText) {
    return [{ type: 'text', content: '' }];
  }

  const { parts } = getQuestionTextWithStyledResponses(questionText, '', responseValue);
  return parts;
};

/**
 * Add question with styled responses
 */
const addQuestionWithResponses = (
  pdf: jsPDF,
  questionText: string,
  responseValue: any,
  questionId: string,
  x: number,
  y: number
): number => {
  const parts = processQuestionText(questionText, responseValue);
  
  pdf.setFontSize(FONT_SIZE_NORMAL);
  let currentX = x;
  
  // Check if we need a new page
  if (y > PAGE_HEIGHT - MARGIN - 20) {
    pdf.addPage();
    y = MARGIN;
  }
  
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
};

/**
 * Generate the first page with lead information
 */
const generateFirstPage = (pdf: jsPDF, data: PDFSubmissionData): void => {
  let y = MARGIN;
  
  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZE_TITLE);
  pdf.setTextColor(36, 92, 79); // #245C4F
  
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
  const title = fullName ? `GoMutuo - ${fullName}` : 'GoMutuo - Dettagli Submission';
  
  y = addWrappedText(pdf, title, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_TITLE, LINE_HEIGHT_TITLE);
  
  // Submission ID
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(FONT_SIZE_NORMAL);
  pdf.setTextColor(100, 100, 100); // Gray
  y = addWrappedText(pdf, `ID: ${data.id}`, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
  y += 5; // Extra spacing
  
  // Lead Information Section
  pdf.setTextColor(0, 0, 0); // Black
  y = addSectionTitle(pdf, 'Informazioni Lead', MARGIN, y);
  
  // Lead details
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
  
  y += 10; // Extra spacing before notes
  
  // Notes Section
  if (data.notes && data.notes.trim()) {
    y = addSectionTitle(pdf, 'Note', MARGIN, y);
    y = addWrappedText(pdf, data.notes, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
  }
  
  // Metadata Section
  if (data.metadata) {
    y += 10;
    y = addSectionTitle(pdf, 'Metadata', MARGIN, y);
    
    const metadataInfo = [
      `Blocchi attivi: ${data.metadata.blocks?.length || 0}`,
      `Blocchi completati: ${data.metadata.completedBlocks?.length || 0}`,
      `Blocchi dinamici: ${data.metadata.dynamicBlocks || 0}`
    ];
    
    if (data.metadata.slug) {
      metadataInfo.push(`Slug: ${data.metadata.slug}`);
    }
    
    metadataInfo.forEach(info => {
      y = addWrappedText(pdf, info, MARGIN, y, CONTENT_WIDTH, FONT_SIZE_NORMAL, LINE_HEIGHT_NORMAL);
    });
  }
};

/**
 * Generate blocks and responses starting from page 2
 */
const generateBlocksAndResponses = (pdf: jsPDF, data: PDFSubmissionData): void => {
  // Start new page for responses
  pdf.addPage();
  let y = MARGIN;
  
  // Responses header
  y = addSectionTitle(pdf, `Risposte (${data.responses.length} totali)`, MARGIN, y);
  y += 5;
  
  if (data.responses.length === 0) {
    y = addWrappedText(pdf, 'Nessuna risposta trovata per questa submission.', MARGIN, y, CONTENT_WIDTH);
    return;
  }
  
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
    y = addSectionTitle(pdf, `Blocco: ${blockId} (${blockResponses.length} risposte)`, MARGIN, y);
    y += 3;
    
    // Process each response in the block
    blockResponses.forEach(response => {
      y = addQuestionWithResponses(
        pdf,
        response.question_text,
        response.response_value,
        response.question_id,
        MARGIN,
        y
      );
      y += 2; // Extra spacing between questions
    });
    
    y += 5; // Extra spacing between blocks
  });
};

/**
 * Generate submission PDF
 */
export const generateSubmissionPDF = async (data: PDFSubmissionData): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Generate first page with lead information
    generateFirstPage(pdf, data);
    
    // Generate blocks and responses from page 2 onwards
    generateBlocksAndResponses(pdf, data);
    
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
