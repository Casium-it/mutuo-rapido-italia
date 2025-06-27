import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { validatePhoneNumber } from "@/utils/validationUtils";
import { toast } from "sonner";
import { updateSubmissionWithContact } from "@/services/contactSubmissionService";
import { sendAisensyMessage } from "@/services/aisensyService";
import { trackSimulationContactDetails, trackSimulationLostDetails } from "@/utils/analytics";

export default function FormCompleted() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keySummary, setKeySummary] = useState<Record<string, any>>({});
  const pageStartTimeRef = useRef<number>(Date.now());
  const hasSubmittedRef = useRef<boolean>(false);

  // Form state for WhatsApp contact
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [consultationRequest, setConsultationRequest] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  
  // New state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Controlla se l'utente è arrivato a questa pagina dopo aver completato il form
  const submissionData = location.state?.submissionData;
  
  useEffect(() => {
    // Debug: log what submissionData contains
    console.log("FormCompleted submissionData:", submissionData);
    console.log("Location state:", location.state);
    
    // Se l'utente accede direttamente senza aver completato un form, reindirizza alla home
    if (!submissionData) {
      console.log("No submission data found, redirecting to home");
      navigate("/");
      return;
    }

    // Debug: log the submission ID specifically
    console.log("Submission ID from submissionData.submissionId:", submissionData.submissionId);
    console.log("Submission ID from submissionData.id:", submissionData.id);

    // Track lost details on page exit
    const handleBeforeUnload = () => {
      if (!hasSubmittedRef.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        trackSimulationLostDetails('page_close', timeOnPage);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmittedRef.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        trackSimulationLostDetails('tab_close', timeOnPage);
      }
    };

    const handlePopState = () => {
      if (!hasSubmittedRef.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        trackSimulationLostDetails('navigate', timeOnPage);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [submissionData, navigate, location.state]);

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Apply formatting: first 3 digits, space, then the rest
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
      // Limit to 10 digits total
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 10)}`;
    }
  };

  // First name validation and handling
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
    
    // Clear error when user starts typing
    if (firstNameError) {
      setFirstNameError("");
    }
  };

  const handleFirstNameBlur = () => {
    if (firstName.trim().length === 0) {
      setFirstNameError("Il nome è obbligatorio");
    } else if (firstName.trim().length < 2) {
      setFirstNameError("Il nome deve essere di almeno 2 caratteri");
    }
  };

  // Phone number validation and formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear error when user starts typing again
    if (phoneError) {
      setPhoneError("");
    }

    // If user starts typing and hasn't started before, add +39 prefix
    if (!hasStartedTyping && value.length > 0) {
      setHasStartedTyping(true);
      const cleanValue = value.replace(/\D/g, "");
      const formatted = formatPhoneNumber(cleanValue);
      setPhoneNumber(`+39 ${formatted}`);
      return;
    }

    // Only allow digits, spaces, and + for the prefix
    if (!/^[\d\s+]*$/.test(value)) {
      return;
    }

    // Handle the +39 prefix
    if (value.startsWith("+39 ")) {
      const phoneDigits = value.slice(4); // Remove "+39 "
      const formatted = formatPhoneNumber(phoneDigits);
      setPhoneNumber(`+39 ${formatted}`);
    } else if (value === "") {
      setPhoneNumber("");
      setHasStartedTyping(false);
    }
  };

  // Handle blur event for validation
  const handlePhoneBlur = () => {
    if (phoneNumber) {
      // Extract just the phone number without +39 prefix
      const phoneDigits = phoneNumber.replace("+39 ", "").replace(/\s/g, "");
      if (!validatePhoneNumber(phoneDigits)) {
        setPhoneError("Inserisci un numero valido");
      }
    }
  };

  // Form submission
  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (firstName.trim().length === 0) {
      setFirstNameError("Il nome è obbligatorio");
      return;
    }
    if (firstName.trim().length < 2) {
      setFirstNameError("Il nome deve essere di almeno 2 caratteri");
      return;
    }
    
    // Extract just the phone number without +39 prefix
    const phoneDigits = phoneNumber.replace("+39 ", "").replace(/\s/g, "");
    if (!validatePhoneNumber(phoneDigits)) {
      setPhoneError("Inserisci un numero valido");
      return;
    }
    
    if (!privacyConsent) {
      toast.error("Devi accettare la privacy policy per continuare");
      return;
    }

    // Show confirmation dialog instead of submitting directly
    setShowConfirmDialog(true);
  };

  // New function to handle confirmed submission
  const handleConfirmedSubmission = async () => {
    setShowConfirmDialog(false);
    
    // Get the correct submission ID - try submissionId first, then id
    const submissionId = submissionData.submissionId || submissionData.id;
    
    console.log("Using submission ID:", submissionId);
    console.log("First name to submit:", firstName);
    console.log("Phone number to submit:", phoneNumber);
    console.log("Consultation request:", consultationRequest);
    
    if (!submissionId) {
      console.error("No submission ID found in submissionData:", submissionData);
      toast.error("Errore: ID della submission non trovato");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await updateSubmissionWithContact(
        submissionId,
        firstName.trim(),
        phoneNumber,
        consultationRequest
      );

      if (result.success) {
        // Mark as submitted to prevent lost details tracking
        hasSubmittedRef.current = true;
        
        // Calculate time spent on this page and track the contact details submission
        const timeSpentOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        trackSimulationContactDetails(timeSpentOnPage, consultationRequest);
        
        // Send WhatsApp message via AiSensy (non-blocking)
        console.log("Sending WhatsApp message via AiSensy...");
        sendAisensyMessage(firstName.trim(), phoneNumber).then((aisensyResult) => {
          if (aisensyResult.success) {
            console.log("WhatsApp message sent successfully via AiSensy");
          } else {
            console.error("Failed to send WhatsApp message via AiSensy:", aisensyResult.error);
            // We don't show this error to the user as it shouldn't block their flow
          }
        }).catch((error) => {
          console.error("Error sending WhatsApp message via AiSensy:", error);
          // We don't show this error to the user as it shouldn't block their flow
        });
        
        toast.success("Perfetto!", {
          description: "Riceverai presto i risultati su WhatsApp"
        });

        // Naviga alla home page dopo il successo
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else if (result.expired) {
        // Handle expired submission
        toast.error("Sessione scaduta", {
          description: result.error || "La tua sessione è scaduta. Ricompila il form."
        });
        
        // Redirect to home after showing error
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        throw new Error(result.error || "Errore sconosciuto");
      }
    } catch (error) {
      console.error("Error submitting WhatsApp form:", error);
      toast.error("Errore durante l'invio", {
        description: "Riprova più tardi"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation functions
  const isNameValid = firstName.trim().length >= 2;
  const phoneDigits = phoneNumber.replace("+39 ", "").replace(/\s/g, "");
  const isPhoneValid = validatePhoneNumber(phoneDigits);
  const isFormValid = isNameValid && isPhoneValid && privacyConsent;
  
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simulazione pronta!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Abbiamo confrontato più di 123 banche ed offerte di mutui e abbiamo elaborato la simulazione perfetta seguendo tutte le tue caratteristiche.</p>
        </div>

        {/* WhatsApp Contact Form */}
        <div className="w-full max-w-md mb-8">
          <div className="bg-[#F8F4EF] p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Ricevi subito il risultato della tua simulazione su WhatsApp
              </h2>
            </div>

            <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
              {/* First Name Input */}
              <div className="space-y-2">
                <Input 
                  id="firstName" 
                  type="text" 
                  placeholder="Il tuo nome" 
                  value={firstName} 
                  onChange={handleFirstNameChange} 
                  onBlur={handleFirstNameBlur} 
                  className={`
                    text-left px-[18px] py-[18px] border-[1.5px] rounded-[10px] 
                    font-['Inter'] text-[19px] md:text-[19px] font-bold transition-all
                    shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                    hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                    focus-visible:outline-none focus-visible:ring-0 focus-visible:border-black
                    ${firstNameError ? 'border-red-500' : 'border-[#BEB8AE]'}
                    ${firstName ? 'border-black bg-gray-50' : 'border-[#BEB8AE]'}
                  `} 
                />
                {firstNameError && <p className="text-red-500 text-sm">{firstNameError}</p>}
              </div>

              {/* Phone Number Input */}
              <div className="space-y-2">
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Il tuo numero di telefono" 
                  value={phoneNumber} 
                  onChange={handlePhoneChange} 
                  onBlur={handlePhoneBlur} 
                  className={`
                    text-left px-[18px] py-[18px] border-[1.5px] rounded-[10px] 
                    font-['Inter'] text-[19px] md:text-[19px] font-bold transition-all
                    shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                    hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                    focus-visible:outline-none focus-visible:ring-0 focus-visible:border-black
                    ${phoneError ? 'border-red-500' : 'border-[#BEB8AE]'}
                    ${phoneNumber ? 'border-black bg-gray-50' : 'border-[#BEB8AE]'}
                  `} 
                  inputMode="numeric" 
                />
                {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
              </div>

              {/* Consultation Checkbox */}
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="consultation" 
                  checked={consultationRequest} 
                  onCheckedChange={(checked) => setConsultationRequest(checked as boolean)} 
                  className="h-5 w-5 border-2 border-[#245C4F] data-[state=checked]:bg-[#245C4F] data-[state=checked]:border-[#245C4F] rounded-md shadow-[0_2px_0_0_#1a453b] flex-shrink-0" 
                />
                <Label htmlFor="consultation" className="text-sm text-gray-600 cursor-pointer">
                  Aggiungi prima consulenza gratuita e senza impegno con uno dei nostri esperti di mutui.
                </Label>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="privacy" 
                  checked={privacyConsent} 
                  onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)} 
                  className="h-5 w-5 border-2 border-[#245C4F] data-[state=checked]:bg-[#245C4F] data-[state=checked]:border-[#245C4F] rounded-md shadow-[0_2px_0_0_#1a453b] flex-shrink-0" 
                />
                <Label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  Ho preso visione e accetto la <Link to="/privacy" className="text-[#245C4F] underline hover:text-[#1a453b]">privacy policy</Link>.
                </Label>
              </div>

              {/* Submit Button with 3D effect */}
              <button 
                type="submit" 
                disabled={!isFormValid || isSubmitting} 
                className={`
                  w-full px-[32px] py-[16px] border-[1.5px] rounded-[10px] 
                  font-['Inter'] text-[17px] font-medium transition-all
                  shadow-[0_3px_0_0_rgba(36,92,79,0.3)] mb-[10px]
                  hover:shadow-[0_3px_4px_rgba(36,92,79,0.25)]
                  active:shadow-[0_1px_0_0_rgba(36,92,79,0.3)] active:translate-y-[2px]
                  inline-flex items-center justify-center gap-[12px]
                  ${isFormValid && !isSubmitting 
                    ? 'bg-[#245C4F] text-white border-[#245C4F] cursor-pointer hover:bg-[#1e4f44]' 
                    : 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'}
                `}
              >
                {isSubmitting ? "Invio in corso..." : (
                  <>
                    Ricevi su WhatsApp
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="w-[calc(100vw-3rem)] max-w-sm mx-auto sm:max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl font-bold text-gray-900">
              Conferma i tuoi dati
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 mt-4">
              Stai per inviare la simulazione a:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-6 space-y-3">
            <div className="flex items-center justify-center bg-[#F8F4EF] px-4 py-3 rounded-lg border-2 border-[#245C4F]">
              <User className="h-5 w-5 text-[#245C4F] mr-2" />
              <span className="text-lg font-bold text-[#245C4F]">
                {firstName}
              </span>
            </div>
            <div className="flex items-center justify-center bg-[#F8F4EF] px-4 py-3 rounded-lg border-2 border-[#245C4F]">
              <Phone className="h-5 w-5 text-[#245C4F] mr-2" />
              <span className="text-lg font-bold text-[#245C4F]">
                {phoneNumber}
              </span>
            </div>
          </div>
          
          <AlertDialogFooter className="!flex !flex-col !items-center !justify-center gap-3 sm:!flex-row sm:!justify-center sm:gap-4">
            <AlertDialogCancel className="w-full max-w-[200px] sm:w-auto order-2 sm:order-1 border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white">
              Modifica dati
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedSubmission}
              className="w-full max-w-[200px] sm:w-auto bg-[#245C4F] hover:bg-[#1e4f44] text-white order-1 sm:order-2"
            >
              Conferma e invia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoMutuo. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
