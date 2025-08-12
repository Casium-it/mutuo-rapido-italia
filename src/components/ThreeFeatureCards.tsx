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
const ThreeFeatureCards: React.FC<ThreeFeatureCardsProps> = ({ items }) => {
  return (
    <section aria-labelledby="vantaggi-title" className="mt-8 md:mt-12">
      <header className="mb-6 md:mb-8 text-center">
        <h2
          id="vantaggi-title"
          className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--form-green))]"
        >
          Perché scegliere <span className="gradient-text">GoMutuo</span>
        </h2>
      </header>

      <div className="relative">
        {/* Linea curva connettiva - mobile (centro 50%) */}

        {/* Linea curva connettiva - desktop: passa sotto i centri x ≈ 33% → 66% → 33% */}

        {/* Blocchi - spazio verticale uniforme */}
        <div className="space-y-3 md:space-y-5 relative z-10">
          {items.slice(0, 3).map((item, idx) => (
            <article
              key={idx}
              className="bg-white rounded-xl md:rounded-2xl border border-[hsl(var(--form-border))] p-5 md:p-7 shadow-[0_3px_0_0_hsl(var(--form-shadow))] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all hover:-translate-y-0.5 min-h-[120px] md:min-h-[160px]"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div
                  className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0"
                  aria-hidden={!(!!item.imgSrc)}
                >
                  {item.imgSrc ? (
                    <img
                      src={item.imgSrc}
                      alt={item.alt || item.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreeFeatureCards;
