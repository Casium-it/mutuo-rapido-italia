import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface QuestionIdChangeConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (updateReferences: boolean) => void;
  oldQuestionId: string;
  newQuestionId: string;
  referenceCount: number;
}

export const QuestionIdChangeConfirmDialog: React.FC<QuestionIdChangeConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  oldQuestionId,
  newQuestionId,
  referenceCount
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma Modifica ID Domanda</AlertDialogTitle>
          <AlertDialogDescription>
            Stai cambiando l'ID della domanda da "{oldQuestionId}" a "{newQuestionId}".
            {referenceCount > 0 && (
              <>
                <br /><br />
                <strong>Attenzione:</strong> Ci sono {referenceCount} domande che fanno riferimento a questo ID.
                <br /><br />
                Cosa vuoi fare?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>
            Annulla
          </AlertDialogCancel>
          
          {referenceCount > 0 ? (
            <>
              <AlertDialogAction 
                onClick={() => onConfirm(false)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Conferma (mantieni riferimenti)
              </AlertDialogAction>
              <AlertDialogAction 
                onClick={() => onConfirm(true)}
                className="bg-[#245C4F] hover:bg-[#1e4f44]"
              >
                Conferma e aggiorna riferimenti
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction 
              onClick={() => onConfirm(false)}
              className="bg-[#245C4F] hover:bg-[#1e4f44]"
            >
              Conferma
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};