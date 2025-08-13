import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Il nostro simulatore",
    description: "La soluzione giusta al momento giusto: il nostro simulatore dotato di algoritmi potenti confronta in profondità le offerte delle banche e identifica la migliore per te.",
    image: "/lovable-uploads/2c38bac5-e583-4053-bf52-96b277b6a29f.png",
    imageAlt: "Schermata del simulatore che mostra un mutuo di 240.000€ approvato"
  },
  {
    id: 2,
    title: "Definisci la tua strategia bancaria",
    description: "I nostri consulenti condividono i loro strumenti di lavoro e scelgono al tuo fianco un'offerta di prestito e assicurazione su misura, secondo 12 criteri.",
    image: "/lovable-uploads/2b28a9d4-7c2d-483a-a7cd-ac588a786d34.png",
    imageAlt: "Interfaccia di confronto banche con matrice di compatibilità"
  },
  {
    id: 3,
    title: "Segui il tuo dossier in tempo reale",
    description: "Ti affidiamo il tuo progetto, devi sapere dove è. Accordo di principio, redazione dell'offerta... Beneficia di uno spazio online sicuro per seguire l'avanzamento del tuo dossier in completa autonomia.",
    image: "/lovable-uploads/f585bc2d-cbd2-4e9e-944b-b91dd6299182.png",
    imageAlt: "Dashboard di monitoraggio del dossier con stato avanzamento"
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

  return (
    <section className="bg-[#f7f5f2] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left side - Navigation buttons for desktop */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="h-12 w-12 rounded-lg border-2 hover:bg-white/50 transition-all duration-300"
              aria-label="Slide precedente"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"  
              size="icon"
              onClick={nextSlide}
              className="h-12 w-12 rounded-lg border-2 hover:bg-white/50 transition-all duration-300"
              aria-label="Slide successivo"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Center - Main content */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-border">
              <div className="aspect-[16/10] relative">
                <img
                  src={currentSlideData.image}
                  alt={currentSlideData.imageAlt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            
            {/* Mobile navigation */}
            <div className="flex lg:hidden justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="h-12 w-12 rounded-lg border-2 hover:bg-white/50 transition-all duration-300"
                aria-label="Slide precedente"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="h-12 w-12 rounded-lg border-2 hover:bg-white/50 transition-all duration-300"
                aria-label="Slide successivo"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right side - Text content */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground italic">
                {currentSlideData.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>

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
          </div>

        </div>
      </div>
    </section>
  );
};

export default SimulatorCarousel;