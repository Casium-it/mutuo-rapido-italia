
import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, LightbulbIcon, Search, Home, Check, File } from "lucide-react";

const SimulazioneAvanzata = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 border-b">
        <div className="flex justify-between items-center">
          <Logo />
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-vibe-green">
            Accedi
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Benvenuto in <span className="gradient-text">GoMutuo</span>
          </h1>
          
          <div className="space-y-4">
            <OptionCard
              icon={LightbulbIcon}
              title="Sto pensando di acquistare"
              description="Non ho ancora iniziato le visite"
              href="/simulazione/pensando"
            />
            
            <OptionCard
              icon={Search}
              title="Sto cercando attivamente"
              description="Ho già iniziato o pianificato le visite"
              href="/simulazione/cercando"
            />
            
            <OptionCard
              icon={Home}
              title="Ho fatto un'offerta su un immobile"
              href="/simulazione/offerta"
            />
            
            <OptionCard
              icon={Check}
              title="Ho un'offerta accettata"
              href="/simulazione/accettata"
            />
            
            <OptionCard
              icon={File}
              title="Ho firmato un compromesso"
              href="/simulazione/compromesso"
            />
            
            <OptionCard
              icon={Home}
              title="Voglio migliorare il mio mutuo attuale"
              description="Voglio rinegoziare il mio mutuo, consolidare i prestiti o riscattare la quota di un comproprietario"
              href="/simulazione/migliorare"
            />
          </div>
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
      
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-vibe-yellow-fluo to-vibe-green rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-vibe-green to-vibe-green-vivid rounded-full blur-3xl opacity-10 animate-float-rotate"></div>
      </div>
    </div>
  );
};

// Componente per le opzioni
interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  href: string;
}

const OptionCard = ({ icon: Icon, title, description, href }: OptionCardProps) => {
  return (
    <a 
      href={href}
      className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-vibe-green/20 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-5">
        <div className="text-gray-600 p-3 bg-gray-50 rounded-full group-hover:bg-vibe-green/5">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      <div className="bg-vibe-green text-white p-2 rounded-lg group-hover:bg-vibe-green-dark transition-colors">
        <ArrowRight className="w-5 h-5" />
      </div>
    </a>
  );
};

export default SimulazioneAvanzata;
