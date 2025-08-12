import React from "react";
import { CheckCircle2, Rocket, Handshake } from "lucide-react";

export type FeatureCardItem = {
  title: string;
  description: string;
  imgSrc?: string; // SVG/Vectors che verranno forniti successivamente
  alt?: string;
};

interface ThreeFeatureCardsProps {
  items: FeatureCardItem[];
}

// Sezione a 3 card, mobile-first, con ombra 3D come i pulsanti e supporto per immagini vettoriali
const ThreeFeatureCards: React.FC<ThreeFeatureCardsProps> = ({ items }) => {
  const fallbackIcons = [CheckCircle2, Rocket, Handshake];

  return (
    <section
      aria-labelledby="vantaggi-title"
      className="mt-10 md:mt-14"
    >
      <div className="rounded-2xl bg-[hsl(var(--form-placeholder))] p-6 md:p-8">
        <header className="mb-6 md:mb-8 text-center">
          <h2
            id="vantaggi-title"
            className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--form-green))]"
          >
            Perché scegliere <span className="gradient-text">GoMutuo</span>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.slice(0, 3).map((item, idx) => {
            const Icon = fallbackIcons[idx % fallbackIcons.length];
            return (
              <article
                key={idx}
                className="bg-white rounded-xl border border-[hsl(var(--form-border))] p-5 md:p-6 shadow-[0_3px_0_0_hsl(var(--form-shadow))] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all hover:-translate-y-0.5 focus-within:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[hsl(var(--form-green))]/10 border border-[hsl(var(--form-border))] grid place-items-center">
                    {item.imgSrc ? (
                      <img
                        src={item.imgSrc}
                        alt={item.alt || item.title}
                        className="w-10 h-10 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-[hsl(var(--form-green))]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold font-['Inter'] text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm font-['Inter'] text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ThreeFeatureCards;
