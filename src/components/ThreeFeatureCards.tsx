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

// Layout mobile-first a 3 card, con spazi per grandi illustrazioni laterali (desktop)
// Ombra 3D e bordo coerenti con il design system (usa variabili HSL definite in index.css)
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

      {/* Stacked layout con allineamento alternato e spazi immagine */}
      <div className="space-y-5 md:space-y-8">
        {items.slice(0, 3).map((item, idx) => {
          const even = idx % 2 === 0;

          return (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center"
            >
              {/* Spazio riservato per illustrazione a sinistra (solo desktop) */}
              {even && (
                <div className="hidden md:block md:col-span-4">
                  <div className="w-full h-44 lg:h-64 rounded-xl" aria-hidden>
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
                  even ? "md:col-span-8" : "md:col-span-8 md:col-start-1 lg:col-start-2"
                } bg-white rounded-2xl border border-[hsl(var(--form-border))] p-6 md:p-8 lg:p-10 shadow-[0_3px_0_0_hsl(var(--form-shadow))] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all hover:-translate-y-0.5`}
              >
                <h3 className="text-xl md:text-2xl font-semibold font-['Inter'] text-gray-900 mb-2 md:mb-3">
                  {item.title}
                </h3>
                <p className="text-base md:text-lg font-['Inter'] text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </article>

              {/* Spazio riservato per illustrazione a destra (solo desktop) */}
              {!even && (
                <div className="hidden md:block md:col-span-4">
                  <div className="w-full h-44 lg:h-64 rounded-xl" aria-hidden>
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
    </section>
  );
};

export default ThreeFeatureCards;
