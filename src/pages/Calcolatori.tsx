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
  return <div className="min-h-screen flex flex-col relative overflow-hidden bg-[F1EBE2] bg-[#fff2e6]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 relative flex items-center z-10">
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <Logo />
        </div>
        
        {/* Absolutely centered navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]">
            Calcolatori
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]">
            Risorse
          </Button>
        </div>
        
        {/* CTA Button */}
        <div className="ml-auto">
          <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-full px-6">
            Inizia Ora
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-5xl mx-auto w-full flex flex-col justify-center relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Tutto sui <span className="gradient-text">mutui</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Calcolatori, guide, consigli e una community di giovani<br />
            che condividono esperienze, senza termini complicati.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all" onClick={() => navigate("/simulazione-avanzata")}>
              Simula il tuo mutuo
            </Button>
            <Button variant="ghost" className="text-[#245C4F] hover:bg-[#F8F4EF] px-8 py-4 text-lg rounded-[12px] border border-[#245C4F] hover:border-[#1e4f44] transition-all">
              Tutti i calcolatori
            </Button>
          </div>
        </div>

        {/* Calcolatori Grid */}
        

        {/* Risorse Section */}
        

        {/* CTA Section */}
        
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE] relative z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Privacy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
          </div>
        </div>
      </footer>
    </div>;
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
  return <div className="bg-white rounded-[12px] border border-[#BEB8AE] p-6 hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all group cursor-pointer shadow-[0_3px_0_0_#AFA89F] hover-grow">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-[#F8F4EF] rounded-full p-2">
          <Icon className="w-5 h-5 text-[#245C4F]" />
        </div>
        <h3 className="text-lg font-semibold font-['Inter'] text-gray-900">{title}</h3>
      </div>
      <p className="text-sm font-['Inter'] text-gray-500">{description}</p>
    </div>;
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
  return <div className="text-center">
      <div className="bg-[#F8F4EF] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#245C4F]" />
      </div>
      <h3 className="text-xl font-semibold font-['Inter'] text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item, index) => <li key={index} className="text-sm text-gray-500 font-['Inter']">• {item}</li>)}
      </ul>
    </div>;
};
export default Calcolatori;