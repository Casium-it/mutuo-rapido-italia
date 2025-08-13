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
  return <section aria-labelledby="vantaggi-title" className="mt-8 md:mt-12 bg-white">
      <header className="mb-10 md:mb-14 text-center">
        <h2 id="vantaggi-title" className="text-2xl font-bold tracking-tight text-[hsl(var(--form-green))] text-black md:text-4xl">
          Perché scegliere <span className="gradient-text">GoMutuo?</span>
        </h2>
      </header>

      <div className="relative">
        {/* Linea curva connettiva - mobile (centro 50%) */}

        {/* Linea curva connettiva - desktop: passa sotto i centri x ≈ 33% → 66% → 33% */}

        {/* Blocchi - griglia: mobile impilate, desktop in una riga */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
          {items.slice(0, 3).map((item, idx) => <article key={idx} className="feature-card p-6 md:p-8 min-h-[200px] md:min-h-[220px] h-full">
              <div className="flex flex-col items-center text-center gap-3 md:gap-4 h-full">
                <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 mx-auto" aria-hidden={!!!item.imgSrc}>
                  {item.imgSrc ? (
                    <img
                      src={item.imgSrc}
                      alt={item.alt || item.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      width={112}
                      height={112}
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <h3 className="feature-title text-lg md:text-2xl font-semibold text-foreground mb-3">
                    Simulazioni vere
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
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