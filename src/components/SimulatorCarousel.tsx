import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnalysisDeepMockup from "@/components/mockups/AnalysisDeepMockup";
import SimulatorMockup from "@/components/mockups/SimulatorMockup";
import BankComparisonMockup from "@/components/mockups/BankComparisonMockup";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType;
}

const slides: CarouselSlide[] = [{
  id: 1,
  title: "Analisi della tua richiesta",
  description: "I mediatori partner analizzano in profondità tutti i fattori rilevanti per valutare la reale ottenibilità del mutuo, trovando soluzioni anche per le situazioni più complesse.",
  component: AnalysisDeepMockup
}, {
  id: 2,
  title: "Simulazione approfondita",
  description: "I nostri consulenti partner ti forniscono una valutazione precisa della difficoltà di ottenimento, del numero di banche disponibili e del prodotto di mutuo più conveniente.",
  component: SimulatorMockup
}, {
  id: 3,
  title: "Consulente al tuo fianco",
  description: "I nostri consulenti partner ti accompagnano lungo tutto il percorso di ottenimento del mutuo, facendoti risparmiare soldi e tempo",
  component: BankComparisonMockup
}];
const SimulatorCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 6000; // 6 secondi per slide
  const PROGRESS_INTERVAL = 50; // Aggiorna il progresso ogni 50ms

  // Fade-in animation quando la sezione diventa visibile al 50%
  const [carouselRef, isCarouselInView] = useIntersectionObserver({
    threshold: 0.5, // 50% della sezione deve essere visibile
    rootMargin: '0px'
  });

  // Preload delle immagini del carousel per evitare ritardi di caricamento
  const carouselImages = [
    "/lovable-uploads/89fbdaf4-4951-4b60-9388-0ddbaa610931.png", // AnalysisDeepMockup
    "/lovable-uploads/541599e5-f622-495d-987c-43e6cfce8499.png", // SimulatorMockup
    "/lovable-uploads/efb4b871-5e27-45bb-a040-67fd1c57bea4.png"  // BankComparisonMockup
  ];
  
  useImagePreloader(carouselImages, 1500); // Inizia il preload dopo 1.5 secondi

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
  };
  const startTimer = () => {
    if (!isPlaying || !isCarouselInView) return; // Solo se è in playing e visibile al 50%
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
    if (isPlaying && isCarouselInView) {
      startTimer();
    } else {
      resetTimer();
    }
    return () => {
      resetTimer();
    };
  }, [currentSlide, isPlaying, isCarouselInView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetTimer();
    };
  }, []);
  const currentSlideData = slides[currentSlide];
  const CurrentComponent = currentSlideData.component;
  return <section 
      ref={carouselRef}
      className={`bg-[#f7f5f2] py-12 md:py-16 transition-opacity duration-1000 ${
        isCarouselInView ? 'opacity-100 animate-fade-in' : 'opacity-0'
      }`}
      onMouseEnter={() => setIsPlaying(false)} 
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left - Text Content */}
          <div className="space-y-6 lg:order-1">
            {/* Navigation Controls - spostati sopra il titolo */}
            <div className="flex items-center gap-4">
              {/* Progress indicators - righette */}
              <div className="flex gap-2">
                {slides.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className="relative w-8 h-1 bg-gray-300 overflow-hidden transition-all duration-300 hover:bg-gray-400" aria-label={`Vai al slide ${index + 1}`}>
                    <div className={`absolute top-0 left-0 h-full bg-[#245C4F] transition-all duration-300 ${index === currentSlide ? '' : 'w-0'}`} style={{
                  width: index === currentSlide ? `${progress}%` : index < currentSlide ? '100%' : '0%'
                }} />
                  </button>)}
              </div>

              {/* Arrow buttons - frecce semplici */}
              <div className="flex gap-2 ml-4">
                <button onClick={prevSlide} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer p-1" aria-label="Slide precedente">
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button onClick={nextSlide} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer p-1" aria-label="Slide successivo">
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#010101]">
                {currentSlideData.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>

            {/* CTA Button spostato qui */}
            <div className="pt-2">
              <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all relative overflow-hidden group" onClick={() => window.location.href = '/simulazioni'}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                Simula ora
              </Button>
            </div>
          </div>

          {/* Right - Mockup Component - Dimensioni responsive più ampie */}
          <div className="lg:order-2">
            <div className="w-[320px] h-[280px] md:w-[400px] md:h-[320px] lg:w-[480px] lg:h-[360px] flex-shrink-0 flex items-center justify-center transform transition-all duration-500 ease-in-out overflow-hidden mx-auto">
              <CurrentComponent />
            </div>
          </div>

        </div>
        
        {/* Immagini nascoste per preload e cache del browser */}
        <div className="hidden" aria-hidden="true">
          {carouselImages.map((src, index) => (
            <img key={index} src={src} alt="" loading="eager" />
          ))}
        </div>
      </div>
    </section>;
};
export default SimulatorCarousel;