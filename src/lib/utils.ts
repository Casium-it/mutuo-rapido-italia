
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Aggiungiamo una funzione di utility per calcolare il progresso percentuale
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

// Formatta un numero come valuta in Euro
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Formatta un numero con separatore migliaia in formato italiano
export function formatNumberWithThousandSeparator(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  return new Intl.NumberFormat('it-IT', { useGrouping: true }).format(numValue);
}

// Capitalizza la prima lettera di ogni parola
export function capitalizeWords(value: string): string {
  if (!value) return '';
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Sorting utilities for admin response display
export function sortBlocksByPriority<T extends { block_id: string }>(
  responsesByBlock: Record<string, T[]>,
  blocks: Array<{ block_id: string; priority: number }>
): Array<[string, T[]]> {
  // Create a map of block priorities for quick lookup
  const priorityMap = new Map(blocks.map(block => [block.block_id, block.priority]));
  
  // Sort entries by block priority
  return Object.entries(responsesByBlock).sort(([blockIdA], [blockIdB]) => {
    const priorityA = priorityMap.get(blockIdA) ?? Infinity;
    const priorityB = priorityMap.get(blockIdB) ?? Infinity;
    return priorityA - priorityB;
  });
}

export function sortQuestionsByNumber<T extends { question_id: string }>(
  responses: T[],
  questionMap: Map<string, { question: { question_number?: string } }>
): T[] {
  return responses.sort((a, b) => {
    const questionA = questionMap.get(a.question_id)?.question;
    const questionB = questionMap.get(b.question_id)?.question;
    
    if (!questionA?.question_number || !questionB?.question_number) return 0;
    
    // Extract numeric parts for proper sorting (e.g., "6.1" -> 6.1)
    const parseQuestionNumber = (qNum: string) => {
      const parts = qNum.split('.');
      return parseFloat(parts[0]) + (parts[1] ? parseFloat(parts[1]) / 1000 : 0);
    };
    
    return parseQuestionNumber(questionA.question_number) - parseQuestionNumber(questionB.question_number);
  });
}
