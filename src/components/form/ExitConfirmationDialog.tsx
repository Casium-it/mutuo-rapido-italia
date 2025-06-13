
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
      <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto p-4 sm:p-6">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">
            Vuoi davvero uscire dalla simulazione?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 leading-relaxed text-center sm:text-left">
            Hai completato il <span className="font-semibold text-[#245C4F]">{progress}%</span> della tua simulazione mutuo.
            <br />
            <span className="text-sm mt-2 block">
              Se esci senza salvare, tutti i dati inseriti fino ad ora andranno perduti e dovrai ricominciare da capo.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex flex-col gap-3 mt-6">
          {/* Primary action - Continue simulation */}
          <AlertDialogCancel 
            onClick={onClose}
            className="w-full order-1 border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white font-medium py-3"
          >
            Continua simulazione
          </AlertDialogCancel>
          
          {/* Secondary actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full order-2">
            <Button
              variant="outline"
              onClick={onSaveAndExit}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
            >
              Salva ed esci
            </Button>
            <AlertDialogAction
              onClick={onConfirmExit}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
            >
              Esci senza salvare
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
