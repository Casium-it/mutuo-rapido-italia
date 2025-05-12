
import React from "react";
import { Logo } from "@/components/Logo";
import { PathOption } from "@/components/PathOption";
import { Clock, Percent, Building2, Sparkles, Calculator, Check, File } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  const simpleKeyPoints = [
    { icon: Clock, text: "minuti per completare", highlight: "3" },
    { icon: Building2, text: "banche, offerte e condizioni confrontate", highlight: "48" },
    { icon: Percent, text: "di precisione", highlight: "68%" },
    { icon: Calculator, text: "Solo calcolatore fattibilità mutuo" },
  ];

  const advancedKeyPoints = [
    { icon: Clock, text: "minuti per completare", highlight: "11" },
    { icon: Building2, text: "banche, offerte e condizioni confrontate", highlight: "122" },
    { icon: Percent, text: "di precisione (il migliore in Italia!)", highlight: "98%" },
    { icon: Check, text: "Ottieni il tuo mutuo 100% online" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 px-4">
        <Logo />
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            <span className="gradient-text">Trova il Mutuo Perfetto</span> Per Te
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Scegli il percorso più adatto alle tue esigenze
          </p>
        </div>

        {/* Background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-vibe-yellow-fluo to-vibe-green rounded-full blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-vibe-green to-vibe-green-vivid rounded-full blur-3xl opacity-10 animate-float-rotate"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch max-w-3xl mx-auto">
          {/* Simulazione Veloce */}
          <PathOption 
            title="Simulazione Veloce"
            description="Analisi rapida prefattibilità mutuo"
            keyPoints={simpleKeyPoints}
            ctaLabel="Inizia Veloce"
            variant="primary"
          />

          {/* Simulazione Avanzata */}
          <PathOption 
            title="Simulazione Avanzata"
            description="Analisi completa e assistenza personalizzata"
            keyPoints={advancedKeyPoints}
            ctaLabel="Inizia Avanzata"
            variant="secondary"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto py-6 px-4 border-t">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-vibe-green">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-vibe-green">Termini</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-vibe-green">Contatti</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
