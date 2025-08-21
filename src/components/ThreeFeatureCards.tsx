import React from "react";
import { Logo } from "./Logo";
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
  return <section className="mt-4 md:mt-6 bg-white py-8 md:py-12 min-h-[240px] md:min-h-[280px] flex items-center justify-center max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="relative w-full">
          {/* Blocchi - griglia: mobile impilate, desktop in una riga */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
            {items.slice(0, 3).map((item, idx) => <article key={idx} className="feature-card bg-white border border-gray-100 shadow-lg hover:translate-y-[1px] hover:shadow-xl transition-all duration-200 rounded-[12px] cursor-pointer p-5 md:p-7 min-h-[180px] md:min-h-[200px] h-full">
                <div className="flex flex-col items-center text-center gap-5 md:gap-7 h-full">
                  <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 mx-auto" aria-hidden={!!!item.imgSrc}>
                    {item.imgSrc ? <img src={item.imgSrc} alt={item.alt || item.title} className="w-full h-full object-contain" loading="lazy" width={112} height={112} decoding="async" /> : null}
                  </div>
                  <div className="flex-1 mt-2 md:mt-3">
                    <h3 className="feature-title text-xl md:text-2xl font-semibold text-black mb-3">
                      {idx === 0 ? "Simulazioni vere" : idx === 1 ? "Consulenti esperti" : "Mutui difficili"}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
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