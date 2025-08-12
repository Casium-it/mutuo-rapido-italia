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

// Layout mobile-first a 3 card, con allineamento 1 e 3 a sinistra, 2 a destra
// Spazi identici tra i blocchi e grande linea curva verde che li connette (desktop)
// Usa DM Sans (font di default) e ombra 3D coerente con i bottoni
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
        {/* Linea curva connettiva (solo desktop) */}
        <svg
          className="pointer-events-none absolute inset-0 hidden md:block"
          viewBox="0 0 1200 540"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 180 110 C 520 110, 760 150, 980 190 S 1080 270, 820 310 S 420 370, 220 410"
            fill="none"
            stroke="hsl(var(--form-green))"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.25"
          />
        </svg>

        {/* Blocchi - spazio verticale uniforme */}
        <div className="space-y-8 md:space-y-12 relative z-10">
          {items.slice(0, 3).map((item, idx) => {
            const isLeft = idx !== 1; // 1° e 3° a sinistra, 2° a destra

            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center"
              >
                {/* Placeholder illustrazione a sinistra (solo per card a destra) */}
                {!isLeft && (
                  <div className="hidden md:block md:col-span-4">
                    <div className="w-full h-48 lg:h-64" aria-hidden>
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
                  } bg-white rounded-2xl border border-[hsl(var(--form-border))] p-5 md:p-6 shadow-[0_3px_0_0_hsl(var(--form-shadow))] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all hover:-translate-y-0.5`}
                >
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </article>

                {/* Placeholder illustrazione a destra (solo per card a sinistra) */}
                {isLeft && (
                  <div className="hidden md:block md:col-span-4">
                    <div className="w-full h-48 lg:h-64" aria-hidden>
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
