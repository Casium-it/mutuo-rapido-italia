import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ArrowRight, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { validatePhoneNumber } from "@/utils/validationUtils";
import { toast } from "sonner";
import { updateSubmissionWithContact } from "@/services/contactSubmissionService";
import { trackSimulationContactDetails, trackSimulationLostDetails } from "@/utils/analytics";
import { PrivacyPolicyDialog } from "@/components/PrivacyPolicyDialog";
export default function FormCompleted() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageStartTimeRef = useRef<number>(Date.now());
  const hasSubmittedRef = useRef<boolean>(false);

  // Form state for WhatsApp contact
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+39 ");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [consultationRequest, setConsultationRequest] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [privacyError, setPrivacyError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // New state for privacy policy dialog
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const submissionData = location.state?.submissionData;
  useEffect(() => {
    console.log("FormCompleted submissionData:", submissionData);
    console.log("Location state:", location.state);
    if (!submissionData) {
      console.log("No submission data found, redirecting to home");
      navigate("/");
      return;
    }
    console.log("Submission ID from submissionData.submissionId:", submissionData.submissionId);
    console.log("Submission ID from submissionData.id:", submissionData.id);
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
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
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
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (phoneError) {
      setPhoneError("");
    }
    if (!value.startsWith("+39 ")) {
      if (value === "" || value === "+39") {
        setPhoneNumber("+39 ");
        return;
      }
      const cleanValue = value.replace(/\D/g, "");
      const formatted = formatPhoneNumber(cleanValue);
      setPhoneNumber(`+39 ${formatted}`);
      return;
    }
    const phoneDigits = value.slice(4);
    const formatted = formatPhoneNumber(phoneDigits);
    setPhoneNumber(`+39 ${formatted}`);
  };
  const handlePhoneBlur = () => {
    if (phoneNumber && phoneNumber !== "+39 ") {
      const phoneDigits = phoneNumber.replace("+39 ", "").replace(/\s/g, "");
      if (!validatePhoneNumber(phoneDigits)) {
        setPhoneError("Inserisci un numero valido");
      }
    }
  };
  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstNameError("");
    setPhoneError("");
    setPrivacyError("");
    let hasErrors = false;
    if (firstName.trim().length === 0) {
      setFirstNameError("Il nome è obbligatorio");
      hasErrors = true;
    } else if (firstName.trim().length < 2) {
      setFirstNameError("Il nome deve essere di almeno 2 caratteri");
      hasErrors = true;
    }
    const phoneDigits = phoneNumber.replace("+39 ", "").replace(/\s/g, "");
    if (!validatePhoneNumber(phoneDigits)) {
      setPhoneError("Inserisci un numero valido");
      hasErrors = true;
    }
    if (!privacyConsent) {
      setPrivacyError("Devi accettare la privacy policy per continuare");
      toast.error("Devi accettare la privacy policy per continuare");
      hasErrors = true;
    }
    if (hasErrors) {
      return;
    }
    setShowConfirmDialog(true);
  };
  const handleConfirmedSubmission = async () => {
    setShowConfirmDialog(false);
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
      const result = await updateSubmissionWithContact(submissionId, firstName.trim(), phoneNumber, consultationRequest);
      if (result.success) {
        hasSubmittedRef.current = true;
        const timeSpentOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        trackSimulationContactDetails(timeSpentOnPage, consultationRequest);
        let successMessage = "Riceverai presto i risultati su WhatsApp";
        if (result.timing) {
          successMessage += ` (completato in ${result.timing.total}ms)`;
        }
        toast.success("Perfetto!", {
          description: successMessage
        });
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else if (result.expired) {
        toast.error("Sessione scaduta", {
          description: result.error || "La tua sessione è scaduta. Ricompila il form."
        });
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
  const isNameValid = firstName.trim().length >= 2;
  const phoneDigits = phoneNumber.replace("+39 ", "").replace(/\s/g, "");
  const isPhoneValid = phoneDigits.length > 0 && validatePhoneNumber(phoneDigits);
  if (!submissionData) {
    return null;
  }
  return <div className="min-h-screen flex flex-col bg-[#fff8ef]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-3xl mx-auto w-full">
        {/* WhatsApp Contact Card */}
        <div className="bg-white rounded-[12px] border border-[#BEB8AE] shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all p-8 mb-8 py-[20px] px-[21px]">
          <div className="text-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">
              Simulazione pronta, ricevila ora su WhatsApp 
              <img src="/lovable-uploads/f2895a7f-b3f5-43ac-aed7-c5fe560df948.png" alt="WhatsApp" className="inline-block w-6 h-6 ml-2" />
            </h1>
            <p className="text-sm text-gray-600 mb-2">Abbiamo confrontato più di 109 banche ed offerte di mutui. </p>
            
            {/* Rating display for confidence */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>)}
              </div>
              <span className="text-sm font-medium text-gray-700">4.8/5 - 872 recensioni</span>
            </div>
          </div>

          <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
            {/* First Name Input */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Il tuo nome
              </Label>
              <Input id="firstName" type="text" placeholder="Inserisci il tuo nome" value={firstName} onChange={handleFirstNameChange} onBlur={handleFirstNameBlur} className={`
                  text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] 
                  font-['Inter'] text-[16px] md:text-[16px] font-medium transition-all
                  shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                  hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]
                  ${firstNameError ? 'border-red-500' : 'border-[#BEB8AE]'}
                  ${firstName ? 'border-[#245C4F] bg-gray-50' : 'border-[#BEB8AE]'}
                `} />
              {firstNameError && <p className="text-red-500 text-sm">{firstNameError}</p>}
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Numero di telefono
              </Label>
              <Input id="phone" type="tel" placeholder="xxx xxx xxx" value={phoneNumber} onChange={handlePhoneChange} onBlur={handlePhoneBlur} className={`
                  text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] 
                  font-['Inter'] text-[16px] md:text-[16px] font-medium transition-all
                  shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                  hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]
                  ${phoneError ? 'border-red-500' : 'border-[#BEB8AE]'}
                  ${phoneNumber && phoneNumber !== '+39 ' ? 'border-[#245C4F] bg-gray-50' : 'border-[#BEB8AE]'}
                `} inputMode="numeric" />
              {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
            </div>

            {/* Consultation Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox id="consultation" checked={consultationRequest} onCheckedChange={checked => setConsultationRequest(checked as boolean)} className="h-5 w-5 border-2 border-[#245C4F] data-[state=checked]:bg-[#245C4F] data-[state=checked]:border-[#245C4F] rounded-md shadow-[0_2px_0_0_#1a453b] flex-shrink-0 mt-0.5" />
              <div>
                <Label htmlFor="consultation" className="text-sm font-medium text-gray-700 cursor-pointer leading-relaxed">
                  Aggiungi prima consulenza gratuita
                </Label>
                <p className="text-xs text-gray-500 mt-1">Consulenza telefonica senza impegno con uno dei nostri esperti di mutui</p>
              </div>
            </div>

            {/* Privacy Policy Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox id="privacy" checked={privacyConsent} onCheckedChange={checked => {
              setPrivacyConsent(checked as boolean);
              if (privacyError && checked) {
                setPrivacyError("");
              }
            }} className="h-5 w-5 border-2 border-[#245C4F] data-[state=checked]:bg-[#245C4F] data-[state=checked]:border-[#245C4F] rounded-md shadow-[0_2px_0_0_#1a453b] flex-shrink-0 mt-0.5" />
              <Label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                Ho preso visione e accetto la{' '}
                <button type="button" onClick={() => setShowPrivacyDialog(true)} className="text-[#245C4F] underline hover:text-[#1a453b] font-medium">
                  privacy policy
                </button>.
              </Label>
            </div>
            {privacyError && <p className="text-red-500 text-sm">{privacyError}</p>}

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className={`
                w-full px-[32px] py-[14px] border-[1.5px] rounded-[10px] 
                font-['Inter'] text-[17px] font-medium transition-all
                shadow-[0_3px_0_0_#1a453e] mb-[10px]
                hover:shadow-[0_3px_4px_rgba(36,92,79,0.25)]
                active:shadow-[0_1px_0_0_#1a453e] active:translate-y-[2px]
                inline-flex items-center justify-center gap-[12px]
                bg-[#245C4F] text-white border-[#245C4F]
                cursor-pointer hover:bg-[#1e4f44]
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
              {isSubmitting ? "Invio in corso..." : <>
                  Ricevi su WhatsApp
                  <ArrowRight className="h-5 w-5" />
                </>}
            </button>
          </form>
        </div>
      </main>

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
              <User className="h-6 w-7 text-[#245C4F] mr-2 rounded-none" />
              <span className="text-lg font-bold text-[#245C4F]">
                {firstName}
              </span>
            </div>
            <div className="flex items-center justify-center bg-[#F8F4EF] px-4 py-3 rounded-lg border-2 border-[#245C4F]">
              <img src="/lovable-uploads/f2895a7f-b3f5-43ac-aed7-c5fe560df948.png" alt="WhatsApp" className="h-8 w-8 mr-2" />
              <span className="text-lg font-bold text-[#245C4F]">
                {phoneNumber}
              </span>
            </div>
          </div>
          
          <AlertDialogFooter className="!flex !flex-col !items-center !justify-center gap-3 sm:!flex-row sm:!justify-center sm:gap-4">
            <AlertDialogCancel className="w-full max-w-[200px] sm:w-auto order-2 sm:order-1 border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white">
              Modifica dati
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmission} className="w-full max-w-[200px] sm:w-auto bg-[#245C4F] hover:bg-[#1e4f44] text-white order-1 sm:order-2">
              Conferma e invia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Privacy Policy Dialog */}
      <PrivacyPolicyDialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog} />

      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoMutuo. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>;
}