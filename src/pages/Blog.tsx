import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginButton } from "@/components/LoginButton";

const Blog = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f2]">
      {/* Header fisso */}
      <header className="fixed top-0 left-0 right-0 bg-[#f7f5f2]/95 backdrop-blur-sm z-50 py-6 px-4 md:px-6 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <div className="cursor-pointer flex items-center" onClick={() => navigate("/")}>
          <Logo />
        </div>
        
        {/* Desktop only navigation - centered */}
        {!isMobile && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate('/simulazioni')}>
              Simulazione
            </Button>
            <Button variant="ghost" className="text-[#00853E] hover:bg-transparent hover:text-[#00853E]">
              Blog
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate('/chi-siamo')}>
              Chi Siamo
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => window.open('https://wa.me/393518681491', '_blank')}>
              Contatti
            </Button>
          </div>
        )}
        
        {/* CTA Button */}
        <div className="flex items-center">
          <Button 
            className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[12px] px-6 shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all" 
            onClick={() => navigate('/simulazioni')}
          >
            Simulazione
          </Button>
        </div>
      </header>

      {/* Spacer per compensare l'header fisso */}
      <div className="h-24"></div>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#245C4F]">
            Blog GoMutuo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Consigli, guide e approfondimenti sul mondo dei mutui per aiutarti a prendere le decisioni migliori
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-[#245C4F] to-[#1e4f44]"></div>
            <div className="p-6">
              <span className="text-sm text-[#245C4F] font-medium">Guide</span>
              <h2 className="text-xl font-bold mt-2 mb-3">Come scegliere il mutuo giusto per te</h2>
              <p className="text-gray-600 mb-4">Una guida completa per orientarsi tra le diverse tipologie di mutuo e trovare quello più adatto alle tue esigenze.</p>
              <span className="text-sm text-gray-500">15 gennaio 2025</span>
            </div>
          </article>

          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-[#ddf574] to-[#c9e65a]"></div>
            <div className="p-6">
              <span className="text-sm text-[#245C4F] font-medium">Mercato</span>
              <h2 className="text-xl font-bold mt-2 mb-3">Tassi mutui 2025: previsioni e andamenti</h2>
              <p className="text-gray-600 mb-4">Analisi dell'andamento dei tassi di interesse e previsioni per il mercato dei mutui nel 2025.</p>
              <span className="text-sm text-gray-500">10 gennaio 2025</span>
            </div>
          </article>

          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-[#f8f5f2] to-[#ebe8e3]"></div>
            <div className="p-6">
              <span className="text-sm text-[#245C4F] font-medium">Consigli</span>
              <h2 className="text-xl font-bold mt-2 mb-3">Surroga del mutuo: quando conviene</h2>
              <p className="text-gray-600 mb-4">Tutto quello che devi sapere sulla surroga del mutuo e come valutare se è vantaggiosa per te.</p>
              <span className="text-sm text-gray-500">5 gennaio 2025</span>
            </div>
          </article>

          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-[#245C4F]/20 to-[#1e4f44]/20"></div>
            <div className="p-6">
              <span className="text-sm text-[#245C4F] font-medium">FAQ</span>
              <h2 className="text-xl font-bold mt-2 mb-3">Domande frequenti sui mutui</h2>
              <p className="text-gray-600 mb-4">Le risposte alle domande più comuni sui mutui, dalla richiesta all'erogazione.</p>
              <span className="text-sm text-gray-500">1 gennaio 2025</span>
            </div>
          </article>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-4 text-[#245C4F]">Hai bisogno di una consulenza personalizzata?</h3>
          <p className="text-gray-600 mb-6">I nostri esperti sono pronti ad aiutarti a trovare il mutuo perfetto per le tue esigenze</p>
          <Button 
            className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all"
            onClick={() => navigate('/simulazioni')}
          >
            Simula il tuo mutuo
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE]">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 GoMutuo - Tutti i diritti riservati</p>
          <div className="flex gap-4 items-center">
            <button onClick={() => navigate("/privacy")} className="text-sm text-gray-600 hover:text-[#245C4F]">
              Privacy
            </button>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
            <LoginButton />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;