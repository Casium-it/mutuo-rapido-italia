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
        <svg
          className="absolute inset-0 md:hidden pointer-events-none z-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 50 12 C 56 24, 44 34, 50 46 S 56 68, 50 82"
            fill="none"
            stroke="hsl(var(--form-green))"
            strokeWidth="12"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Linea curva connettiva - desktop: passa sotto i centri x ≈ 33% → 66% → 33% */}
        <svg
          className="pointer-events-none absolute inset-0 hidden md:block z-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 33 18 C 48 18, 60 28, 66 36 S 72 54, 66 62 S 52 78, 33 84"
            fill="none"
            stroke="hsl(var(--form-green))"
            strokeWidth="12"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Blocchi - spazio verticale uniforme */}
        <div className="space-y-5 md:space-y-8 relative z-10">
          {items.slice(0, 3).map((item, idx) => {
            const isLeft = idx !== 1; // 1° e 3° a sinistra, 2° a destra

            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center"
              >
                {/* Placeholder illustrazione a sinistra (solo per card a destra) */}
                {!isLeft && (
                  <div className="hidden md:block md:col-span-4">
                    <div className="w-full h-40 lg:h-56" aria-hidden>
                      {item.imgSrc ? (
                        <img
                          src={item.imgSrc}
                          alt={item.alt || item.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Card principale */}
                <article
                  className={`${
                    isLeft
                      ? "md:col-span-8 md:col-start-1"
                      : "md:col-span-8 md:col-start-5"
                  } bg-white rounded-xl md:rounded-2xl border border-[hsl(var(--form-border))] p-4 md:p-6 shadow-[0_3px_0_0_hsl(var(--form-shadow))] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all hover:-translate-y-0.5`}
                >
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </article>

                {/* Placeholder illustrazione a destra (solo per card a sinistra) */}
                {isLeft && (
                  <div className="hidden md:block md:col-span-4">
                    <div className="w-full h-40 lg:h-56" aria-hidden>
                      {item.imgSrc ? (
                        <img
                          src={item.imgSrc}
                          alt={item.alt || item.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ThreeFeatureCards;
