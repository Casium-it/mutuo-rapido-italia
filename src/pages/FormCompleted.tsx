
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { validatePhoneNumber } from "@/utils/validationUtils";
import { toast } from "sonner";

export default function FormCompleted() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keySummary, setKeySummary] = useState<Record<string, any>>({});
  
  // Form state for WhatsApp contact
  const [phoneNumber, setPhoneNumber] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [consultationRequest, setConsultationRequest] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controlla se l'utente è arrivato a questa pagina dopo aver completato il form
  const submissionData = location.state?.submissionData;
  
  useEffect(() => {
    // Se l'utente accede direttamente senza aver completato un form, reindirizza alla home
    if (!submissionData) {
      navigate("/");
      return;
    }
  }, [submissionData, navigate]);

  // Phone number validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    if (value && !validatePhoneNumber(value)) {
      setPhoneError("Inserisci un numero di telefono valido (10 cifre)");
    } else {
      setPhoneError("");
    }
  };

  // Form submission
  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("Inserisci un numero di telefono valido (10 cifre)");
      return;
    }
    
    if (!privacyConsent) {
      toast.error("Devi accettare la privacy policy per continuare");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your backend
      console.log("WhatsApp form submitted:", {
        phone: phoneNumber,
        privacyConsent,
        consultationRequest,
        submissionId: submissionData?.submissionId
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Perfetto!", {
        description: "Riceverai presto i risultati su WhatsApp"
      });
      
      // Reset form
      setPhoneNumber("");
      setPrivacyConsent(false);
      setConsultationRequest(false);
      
    } catch (error) {
      console.error("Error submitting WhatsApp form:", error);
      toast.error("Errore durante l'invio", {
        description: "Riprova più tardi"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = validatePhoneNumber(phoneNumber) && privacyConsent;

  if (!submissionData) {
    return null; // Non mostrare nulla durante il reindirizzamento
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-[#245C4F]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Grazie per aver completato il form!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Abbiamo ricevuto la tue informazioni e abbiamo elaborato una simulazione completa del tuo mutuo personalizzata per te.
          </p>
        </div>

        {/* WhatsApp Contact Form */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-[#F8F4EF] p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <Phone className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Inserisci il tuo numero e ricevi subito su WhatsApp il risultato della tua simulazione
              </h2>
            </div>

            <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg font-medium text-gray-700">
                  Il tuo numero di telefono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="telefono"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`
                    text-left px-[18px] py-[16px] border-[1.5px] rounded-[10px] 
                    font-['Inter'] text-[16px] font-normal transition-all
                    shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                    hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                    focus-visible:outline-none focus-visible:ring-0 focus-visible:border-black
                    ${phoneError ? 'border-red-500' : 'border-[#BEB8AE]'}
                    ${phoneNumber ? 'border-black bg-gray-50' : 'border-[#BEB8AE]'}
                  `}
                  maxLength={10}
                />
                {phoneError && (
                  <p className="text-red-500 text-sm">{phoneError}</p>
                )}
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={privacyConsent}
                  onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  Accetto la <Link to="/privacy" className="text-[#245C4F] underline hover:text-[#1a453b]">privacy policy</Link> e 
                  autorizzo il trattamento dei miei dati personali per ricevere comunicazioni commerciali
                </Label>
              </div>

              {/* Consultation Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consultation"
                  checked={consultationRequest}
                  onCheckedChange={(checked) => setConsultationRequest(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="consultation" className="text-sm text-gray-600 leading-relaxed cursor-pointer flex items-center gap-2">
                  Aggiungi consulenza telefonica gratuita di un esperto di GoMutuo
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    GRATIS
                  </span>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-[#245C4F] hover:bg-[#1a453b] text-white py-3 text-lg font-medium"
              >
                {isSubmitting ? (
                  "Invio in corso..."
                ) : (
                  <>
                    Ricevi su WhatsApp
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Cosa succede adesso */}
        <div className="bg-[#F8F4EF] p-6 rounded-lg shadow-sm w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cosa succede adesso?
          </h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[#245C4F] text-white h-6 w-6 rounded-full flex items-center justify-center mt-0.5">
                1
              </div>
              <div>
                <span className="font-medium">Analisi della tua richiesta</span>
                <p className="text-gray-600 mt-1">
                  Il nostro team analizzerà le informazioni fornite per trovare le migliori opzioni di mutuo per te.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[#245C4F] text-white h-6 w-6 rounded-full flex items-center justify-center mt-0.5">
                2
              </div>
              <div>
                <span className="font-medium">Contatto iniziale</span>
                <p className="text-gray-600 mt-1">
                  Ti contatteremo entro 24-48 ore lavorative per discutere le opzioni disponibili.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[#245C4F] text-white h-6 w-6 rounded-full flex items-center justify-center mt-0.5">
                3
              </div>
              <div>
                <span className="font-medium">Proposta personalizzata</span>
                <p className="text-gray-600 mt-1">
                  Riceverai una proposta su misura basata sulle tue esigenze specifiche.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button 
            className="bg-[#245C4F] hover:bg-[#1a453b] text-white py-2.5 px-6 rounded-md flex-1" 
            onClick={() => navigate("/")}
          >
            Torna alla home <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoMutuo. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
