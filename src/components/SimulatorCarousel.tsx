import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SimulatorMockup from "@/components/mockups/SimulatorMockup";
import BankComparisonMockup from "@/components/mockups/BankComparisonMockup";
import DashboardMockup from "@/components/mockups/DashboardMockup";

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Il nostro simulatore",
    description: "La soluzione giusta al momento giusto: il nostro simulatore dotato di algoritmi potenti confronta in profondità le offerte delle banche e identifica la migliore per te.",
    component: SimulatorMockup
  },
  {
    id: 2,
    title: "Definisci la tua strategia bancaria",
    description: "I nostri consulenti condividono i loro strumenti di lavoro e scelgono al tuo fianco un'offerta di prestito e assicurazione su misura, secondo 12 criteri.",
    component: BankComparisonMockup
  },
  {
    id: 3,
    title: "Segui il tuo dossier in tempo reale",
    description: "Ti affidiamo il tuo progetto, devi sapere dove è. Accordo di principio, redazione dell'offerta... Beneficia di uno spazio online sicuro per seguire l'avanzamento del tuo dossier in completa autonomia.",
    component: DashboardMockup
  }
];

const SimulatorCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  const CurrentComponent = currentSlideData.component;

  return (
    <section className="bg-[#f7f5f2] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left - Text Content */}
          <div className="space-y-6 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {currentSlideData.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
              {/* Slide indicators */}
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-primary' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Vai al slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrow buttons */}
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="h-10 w-10 rounded-lg border-2 hover:bg-white/50 transition-all duration-300"
                  aria-label="Slide precedente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"  
                  size="icon"
                  onClick={nextSlide}
                  className="h-10 w-10 rounded-lg border-2 hover:bg-white/50 transition-all duration-300"
                  aria-label="Slide successivo"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right - Mockup Component */}
          <div className="lg:order-2">
            <div className="transform transition-all duration-500 ease-in-out animate-fade-in">
              <CurrentComponent />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SimulatorCarousel;