import React from "react";
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
  return <section aria-labelledby="vantaggi-title" className="mt-8 md:mt-12">
      <header className="mb-6 md:mb-8 text-center">
        <h2 id="vantaggi-title" className="text-2xl font-bold tracking-tight text-[hsl(var(--form-green))] text-black md:text-4xl">
          Perché scegliere <span className="gradient-text">GoMutuo</span>
        </h2>
      </header>

      <div className="relative">
        {/* Linea curva connettiva - mobile (centro 50%) */}

        {/* Linea curva connettiva - desktop: passa sotto i centri x ≈ 33% → 66% → 33% */}

        {/* Blocchi - griglia: mobile impilate, desktop in una riga */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
          {items.slice(0, 3).map((item, idx) => <article key={idx} className="bg-white rounded-xl md:rounded-2xl border border-[hsl(var(--form-border))] p-5 md:p-7 shadow-[0_3px_0_0_hsl(var(--form-shadow))] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all hover:-translate-y-0.5 min-h-[160px] md:min-h-[200px] h-full">
              <div className="flex flex-col items-center text-center gap-3 md:gap-4 h-full">
                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 mx-auto" aria-hidden={!!!item.imgSrc}>
                  {item.imgSrc ? <img src={item.imgSrc} alt={item.alt || item.title} className="w-full h-full object-contain" loading="lazy" /> : null}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1.5 md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed md:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>)}
        </div>
      </div>
    </section>;
};
export default ThreeFeatureCards;