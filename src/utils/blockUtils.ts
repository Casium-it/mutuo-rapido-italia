
import { Block } from "@/types/form";

/**
 * Verifica se un blocco ha la priorità impostata, altrimenti la imposta
 * in base al suo block_number
 */
export function ensureBlockHasPriority(block: Block): Block {
  if (typeof block.priority === "number") {
    return block;
  }
  
  // Altrimenti, assegna una priorità basata sul block_number
  const blockNum = parseInt(block.block_number, 10);
  
  // Gestisce numeri di blocchi speciali
  if (isNaN(blockNum) || blockNum > 100) {
    return {
      ...block,
      priority: 1000 // Priorità alta per blocchi speciali
    };
  }
  
  return {
    ...block,
    priority: blockNum * 10 // Moltiplica per 10 per avere spazio tra i blocchi
  };
}

/**
 * Ordina i blocchi per priorità
 */
export function sortBlocksByPriority(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => a.priority - b.priority);
}

/**
 * Clona un blocco per la creazione di blocchi dinamici
 * @param block Il blocco da clonare
 * @param copyNumber Il numero di copia da usare per il blocco
 * @returns Un nuovo blocco copiato con ID aggiornati
 */
export function cloneBlockForDynamicCreation(block: Block, copyNumber: number): Block {
  // Clona profondamente il blocco
  const clonedBlock = JSON.parse(JSON.stringify(block));
  
  // Aggiorna l'ID del blocco e altri metadati
  const newBlockId = block.block_id.replace('{copyNumber}', copyNumber.toString());
  
  // Crea il nuovo blocco con i metadati aggiornati
  const newBlock: Block = {
    ...clonedBlock,
    block_id: newBlockId,
    blueprint_id: block.block_id,
    copy_number: copyNumber,
    title: `${block.title} ${copyNumber}`,
  };
  
  // Aggiorna gli ID delle domande
  newBlock.questions = newBlock.questions.map(question => ({
    ...question,
    question_id: question.question_id.replace('{copyNumber}', copyNumber.toString())
  }));
  
  return newBlock;
}

/**
 * Verifica se un blocco è un blueprint per blocchi dinamici
 * @param block Il blocco da verificare
 * @returns true se il blocco è un blueprint per blocchi dinamici
 */
export function isBlockBlueprint(block: Block): boolean {
  return block.multiBlock === true;
}

/**
 * Mappa i possibili percorsi all'interno di un blocco, utile per debug
 * @param block Il blocco da analizzare
 * @returns Un oggetto che descrive i possibili percorsi nel blocco
 */
export function mapBlockPaths(block: Block): { 
  paths: Array<{start: string, questions: string[], end: string, isTerminal: boolean}>,
  terminalQuestions: string[]
} {
  const blockId = block.block_id;
  const questionMap = new Map<string, {
    nextQuestions: Set<string>,
    isTerminal: boolean
  }>();
  
  // Inizializza la mappa con tutte le domande
  block.questions.forEach(question => {
    questionMap.set(question.question_id, {
      nextQuestions: new Set<string>(),
      isTerminal: false
    });
  });
  
  // Analizza i collegamenti tra domande
  block.questions.forEach(question => {
    const questionInfo = questionMap.get(question.question_id)!;
    
    Object.entries(question.placeholders).forEach(([_, placeholder]) => {
      if (placeholder.type === "select") {
        // Analizza le opzioni del select
        (placeholder.options || []).forEach(option => {
          if (option.leads_to) {
            if (option.leads_to === "next_block" || !option.leads_to.startsWith(blockId)) {
              questionInfo.isTerminal = true;
            } else {
              questionInfo.nextQuestions.add(option.leads_to);
            }
          }
        });
      } else if ((placeholder as any).leads_to) {
        const leadsTo = (placeholder as any).leads_to;
        if (leadsTo === "next_block" || !leadsTo.startsWith(blockId)) {
          questionInfo.isTerminal = true;
        } else {
          questionInfo.nextQuestions.add(leadsTo);
        }
      } else if (placeholder.type === "MultiBlockManager") {
        questionInfo.isTerminal = true;
      }
    });
    
    // Se la domanda non ha next questions, potrebbe essere terminale
    if (questionInfo.nextQuestions.size === 0) {
      const isLastQuestion = question === block.questions[block.questions.length - 1];
      if (isLastQuestion || Object.keys(question.placeholders).length > 0) {
        questionInfo.isTerminal = true;
      }
    }
  });
  
  // Identifica le domande di inizio (quelle che non sono target di nessun'altra domanda)
  const startQuestions = new Set(block.questions.map(q => q.question_id));
  questionMap.forEach((info, _) => {
    info.nextQuestions.forEach(nextQ => {
      startQuestions.delete(nextQ);
    });
  });
  
  // Costruisci i percorsi partendo dalle domande di inizio
  const paths: Array<{start: string, questions: string[], end: string, isTerminal: boolean}> = [];
  const terminalQuestions: string[] = [];
  
  // Identifica le domande terminali
  questionMap.forEach((info, questionId) => {
    if (info.isTerminal) {
      terminalQuestions.push(questionId);
    }
  });
  
  // Costruisci i percorsi partendo dalle domande di inizio
  startQuestions.forEach(startQuestion => {
    const buildPaths = (
      currentQuestion: string, 
      path: string[] = []
    ): {path: string[], end: string, isTerminal: boolean}[] => {
      const currentPath = [...path, currentQuestion];
      const info = questionMap.get(currentQuestion);
      
      if (!info) return [];
      
      // Se non ci sono next questions, questo è un endpoint del percorso
      if (info.nextQuestions.size === 0) {
        return [{
          path: currentPath,
          end: currentQuestion,
          isTerminal: info.isTerminal
        }];
      }
      
      // Continua a costruire il percorso per ogni possibile next question
      const subPaths: {path: string[], end: string, isTerminal: boolean}[] = [];
      info.nextQuestions.forEach(nextQuestion => {
        // Evita cicli infiniti
        if (!currentPath.includes(nextQuestion)) {
          subPaths.push(...buildPaths(nextQuestion, currentPath));
        }
      });
      
      return subPaths;
    };
    
    const pathsFromStart = buildPaths(startQuestion);
    pathsFromStart.forEach(pathInfo => {
      paths.push({
        start: startQuestion,
        questions: pathInfo.path,
        end: pathInfo.end,
        isTerminal: pathInfo.isTerminal
      });
    });
  });
  
  return { paths, terminalQuestions };
}
