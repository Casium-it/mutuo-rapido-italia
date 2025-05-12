
import React from "react";
import { Logo } from "@/components/Logo";
import { PathOption } from "@/components/PathOption";
import { Zap, Check, File, Bank, Clock, Percent, Shield, Ai } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 px-4">
        <Logo />
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="gradient-text">Trova il Mutuo Perfetto</span> Per Te
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Confrontiamo i migliori mutui disponibili sul mercato per aiutarti a trovare l'offerta più conveniente
          </p>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-4">Scegli il Percorso Giusto Per Te</h2>
          <p className="text-muted-foreground">Abbiamo due opzioni per soddisfare le tue esigenze</p>
        </div>

        {/* Background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-vibe-yellow-fluo to-vibe-green rounded-full blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-vibe-green to-vibe-purple rounded-full blur-3xl opacity-10 animate-float-rotate"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch">
          {/* Simulazione Veloce */}
          <PathOption 
            title="Simulazione Veloce"
            description="Ottieni rapidamente un'analisi delle offerte di mutuo disponibili"
            keyPoints={[
              { icon: Clock, text: "Solo 3 minuti per completare" },
              { icon: Zap, text: "Processo semplice e veloce" },
              { icon: Percent, text: "68% di precisione nelle stime" },
              { icon: Bank, text: "Confronto tra 48 banche" },
              { icon: File, text: "Solo simulazione del mutuo" },
            ]}
            ctaLabel="Inizia Simulazione Veloce"
            variant="primary"
          />

          {/* Simulazione Avanzata */}
          <PathOption 
            title="Simulazione Avanzata"
            description="Un'analisi completa per ottenere il miglior mutuo possibile"
            keyPoints={[
              { icon: Clock, text: "11 minuti per un'analisi dettagliata" },
              { icon: Shield, text: "98% di precisione nelle stime" },
              { icon: Ai, text: "Analisi potenziata da intelligenza artificiale" },
              { icon: Bank, text: "Confronto tra 122 banche" },
              { icon: Check, text: "Percorso completo, dalla simulazione all'assistenza" },
              { icon: File, text: "Attivazione mutuo 100% online" },
            ]}
            ctaLabel="Inizia Simulazione Avanzata"
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
