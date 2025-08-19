import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnalysisDeepMockup from "@/components/mockups/AnalysisDeepMockup";
import SimulatorMockup from "@/components/mockups/SimulatorMockup";
import BankComparisonMockup from "@/components/mockups/BankComparisonMockup";
import DashboardMockup from "@/components/mockups/DashboardMockup";
interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType;
}
const slides: CarouselSlide[] = [{
  id: 1,
  title: "Analisi approfondita",
  description: "I mediatori partner analizzano in profondità tutti i fattori rilevanti per valutare la reale ottenibilità del mutuo, trovando soluzioni anche per le situazioni più complesse, senza fermarsi alle sole condizioni economiche.",
  component: AnalysisDeepMockup
}, {
  id: 2,
  title: "Il nostro simulatore",
  description: "La soluzione giusta al momento giusto: il nostro simulatore dotato di algoritmi potenti confronta in profondità le offerte delle banche e identifica la migliore per te.",
  component: SimulatorMockup
}, {
  id: 3,
  title: "Definisci la tua strategia bancaria",
  description: "I nostri consulenti condividono i loro strumenti di lavoro e scelgono al tuo fianco un'offerta di prestito e assicurazione su misura, secondo 12 criteri.",
  component: BankComparisonMockup
}, {
  id: 4,
  title: "Segui il tuo dossier in tempo reale",
  description: "Ti affidiamo il tuo progetto, devi sapere dove è. Accordo di principio, redazione dell'offerta... Beneficia di uno spazio online sicuro per seguire l'avanzamento del tuo dossier in completa autonomia.",
  component: DashboardMockup
}];
const SimulatorCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 6000; // 6 secondi per slide
  const PROGRESS_INTERVAL = 50; // Aggiorna il progresso ogni 50ms

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
  };
  const startTimer = () => {
    if (!isPlaying) return;
    resetTimer();

    // Timer per il progresso
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + PROGRESS_INTERVAL / SLIDE_DURATION * 100;
        if (newProgress >= 100) {
          setCurrentSlide(currentSlide => (currentSlide + 1) % slides.length);
          return 0;
        }
        return newProgress;
      });
    }, PROGRESS_INTERVAL);
  };
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
    resetTimer();
    if (isPlaying) startTimer();
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    resetTimer();
    if (isPlaying) startTimer();
  };
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    resetTimer();
    if (isPlaying) startTimer();
  };

  // Auto-advance logic
  useEffect(() => {
    if (isPlaying) {
      startTimer();
    } else {
      resetTimer();
    }
    return () => {
      resetTimer();
    };
  }, [currentSlide, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetTimer();
    };
  }, []);
  const currentSlideData = slides[currentSlide];
  const CurrentComponent = currentSlideData.component;
  return <section className="bg-[#f7f5f2] py-12 md:py-16" onMouseEnter={() => setIsPlaying(false)} onMouseLeave={() => setIsPlaying(true)}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left - Text Content */}
          <div className="space-y-6 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#010101]">
                {currentSlideData.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
              {/* Progress indicators - righette */}
              <div className="flex gap-2">
                {slides.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className="relative w-8 h-1 bg-gray-300 overflow-hidden transition-all duration-300 hover:bg-gray-400" aria-label={`Vai al slide ${index + 1}`}>
                    <div className={`absolute top-0 left-0 h-full bg-[#245C4F] transition-all duration-300 ${index === currentSlide ? '' : 'w-0'}`} style={{
                  width: index === currentSlide ? `${progress}%` : index < currentSlide ? '100%' : '0%'
                }} />
                  </button>)}
              </div>

              {/* Arrow buttons - stile come "Simula il tuo mutuo" */}
              <div className="flex gap-2 ml-4">
                <Button size="icon" onClick={prevSlide} className="h-10 w-10 bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all duration-200 relative overflow-hidden group" aria-label="Slide precedente">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <ChevronLeft className="h-5 w-5 stroke-[2.5] relative z-10" />
                </Button>
                <Button size="icon" onClick={nextSlide} className="h-10 w-10 bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all duration-200 relative overflow-hidden group" aria-label="Slide successivo">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <ChevronRight className="h-5 w-5 stroke-[2.5] relative z-10" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right - Mockup Component - Dimensioni responsive più ampie */}
          <div className="lg:order-2">
            <div className="w-[320px] h-[280px] md:w-[400px] md:h-[320px] lg:w-[480px] lg:h-[360px] flex-shrink-0 flex items-center justify-center transform transition-all duration-500 ease-in-out overflow-hidden mx-auto">
              <CurrentComponent />
            </div>
          </div>

        </div>
      </div>
    </section>;
};
export default SimulatorCarousel;