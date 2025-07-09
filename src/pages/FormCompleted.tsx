import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/utils/pdfUtils";
import { useLinkedForm } from "@/hooks/useLinkedForm";

const FormCompleted = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isLinkedForm } = useLinkedForm();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const submissionId = searchParams.get('id');

  // Se è un form linkato, mostra messaggio specifico per CRM
  if (isLinkedForm) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md bg-white border border-[#BEB8AE] shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#245C4F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-[#245C4F]" />
              </div>
              
              <h1 className="text-xl font-medium text-[#245C4F] mb-3 font-['Inter']">
                Simulazione Completata
              </h1>
              
              <p className="text-sm text-gray-600 mb-6 font-['Inter']">
                La tua simulazione è stata inviata con successo. 
                Sarai ricontattato dal nostro team per proseguire con la tua richiesta di mutuo.
              </p>
              
              <div className="bg-[#245C4F]/5 p-4 rounded-lg border border-[#245C4F]/10">
                <p className="text-xs text-gray-500 font-['Inter']">
                  I tuoi dati sono stati trasmessi in sicurezza al nostro sistema CRM.
                  Riceverai aggiornamenti tramite i contatti forniti.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    if (!submissionId) {
      toast({
        title: "Errore",
        description: "ID simulazione non trovato",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generatePDF(submissionId);
      toast({
        title: "PDF generato",
        description: "Il tuo riepilogo simulazione è stato scaricato con successo",
      });
    } catch (error) {
      console.error("Errore nella generazione PDF:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile generare il PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Form normale (non linkato)
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-3xl mx-auto">
          {/* Success notification */}
          <div className="bg-[#245C4F]/10 p-4 rounded-lg mb-6 text-center">
            <h2 className="text-xl font-medium text-[#245C4F] mb-2">
              🎉 Simulazione Completata con Successo!
            </h2>
            <p className="text-sm text-gray-600">
              I tuoi dati sono stati salvati. Puoi scaricare il riepilogo o continuare con una nuova simulazione.
            </p>
          </div>

          <div className="grid gap-4 md:gap-6">
            {/* Download PDF Card */}
            <Card className="bg-white border border-[#BEB8AE] shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 font-['Inter']">
                      Scarica il tuo riepilogo
                    </h3>
                    <p className="text-sm text-gray-500 font-['Inter']">
                      Ottieni un PDF dettagliato della tua simulazione
                    </p>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-4 py-2 rounded-lg shadow-[0_3px_0_0_#1a453e] hover:shadow-[0_3px_4px_rgba(26,69,62,0.25)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                  >
                    {isGeneratingPDF ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Start New Simulation Card */}
            <Card className="bg-white border border-[#BEB8AE] shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 font-['Inter']">
                      Nuova simulazione
                    </h3>
                    <p className="text-sm text-gray-500 font-['Inter']">
                      Confronta scenari diversi con una nuova simulazione
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/simulazione-avanzata')}
                    variant="outline"
                    className="border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Home Card */}
            <Card className="bg-white border border-[#BEB8AE] shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 font-['Inter']">
                      Torna alla home
                    </h3>
                    <p className="text-sm text-gray-500 font-['Inter']">
                      Scopri tutti i servizi disponibili
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-gray-700 hover:bg-transparent hover:text-[#00853E] px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormCompleted;
