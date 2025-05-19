
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

export default function StopFlow() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    // Navigate back to the previous page
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <div className="flex items-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              Ci dispiace, ma al momento...
            </h1>
            <p className="text-gray-600 text-lg">
              Il nostro sistema non supporta ancora la tua situazione specifica, ma ci stiamo lavorando!
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              variant="default"
              size="lg"
              className="w-full md:w-auto bg-[#245C4F] hover:bg-[#1e4f44] px-8"
              asChild
            >
              <Link to="/simulazione-avanzata">
                Inizia una nuova simulazione
              </Link>
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="w-full md:w-auto border-gray-300 text-gray-700"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla domanda precedente
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="w-full md:w-auto border-gray-300 text-gray-700"
              asChild
            >
              <a href="mailto:contattaci@gomutuo.it" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Contattaci
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
