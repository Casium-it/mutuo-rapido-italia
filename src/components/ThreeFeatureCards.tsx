import React from "react";
import { Logo } from "./Logo";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useIsMobile } from "@/hooks/use-mobile";
export type FeatureCardItem = {
  title: string;
  description: string;
  imgSrc?: string; // PNG/SVG grandi che verranno forniti
  alt?: string;
};
interface ThreeFeatureCardsProps {
  items: FeatureCardItem[];
}

// Layout mobile-first a 3 card: 1 e 3 a sinistra, 2 a destra.
// Spazi verticali identici, testi compatti (DM Sans), ombra 3D coerente.
// Linea curva verde (hsl(--form-green)) completamente opaca che connette i blocchi al loro centro orizzontale.
const ThreeFeatureCards: React.FC<ThreeFeatureCardsProps> = ({
  items
}) => {
  const isMobile = useIsMobile();
  const [sectionRef, isInView] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -5% 0px'
  });

  // No delay - animate immediately when in view
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const [centerCardIndex, setCenterCardIndex] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    if (isInView) {
      setShouldAnimate(true);
    }
  }, [isInView]);

  // Mobile center detection
  React.useEffect(() => {
    if (!isMobile || !shouldAnimate) return;

    const handleScroll = () => {
      const cards = document.querySelectorAll('.feature-card-mobile');
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = null;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        
        if (distance < closestDistance && distance < 150) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setCenterCardIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, shouldAnimate]);

  return <section ref={sectionRef} className="mt-4 md:mt-6 bg-white py-4 md:py-6 min-h-[200px] md:min-h-[220px] flex items-center justify-center max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="relative w-full">
          {/* Blocchi - griglia: mobile impilate, desktop in una riga */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
            {items.slice(0, 3).map((item, idx) => <article 
                key={idx} 
                className={`feature-card ${isMobile ? 'feature-card-mobile' : ''} bg-white border border-gray-100 shadow-lg rounded-[12px] cursor-pointer p-4 md:p-7 min-h-[160px] md:min-h-[200px] h-full
                  transition-all duration-500 ease-out
                  md:hover:scale-105 md:hover:shadow-2xl md:hover:-translate-y-2 md:hover:border-primary/20
                  ${isMobile && centerCardIndex === idx ? 'scale-105 shadow-2xl -translate-y-1 border-primary/30' : ''}
                  ${shouldAnimate 
                    ? 'opacity-100 translate-y-0 animate-fade-in' 
                    : 'opacity-0 translate-y-8'
                  }`}
                style={{
                  animationDelay: shouldAnimate ? `${idx * 300}ms` : '0ms'
                }}
              >
                <div className="flex flex-col items-center text-center gap-5 md:gap-7 h-full">
                  <div className={`w-24 h-24 md:w-28 md:h-28 flex-shrink-0 mx-auto transition-all duration-1000 ${
                      shouldAnimate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    style={{ transitionDelay: `${idx * 300 + 150}ms` }}
                    aria-hidden={!!!item.imgSrc}
                  >
                    {item.imgSrc ? <img src={item.imgSrc} alt={item.alt || item.title} className="w-full h-full object-contain" loading="lazy" width={112} height={112} decoding="async" /> : null}
                  </div>
                  <div className="flex-1 mt-2 md:mt-3">
                    <h3 className={`feature-title text-xl md:text-2xl font-semibold text-black mb-3 transition-all duration-1000 ${
                        shouldAnimate ? 'opacity-100 translate-y-0 animate-underline' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ 
                        transitionDelay: `${idx * 300 + 450}ms`,
                        '--underline-delay': `${idx * 300 + 900}ms`
                      } as React.CSSProperties & { '--underline-delay': string }}
                    >
                      {idx === 0 ? "Simulazioni vere" : idx === 1 ? "Consulenti esperti" : "Mutui difficili"}
                    </h3>
                     <p className="text-lg text-muted-foreground leading-relaxed opacity-100 translate-y-0">
                       {idx === 0 ? "Analisi approfondita per capire se il mutuo si può fare, davvero." : idx === 1 ? "Prima consulenza gratuita con consulenti esperti in tutta Italia." : "Mutui 95% e 100%, anche per le situazioni più complesse."}
                     </p>
                  </div>
                </div>
              </article>)}
          </div>
        </div>
    </section>;
};
export default ThreeFeatureCards;