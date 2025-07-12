
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SaveSimulationData, SaveSimulationResult } from "@/services/saveSimulationService";
import { validateAndFormatItalianPhone } from "@/utils/phoneValidation";

interface SaveSimulationDialogProps {
  open: boolean;
  onClose: (shouldNavigate?: boolean) => void;
  onSave: (data: Omit<SaveSimulationData, 'percentage'>) => Promise<SaveSimulationResult>;
  isLoading: boolean;
  currentSimulationId: string;
}

export function SaveSimulationDialog({
  open,
  onClose,
  onSave,
  isLoading,
  currentSimulationId
}: SaveSimulationDialogProps) {
  const [formData, setFormData] = useState<Omit<SaveSimulationData, 'percentage'>>({
    name: "",
    phone: "",
    email: ""
  });
  const [resumeCode, setResumeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Partial<Omit<SaveSimulationData, 'percentage'>>>({});
  const [isFromResume, setIsFromResume] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Check if user came from a saved simulation
  useEffect(() => {
    const resumeMetadata = localStorage.getItem('resumeMetadata');
    if (resumeMetadata) {
      try {
        const metadata = JSON.parse(resumeMetadata);
        if (metadata.isFromResume && metadata.contactInfo && metadata.simulationId === currentSimulationId) {
          setIsFromResume(true);
          setFormData(metadata.contactInfo);
        }
      } catch (error) {
        console.error('Error parsing resume metadata:', error);
      }
    }
  }, [open, currentSimulationId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<SaveSimulationData, 'percentage'>> = {};

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
        toast({
          title: "Successo!",
          description: "Simulazione salvata con successo!"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore",
          description: result.error || "Errore durante il salvataggio"
        });
      }
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore imprevisto durante il salvataggio"
      });
    }
  };

  const handleCopyCode = async () => {
    if (resumeCode) {
      try {
        await navigator.clipboard.writeText(resumeCode);
        setCopied(true);
        toast({
          title: "Successo!",
          description: "Codice copiato negli appunti!"
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Errore nella copia:', error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile copiare il codice"
        });
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

  const handleInputChange = (field: keyof Omit<SaveSimulationData, 'percentage'>, value: string) => {
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
          <DialogTitle className="text-xl font-medium text-[#245C4F] text-center">
            {resumeCode ? "Simulazione Salvata!" : isFromResume ? "Salva la tua simulazione" : "Salva la tua simulazione"}
          </DialogTitle>
        </DialogHeader>

        {resumeCode ? (
          // Success state - show WhatsApp notification and resume code
          <div className="space-y-4 text-center">
            {/* WhatsApp Notification */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/lovable-uploads/f2895a7f-b3f5-43ac-aed7-c5fe560df948.png" alt="WhatsApp" className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-[#25D366]">WhatsApp</span>
              </div>
              
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">
                  Link di accesso inviato via WhatsApp!
                </div>
                <div className="text-xs text-gray-600">
                  Numero: {formData.phone}
                </div>
              </div>
            </div>

            <div className="text-gray-600 text-sm">
              Puoi anche utilizzare questo codice per riprendere la simulazione in futuro:
            </div>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#245C4F] tracking-wider">
                {resumeCode}
              </div>
            </div>
            
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copiato!" : "Copia codice"}
            </Button>
            
            <div className="text-xs text-gray-500">
              Questo codice è valido per 30 giorni. Conservalo in un posto sicuro!
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Chiudi
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 bg-[#245C4F] hover:bg-[#1e4f44] text-white"
                disabled={isLoading}
              >
                Continua simulazione
              </Button>
            </div>
          </div>
        ) : isFromResume ? (
          // Update mode - just show update button with contact info display
          <div className="space-y-4">
            <div className="text-gray-600 text-sm text-center">
              Aggiorna il tuo salvataggio con le ultime modifiche:
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium text-gray-700">
                <strong>Nome:</strong> {formData.name}
              </div>
              <div className="text-sm font-medium text-gray-700">
                <strong>Telefono:</strong> {formData.phone}
              </div>
              <div className="text-sm font-medium text-gray-700">
                <strong>Email:</strong> {formData.email}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Annulla
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-[#245C4F] hover:bg-[#1e4f44] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Salva"
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Form state - collect user data for new save
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nome e Cognome *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Mario Rossi"
                disabled={isLoading}
                className={`
                  text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] 
                  font-['Inter'] text-[16px] md:text-[16px] font-medium transition-all
                  shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                  hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]
                  ${errors.name ? 'border-red-500' : 'border-[#BEB8AE]'}
                  ${formData.name ? 'border-[#245C4F] bg-gray-50' : 'border-[#BEB8AE]'}
                `}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Numero di telefono *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+39 123 456 7890"
                disabled={isLoading}
                className={`
                  text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] 
                  font-['Inter'] text-[16px] md:text-[16px] font-medium transition-all
                  shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                  hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]
                  ${errors.phone ? 'border-red-500' : 'border-[#BEB8AE]'}
                  ${formData.phone ? 'border-[#245C4F] bg-gray-50' : 'border-[#BEB8AE]'}
                `}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="mario.rossi@email.com"
                disabled={isLoading}
                className={`
                  text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] 
                  font-['Inter'] text-[16px] md:text-[16px] font-medium transition-all
                  shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                  hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]
                  ${errors.email ? 'border-red-500' : 'border-[#BEB8AE]'}
                  ${formData.email ? 'border-[#245C4F] bg-gray-50' : 'border-[#BEB8AE]'}
                `}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#245C4F] hover:bg-[#1e4f44] text-white"
                disabled={isLoading}
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
