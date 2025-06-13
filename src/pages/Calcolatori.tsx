
import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Star, MapPin, CheckCircle, ArrowRight, Users, Award } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const Calcolatori = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/393518681491', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff7f0]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 relative flex items-center z-10">
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <Logo />
        </div>
        
        {/* Absolutely centered navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate("/simulazioni")}>
            Simulazioni
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={handleWhatsAppContact}>
            Contattaci
          </Button>
        </div>
        
        {/* CTA Button */}
        <div className="ml-auto">
          <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-full px-6" onClick={() => navigate("/simulazioni")}>
            Simulazione
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-6xl mx-auto w-full flex flex-col justify-center relative z-10">
        {/* Background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#F0EAE0] to-[#E8F5E9] rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-[#E8F5E9] to-[#F0EAE0] rounded-full blur-3xl opacity-20 animate-float-rotate"></div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          {/* Main Value Proposition */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block mb-2">Cerca, confronta</span>
              <span className="block">e richiedi il <span className="relative">
                <span className="gradient-text">mutuo</span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[#d3f54f] rounded-full opacity-80"></div>
              </span></span>
            </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-xl md:text-2xl font-semibold text-[#245C4F] mb-8">
              <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span>Veloce</span>
              </div>
              <div className="hidden md:block w-2 h-2 bg-[#245C4F] rounded-full opacity-50"></div>
              <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span>Online</span>
              </div>
              <div className="hidden md:block w-2 h-2 bg-[#245C4F] rounded-full opacity-50"></div>
              <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span>100% Gratuito</span>
              </div>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8">
              {/* Star Rating */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-2xl font-bold text-gray-900">4.89</span>
                </div>
                <p className="text-gray-600 font-medium">
                  <span className="font-bold">857</span> recensioni verificate
                </p>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-[#BEB8AE] shadow-lg">
                <Award className="w-8 h-8 text-[#245C4F]" />
                <div className="text-left">
                  <p className="font-bold text-[#245C4F] text-lg">La prima vera</p>
                  <p className="font-bold text-[#245C4F] text-lg">simulazione precisa</p>
                </div>
              </div>
            </div>

            {/* Location Promise */}
            <div className="flex items-center justify-center gap-3 text-lg text-gray-700 mb-8">
              <MapPin className="w-6 h-6 text-[#245C4F]" />
              <span className="font-medium">Ti troviamo il migliore mediatore creditizio vicino a te</span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '1s' }}>
            <Button 
              className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-12 py-6 text-xl font-semibold rounded-[16px] shadow-[0_6px_0_0_#1a3f37] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#1a3f37] transition-all relative overflow-hidden group animate-glow"
              onClick={() => navigate("/simulazioni")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center gap-3">
                Inizia la tua simulazione
                <ArrowRight className="w-6 h-6" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              className="text-[#245C4F] hover:bg-[#F8F4EF] border-2 border-[#245C4F] hover:border-[#1e4f44] px-8 py-6 text-lg font-medium rounded-[16px] transition-all backdrop-blur-sm bg-white/50"
              onClick={handleWhatsAppContact}
            >
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Parla con un esperto
              </span>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Nessun impegno</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>100% sicuro e gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Risultati in 3 minuti</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE] relative z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/privacy")}
              className="text-sm text-gray-600 hover:text-[#245C4F]"
            >
              Privacy
            </button>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calcolatori;
