
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SaveSimulationData, SaveSimulationResult } from "@/services/saveSimulationService";
import { validateAndFormatItalianPhone } from "@/utils/phoneValidation";
import { Loader2, Copy, Check } from "lucide-react";

interface SaveSimulationDialogProps {
  open: boolean;
  onClose: (shouldNavigate?: boolean) => void;
  onSave: (data: SaveSimulationData) => Promise<SaveSimulationResult>;
  isLoading: boolean;
}

export function SaveSimulationDialog({
  open,
  onClose,
  onSave,
  isLoading
}: SaveSimulationDialogProps) {
  const [formData, setFormData] = useState<SaveSimulationData>({
    name: "",
    phone: "",
    email: ""
  });
  const [resumeCode, setResumeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Partial<SaveSimulationData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SaveSimulationData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    }

    // Phone validation using the same logic as FormCompleted
    const phoneValidation = validateAndFormatItalianPhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Inserisci un indirizzo email valido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Format phone number before saving
      const phoneValidation = validateAndFormatItalianPhone(formData.phone);
      const dataToSave = {
        ...formData,
        phone: phoneValidation.formattedPhone
      };

      const result = await onSave(dataToSave);
      
      if (result.success && result.resumeCode) {
        setResumeCode(result.resumeCode);
        toast.success("Simulazione salvata con successo!");
      } else {
        toast.error(result.error || "Errore durante il salvataggio");
      }
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      toast.error("Errore imprevisto durante il salvataggio");
    }
  };

  const handleCopyCode = async () => {
    if (resumeCode) {
      try {
        await navigator.clipboard.writeText(resumeCode);
        setCopied(true);
        toast.success("Codice copiato negli appunti!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Errore nella copia:', error);
        toast.error("Impossibile copiare il codice");
      }
    }
  };

  const handleClose = () => {
    // Reset form state
    setFormData({ name: "", phone: "", email: "" });
    setResumeCode(null);
    setErrors({});
    setCopied(false);
    
    // Close dialog - if we have a resume code, it means save was successful
    onClose(!!resumeCode);
  };

  const handleInputChange = (field: keyof SaveSimulationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !isLoading && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {resumeCode ? "Simulazione salvata!" : "Salva la tua simulazione"}
          </DialogTitle>
        </DialogHeader>

        {resumeCode ? (
          // Success state - show resume code
          <div className="space-y-4">
            <div className="bg-[#245C4F]/10 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-3">
                Il tuo codice di ripresa è:
              </p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <code className="text-xl font-mono font-bold bg-white px-3 py-2 rounded border">
                  {resumeCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiato!" : "Copia"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Salva questo codice per riprendere la simulazione in futuro
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                💡 Come riprendere la simulazione:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Usa il link diretto: <code className="bg-blue-100 px-1 rounded">gomutui.it/riprendi/{resumeCode}</code></li>
                <li>• Oppure vai su "Riprendi simulazione" e inserisci il codice</li>
              </ul>
            </div>

            <Button 
              onClick={handleClose}
              className="w-full bg-[#245C4F] hover:bg-[#1e4f44] text-white"
            >
              Continua
            </Button>
          </div>
        ) : (
          // Form state - collect user data
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome e Cognome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Mario Rossi"
                disabled={isLoading}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numero di telefono *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+39 123 456 7890"
                disabled={isLoading}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="mario.rossi@email.com"
                disabled={isLoading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#245C4F] hover:bg-[#1e4f44] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Salva simulazione"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
