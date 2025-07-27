import React, { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { trackWhatsAppContact, trackSimulationCTA } from "@/utils/analytics";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { LoginButton } from "@/components/LoginButton";
const HomePage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [currentNotification, setCurrentNotification] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Initialize time tracking for home page - stable reference
  const {
    trackCustomExit
  } = useTimeTracking({
    pageName: 'home_page'
  });
  const notifications = [{
    title: "Mutuo accettato!",
    description: "Hai risparmiato 23.000 €"
  }, {
    title: "Ciao sono Luca,",
    description: "Il tuo consulente personale"
  }, {
    title: "Nuovo tasso → 2.1%",
    description: "Surroga e risparmia 4.000 €"
  }];
  useEffect(() => {
    // Inizia dopo 3 secondi
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(initialTimer);
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    const cycleNotifications = () => {
      // Mostra per 3 secondi
      const showTimer = setTimeout(() => {
        setIsVisible(false);

        // Aspetta 1 secondo per il fade out, poi cambia notifica
        const changeTimer = setTimeout(() => {
          setCurrentNotification(prev => (prev + 1) % notifications.length);
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(changeTimer);
      }, 5000);
      return () => clearTimeout(showTimer);
    };
    const cleanup = cycleNotifications();

    // Ripeti il ciclo ogni 4 secondi (3 sec visibile + 1 sec nascosto)
    const intervalId = setInterval(cycleNotifications, 7000);
    return () => {
      cleanup?.();
      clearInterval(intervalId);
    };
  }, [isVisible, currentNotification, notifications.length]);
  const benefits = [{
    title: "Il miglior Mutuo",
    description: "Confrontiamo e parliamo con più di 100 banche senza che tu debba andare in filiale"
  }, {
    title: "Trasparenza",
    description: "La trasparenza è al primo posto, niente termini incomprensibili"
  }, {
    title: "Esperti su tutta Italia",
    description: "Rete di 90+ mediatori partner esperti su tutta Italia, pronti ad aiutarti"
  }, {
    title: "Mutuo per tutti",
    description: "Mutuo difficile? Partita IVA? Segnalazioni? Ci pensiamo noi, siamo esperti in questo"
  }];
  const handleWhatsAppContact = () => {
    trackWhatsAppContact('home_page');
    // Track custom exit since user is leaving for WhatsApp
    trackCustomExit('whatsapp_contact');
    window.open('https://wa.me/393518681491', '_blank');
  };
  const handleSimulationClick = (position: string) => {
    trackSimulationCTA(position);
    // Track custom exit since user is navigating away
    trackCustomExit('simulation_navigation');
    navigate("/simulazioni");
  };
  return <div className="min-h-screen flex flex-col bg-[#fff7f0]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 relative flex items-center justify-between z-10 animate-[fade-in_0.6s_ease-out_0.1s_both] opacity-0">
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <Logo />
        </div>
        
        {/* Desktop only navigation - centered */}
        {!isMobile && <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => handleSimulationClick('header_nav')}>
              Simulazioni
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={handleWhatsAppContact}>
              Contattaci
            </Button>
          </div>}
        
        {/* CTA Button */}
        <div>
          <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-full px-6" onClick={() => handleSimulationClick('header')}>
            Simulazione
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-5xl mx-auto w-full flex flex-col justify-center relative z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-16">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left animate-[fade-in_0.6s_ease-out_0.3s_both] opacity-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 animate-[fade-in_0.6s_ease-out_0.4s_both] opacity-0">
              Cerchi un <span className="relative">
                <span className="gradient-text">mutuo?</span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 md:h-3 bg-[#d3f54f] rounded-full opacity-80 animate-[expand-line_1.2s_ease-out_0.8s_both] scale-x-0 origin-left"></div>
              </span>
            </h1>
            <p className="text-gray-600 mb-4 max-w-3xl mx-auto lg:mx-0 leading-relaxed text-lg md:text-lg animate-[fade-in_0.6s_ease-out_0.6s_both] opacity-0 py-[5px]">Soluzioni concrete per ogni situazione, anche per le più complesse. GoMutuo ti accompagna dall'inizio alla fine.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-6 animate-[fade-in_0.6s_ease-out_0.9s_both] opacity-0">
              <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all relative overflow-hidden group" onClick={() => handleSimulationClick('hero')}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                Simula il tuo mutuo
              </Button>
              <Button variant="ghost" className="text-[#245C4F] hover:bg-[#F8F4EF] px-8 py-4 text-lg rounded-[12px] border border-[#245C4F] hover:border-[#1e4f44] transition-all backdrop-blur-sm" onClick={handleWhatsAppContact}>
                Parla con noi
              </Button>
            </div>

            {/* Check marks */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mb-4 animate-[fade-in_0.6s_ease-out_1.2s_both] opacity-0">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 opacity-50" />
                <span className="text-sm text-gray-600">Online in 6 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 opacity-50" />
                <span className="text-sm text-gray-600">Senza Impegno</span>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center justify-center lg:justify-start gap-2 animate-[fade-in_0.6s_ease-out_1.5s_both] opacity-0">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : star === 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} style={star === 5 ? {
                clipPath: 'polygon(0 0, 80% 0, 80% 100%, 0 100%)'
              } : {}} />)}
              </div>
              <span className="text-gray-600 font-medium">4.8/5 - 872 recensioni</span>
            </div>
          </div>

          {/* Right side - Image with notification */}
          <div className="flex justify-center lg:justify-end animate-[fade-in_0.6s_ease-out_0.5s_both] opacity-0">
            <div className="relative">
              <img src="/lovable-uploads/3fc7bd9a-e8ce-4850-b0a8-a704f2af6b9d.png" alt="Coppia felice che usa il laptop per simulare il mutuo" className="w-full max-w-md lg:max-w-lg rounded-2xl shadow-lg" />
              
              {/* Success notification popup with cycling notifications */}
              <div className={`absolute bottom-4 right-4 bg-[#245C4F]/90 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold whitespace-nowrap">{notifications[currentNotification].title}</p>
                    <p className="text-xs opacity-90 whitespace-nowrap">{notifications[currentNotification].description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16 bg-gradient-to-b from-[#f8f5f1] to-[#f0ede8] rounded-2xl py-12 px-6 animate-[fade-in_0.8s_ease-out_1.8s_both] opacity-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => <BenefitCard key={index} title={benefit.title} description={benefit.description} />)}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE] relative z-10 animate-[fade-in_0.6s_ease-out_2.1s_both] opacity-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
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
export default HomePage;