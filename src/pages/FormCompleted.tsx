
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FormCompleted() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Controlla se l'utente è arrivato a questa pagina dopo aver completato il form
  const submissionData = location.state?.submissionData;
  
  useEffect(() => {
    // Se l'utente accede direttamente senza aver completato un form, reindirizza alla home
    if (!submissionData) {
      navigate("/");
    }
  }, [submissionData, navigate]);

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
            Abbiamo ricevuto la tua richiesta e ti contatteremo presto con una proposta personalizzata per il tuo mutuo.
          </p>
        </div>

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
