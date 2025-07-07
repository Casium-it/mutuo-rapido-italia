
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, XCircle } from 'lucide-react';
import { ValidationResult } from '@/utils/blockValidation';

interface PreSaveValidationDialogProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSaveAnyway: () => void;
  validationErrors: ValidationResult | null;
  isLoading?: boolean;
}

export const PreSaveValidationDialog: React.FC<PreSaveValidationDialogProps> = ({
  open,
  onClose,
  onCancel,
  onSaveAnyway,
  validationErrors,
  isLoading = false
}) => {
  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const handleSaveAnyway = () => {
    onSaveAnyway();
    onClose();
  };

  // Handle case where validationErrors is null or undefined
  const errors = validationErrors?.errors || [];
  const warnings = validationErrors?.warnings || [];
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  // Don't render if no validation errors provided
  if (!validationErrors || (!hasErrors && !hasWarnings)) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Errori di Validazione Rilevati
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Sono stati rilevati errori di validazione nel blocco che stai tentando di salvare. 
            Questi errori potrebbero causare problemi nel flusso del form.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Errori nei Riferimenti leads_to ({errors.length})
              </h4>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-white rounded p-2 border border-red-100">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasWarnings && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Avvisi ({warnings.length})
              </h4>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-700 bg-white rounded p-2 border border-yellow-100">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSaveAnyway}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Salvataggio...' : 'Salva Comunque'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
