
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SaveSimulationData, SaveSimulationResult, getResumeContext } from "@/services/saveSimulationService";
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
    phone: "+39 ",
    email: ""
  });
  const [resumeCode, setResumeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Partial<SaveSimulationData>>({});

  // Pre-populate form with resume context data
  useEffect(() => {
    if (open) {
      const resumeContext = getResumeContext();
      if (resumeContext.contactInfo) {
        console.log("Pre-populating form with resume context:", resumeContext.contactInfo);
        setFormData({
          name: resumeContext.contactInfo.name || "",
          phone: resumeContext.contactInfo.phone || "+39 ",
          email: resumeContext.contactInfo.email || ""
        });
      }
    }
  }, [open]);

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SaveSimulationData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Il nome deve essere di almeno 2 caratteri";
    }

    // Phone validation
    const phoneDigits = formData.phone.replace("+39 ", "").replace(/\s/g, "");
    if (!phoneDigits || phoneDigits.length < 9) {
      newErrors.phone = "Inserisci un numero valido";
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
      const result = await onSave(formData);
      
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
    setFormData({ name: "", phone: "+39 ", email: "" });
    setResumeCode(null);
    setErrors({});
    setCopied(false);
    
    // Close dialog - if we have a resume code, it means save was successful
    onClose(!!resumeCode);
  };

  const handleInputChange = (field: keyof SaveSimulationData, value: string) => {
    if (field === 'phone') {
      // Handle phone number formatting like in FormCompleted
      if (!value.startsWith("+39 ")) {
        if (value === "" || value === "+39") {
          setFormData(prev => ({ ...prev, phone: "+39 " }));
          return;
        }
        const cleanValue = value.replace(/\D/g, "");
        const formatted = formatPhoneNumber(cleanValue);
        setFormData(prev => ({ ...prev, phone: `+39 ${formatted}` }));
        return;
      }
      const phoneDigits = value.slice(4);
      const formatted = formatPhoneNumber(phoneDigits);
      setFormData(prev => ({ ...prev, phone: `+39 ${formatted}` }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phone && formData.phone !== "+39 ") {
      const phoneDigits = formData.phone.replace("+39 ", "").replace(/\s/g, "");
      if (phoneDigits.length < 9) {
        setErrors(prev => ({ ...prev, phone: "Inserisci un numero valido" }));
      }
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
                <li>• Usa il link diretto: <code className="bg-blue-100 px-1 rounded">app.gomutuo.it/riprendi/{resumeCode}</code></li>
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
          // Form state - collect user data with FormCompleted styling
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input - matching FormCompleted design */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Il tuo nome *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Inserisci il tuo nome"
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

            {/* Phone Input - matching FormCompleted design */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Numero di telefono *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="xxx xxx xxx"
                disabled={isLoading}
                className={`
                  text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] 
                  font-['Inter'] text-[16px] md:text-[16px] font-medium transition-all
                  shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                  hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]
                  ${errors.phone ? 'border-red-500' : 'border-[#BEB8AE]'}
                  ${formData.phone && formData.phone !== '+39 ' ? 'border-[#245C4F] bg-gray-50' : 'border-[#BEB8AE]'}
                `}
                inputMode="numeric"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            {/* Email Input - matching FormCompleted design */}
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
