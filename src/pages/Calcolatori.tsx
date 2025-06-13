import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, PieChart, Target, Home, Users, BookOpen, MessageCircle, Star, Check, Shield, Globe, Heart, Award } from "lucide-react";
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
  const benefits = [{
    title: "Il miglior Mutuo",
    description: "Confrontiamo e parliamo con più di 100 banche senza che devi andare in filiale"
  }, {
    title: "Trasparenza",
    description: "La trasparenza è al primo posto, niente termini incomprensibili"
  }, {
    title: "Esperti su tutta Italia",
    description: "Rete di 90+ mediatori partner esperti su tutta italia, pronti ad aiutarti"
  }, {
    title: "Mutuo per tutti",
    description: "Mutuo difficile? Partita Iva? Segnalazioni? Ci pensiamo noi a te siamo esperti in questo"
  }];
  const handleWhatsAppContact = () => {
    window.open('https://wa.me/393518681491', '_blank');
  };
  return <div className="min-h-screen flex flex-col bg-[#fff7f0]">
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
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-5xl mx-auto w-full flex flex-col justify-center relative z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-16">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              Cerchi un <span className="relative">
                <span className="gradient-text">mutuo?</span>
                <div className="absolute -bottom-1 left-0 right-0 h-4 bg-[#d3f54f] rounded-full opacity-80"></div>
              </span>
            </h1>
            <p className="text-gray-600 mb-4 max-w-3xl mx-auto lg:mx-0 leading-relaxed text-lg md:text-lg">Noi siamo dalla tua parte, non da quella delle banche! GoMutuo è il partner che ti segue dall'inizio alla fine.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-6">
              <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all relative overflow-hidden group" onClick={() => navigate("/simulazioni")}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                Simula il tuo mutuo
              </Button>
              <Button variant="ghost" className="text-[#245C4F] hover:bg-[#F8F4EF] px-8 py-4 text-lg rounded-[12px] border border-[#245C4F] hover:border-[#1e4f44] transition-all backdrop-blur-sm" onClick={handleWhatsAppContact}>
                Parla con noi
              </Button>
            </div>

            {/* Check marks */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mb-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Online in 10 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Senza Impegno</span>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : star === 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} style={star === 5 ? {
                clipPath: 'polygon(0 0, 80% 0, 80% 100%, 0 100%)'
              } : {}} />)}
              </div>
              <span className="text-gray-600 font-medium">4.8/5 - 872 recensioni</span>
            </div>
          </div>

          {/* Right side - Image with notification */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img src="/lovable-uploads/3fc7bd9a-e8ce-4850-b0a8-a704f2af6b9d.png" alt="Coppia felice che usa il laptop per simulare il mutuo" className="w-full max-w-md lg:max-w-lg rounded-2xl shadow-lg" />
              
              {/* Success notification popup */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#245C4F]/90 backdrop-blur-sm rounded-lg p-4 text-white shadow-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Mutuo accettato!</p>
                    <p className="text-xs opacity-90">Hai risparmiato 23.000 €</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16 bg-gradient-to-b from-[#f8f5f1] to-[#f0ede8] rounded-2xl py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => <BenefitCard key={index} title={benefit.title} description={benefit.description} />)}
          </div>
        </div>

        {/* Calcolatori Grid */}
        

        {/* CTA Section */}
        
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE] relative z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
          <div className="flex gap-4">
            <button onClick={() => navigate("/privacy")} className="text-sm text-gray-600 hover:text-[#245C4F]">
              Privacy
            </button>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
          </div>
        </div>
      </footer>
    </div>;
};

// Componente per le card dei benefici
interface BenefitCardProps {
  title: string;
  description: string;
}
const BenefitCard = ({
  title,
  description
}: BenefitCardProps) => {
  return <div className="text-center p-4">
      <div className="bg-[#245C4F] rounded-full p-2 w-8 h-8 mx-auto mb-4 flex items-center justify-center">
        <Check className="w-4 h-4 text-white font-bold stroke-[3]" />
      </div>
      <h3 className="text-lg font-bold font-['Inter'] text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
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
  return <div className="bg-white rounded-lg border border-[#BEB8AE] p-6 hover:shadow-lg transition-all">
      <div className="bg-[#F8F4EF] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#245C4F]" />
      </div>
      <h3 className="text-xl font-semibold font-['Inter'] text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
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