
import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, LightbulbIcon, Search, Home, Check, File } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const SimulazioneAvanzata = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex justify-between items-center">
        <Logo />
        <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-vibe-green">
          Accedi
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-10">
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
      </main>
      
      {/* Non aggiungiamo il footer qui per rispecchiare il design dell'immagine di riferimento */}
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
  const isMobile = useIsMobile();

  return (
    <a 
      href={href}
      className="flex items-center justify-between p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        {!isMobile && (
          <div className="text-gray-600 flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="bg-vibe-green p-3 rounded-lg group-hover:bg-vibe-green-dark transition-colors flex items-center justify-center ml-2 flex-shrink-0">
        <ArrowRight className="w-5 h-5 text-white" />
      </div>
    </a>
  );
};

export default SimulazioneAvanzata;
