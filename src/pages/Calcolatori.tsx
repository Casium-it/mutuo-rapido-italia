
import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, PieChart, Target, Home, Users, BookOpen, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const Calcolatori = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const calcolatori = [{
    icon: Calculator,
    title: "Simulatore Mutuo",
    description: "Calcola rata e importo finanziabile"
  }, {
    icon: TrendingUp,
    title: "Analisi Tassi",
    description: "Confronta tassi fissi e variabili"
  }, {
    icon: PieChart,
    title: "Piano Ammortamento",
    description: "Visualizza piano di rimborso"
  }, {
    icon: Target,
    title: "Calcolo Interessi",
    description: "Stima interessi totali"
  }, {
    icon: Home,
    title: "Valore Immobile",
    description: "Valuta il prezzo della casa"
  }, {
    icon: Users,
    title: "Capacità Finanziaria",
    description: "Verifica sostenibilità rata"
  }];

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
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate("/simulazione-avanzata")}>
            Simulazioni
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={handleWhatsAppContact}>
            Contattaci
          </Button>
        </div>
        
        {/* CTA Button */}
        <div className="ml-auto">
          <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-full px-6" onClick={() => navigate("/simulazione-avanzata")}>
            Simulazione
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-5xl mx-auto w-full flex flex-col justify-center relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            Tutto sui <span className="relative">
              <span className="gradient-text">mutui</span>
              <div className="absolute -bottom-1 left-0 right-0 h-4 bg-[#d3f54f] rounded-full opacity-80"></div>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Calcolatori, guide, consigli e una community di giovani<br />
            che condividono esperienze, senza termini complicati.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all relative overflow-hidden group" onClick={() => navigate("/simulazione-avanzata")}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              Simula il tuo mutuo
            </Button>
            <Button variant="ghost" className="text-[#245C4F] hover:bg-[#F8F4EF] px-8 py-4 text-lg rounded-[12px] border border-[#245C4F] hover:border-[#1e4f44] transition-all backdrop-blur-sm" onClick={handleWhatsAppContact}>
              Parla con noi
            </Button>
          </div>
        </div>

        {/* Calcolatori Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {calcolatori.map((calc, index) => (
            <CalcolatoreCard 
              key={index} 
              icon={calc.icon} 
              title={calc.title} 
              description={calc.description} 
            />
          ))}
        </div>

        {/* CTA Section */}
        
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

// Componente per le card dei calcolatori
interface CalcolatoreCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const CalcolatoreCard = ({
  icon: Icon,
  title,
  description
}: CalcolatoreCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-[#BEB8AE] p-6 hover:shadow-lg transition-all">
      <div className="bg-[#F8F4EF] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#245C4F]" />
      </div>
      <h3 className="text-xl font-semibold font-['Inter'] text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
};

// Componente per le card delle risorse
interface RisorsaCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  items: string[];
}

const RisorsaCard = ({
  icon: Icon,
  title,
  description,
  items
}: RisorsaCardProps) => {
  return (
    <div className="text-center">
      <div className="bg-[#F8F4EF] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#245C4F]" />
      </div>
      <h3 className="text-xl font-semibold font-['Inter'] text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-500 font-['Inter']">• {item}</li>
        ))}
      </ul>
    </div>
  );
};

export default Calcolatori;
