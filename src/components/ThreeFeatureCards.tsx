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
  return <section aria-labelledby="vantaggi-title" className="mt-8 md:mt-12 bg-white py-12 md:py-16 flex flex-col justify-center min-h-[70vh]">
      <div className="flex-1 flex flex-col justify-center">
        <header className="mb-10 md:mb-14 text-center">
          <h2 id="vantaggi-title" className="text-3xl font-bold italic text-black md:text-4xl flex items-center justify-center gap-2 flex-wrap">
            Se è rapido e su misura, è un <Logo size="lg" />
          </h2>
        </header>

        <div className="relative">
          {/* Linea curva connettiva - mobile (centro 50%) */}

          {/* Linea curva connettiva - desktop: passa sotto i centri x ≈ 33% → 66% → 33% */}

          {/* Blocchi - griglia: mobile impilate, desktop in una riga */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
            {items.slice(0, 3).map((item, idx) => <article key={idx} className="feature-card p-7 md:p-9 min-h-[200px] md:min-h-[220px] h-full">
                <div className="flex flex-col items-center text-center gap-5 md:gap-7 h-full">
                  <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 mx-auto" aria-hidden={!!!item.imgSrc}>
                    {item.imgSrc ? <img src={item.imgSrc} alt={item.alt || item.title} className="w-full h-full object-contain" loading="lazy" width={112} height={112} decoding="async" /> : null}
                  </div>
                  <div className="flex-1 mt-2 md:mt-3">
                    <h3 className="feature-title text-lg md:text-2xl font-semibold text-foreground mb-3">
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

        {/* CTA Button */}
        <div className="text-center mt-10 md:mt-14">
          <button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all relative overflow-hidden group" onClick={() => window.location.href = '/simulazioni'}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            Simula ora
          </button>
        </div>
      </div>
    </section>;
};
export default ThreeFeatureCards;