
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ExitConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  onSaveAndExit: () => void;
  progress: number;
}

export function ExitConfirmationDialog({
  open,
  onClose,
  onConfirmExit,
  onSaveAndExit,
  progress
}: ExitConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            Vuoi davvero uscire?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Hai completato il <span className="font-semibold text-[#245C4F]">{progress}%</span> della simulazione.
            Se esci senza salvare, perderai tutti i progressi fatti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            className="order-3 sm:order-1"
          >
            Continua simulazione
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={onSaveAndExit}
            className="order-1 sm:order-2 border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white"
          >
            Salva ed esci
          </Button>
          <AlertDialogAction
            onClick={onConfirmExit}
            className="order-2 sm:order-3 bg-red-600 hover:bg-red-700"
          >
            Esci senza salvare
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
