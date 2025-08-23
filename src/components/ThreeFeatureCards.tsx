import React from "react";
import { Logo } from "./Logo";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
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
  const [sectionRef, isInView] = useIntersectionObserver({
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  });

  return <section ref={sectionRef} className="mt-4 md:mt-6 bg-white py-4 md:py-6 min-h-[200px] md:min-h-[220px] flex items-center justify-center max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="relative w-full">
          {/* Blocchi - griglia: mobile impilate, desktop in una riga */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
            {items.slice(0, 3).map((item, idx) => <article 
                key={idx} 
                className={`feature-card bg-white border border-gray-100 shadow-lg hover:translate-y-[1px] hover:shadow-xl transition-all duration-500 rounded-[12px] cursor-pointer p-5 md:p-7 min-h-[180px] md:min-h-[200px] h-full
                  ${isInView 
                    ? 'opacity-100 translate-y-0 animate-fade-in' 
                    : 'opacity-0 translate-y-8'
                  }`}
                style={{
                  animationDelay: isInView ? `${idx * 200}ms` : '0ms'
                }}
              >
                <div className="flex flex-col items-center text-center gap-5 md:gap-7 h-full">
                  <div className={`w-24 h-24 md:w-28 md:h-28 flex-shrink-0 mx-auto transition-all duration-700 ${
                      isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    style={{ transitionDelay: `${idx * 200 + 100}ms` }}
                    aria-hidden={!!!item.imgSrc}
                  >
                    {item.imgSrc ? <img src={item.imgSrc} alt={item.alt || item.title} className="w-full h-full object-contain" loading="lazy" width={112} height={112} decoding="async" /> : null}
                  </div>
                  <div className="flex-1 mt-2 md:mt-3">
                    <h3 className={`feature-title text-xl md:text-2xl font-semibold text-black mb-3 relative inline-block transition-all duration-700 ${
                        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${idx * 200 + 300}ms` }}
                    >
                      <span className="relative">
                        {idx === 0 ? "Simulazioni vere" : idx === 1 ? "Consulenti esperti" : "Mutui difficili"}
                        <span 
                          className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#245C4F] origin-left transition-transform duration-700 ${
                            isInView ? 'scale-x-100' : 'scale-x-0'
                          }`}
                          style={{ transitionDelay: `${idx * 200 + 600}ms` }}
                        />
                      </span>
                    </h3>
                    <p className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 ${
                        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${idx * 200 + 400}ms` }}
                    >
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