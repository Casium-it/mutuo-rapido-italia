
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
      <AlertDialogContent className="sm:max-w-[500px] mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            Vuoi davvero uscire dalla simulazione?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 leading-relaxed">
            Hai completato il <span className="font-semibold text-[#245C4F]">{progress}%</span> della tua simulazione mutuo.
            <br />
            <span className="text-sm mt-2 block">
              Se esci senza salvare, tutti i dati inseriti fino ad ora andranno perduti e dovrai ricominciare da capo.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-3 sm:gap-2">
          <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
            <AlertDialogCancel 
              onClick={onClose}
              className="flex-1 sm:flex-none border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white"
            >
              Continua simulazione
            </AlertDialogCancel>
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Button
                variant="outline"
                onClick={onSaveAndExit}
                className="flex-1 border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white"
              >
                Salva ed esci
              </Button>
              <AlertDialogAction
                onClick={onConfirmExit}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Esci senza salvare
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
