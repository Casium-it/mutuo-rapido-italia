import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Handshake, MapPin, BadgeEuro } from "lucide-react";

type Benefit = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

interface BenefitsSectionProps {
  onCtaClick?: () => void;
}

const benefits: Benefit[] = [
  {
    Icon: CheckCircle2,
    title: "Il miglior Mutuo",
    description:
      "Confrontiamo e parliamo con più di 100 banche senza che tu debba andare in filiale",
  },
  {
    Icon: Handshake,
    title: "Trasparenza",
    description:
      "La trasparenza è al primo posto, niente termini incomprensibili",
  },
  {
    Icon: MapPin,
    title: "Esperti su tutta Italia",
    description:
      "Rete di 90+ mediatori partner esperti su tutta Italia, pronti ad aiutarti",
  },
  {
    Icon: BadgeEuro,
    title: "Mutui per ogni esigenza",
    description:
      "Mutuo difficile? Partita IVA? Segnalazioni? Ci pensiamo noi, siamo esperti in questo",
  },
];

export function BenefitsSection({ onCtaClick }: BenefitsSectionProps) {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="mb-16 rounded-2xl border border-border bg-gradient-to-b from-background to-muted/30 p-6 md:p-8 animate-fade-in"
    >
      <header className="mb-6 text-center">
        <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold gradient-text">
          Perché scegliere GoMutuo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Un approccio moderno, chiaro e personalizzato per il tuo mutuo
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {benefits.map(({ Icon, title, description }, i) => (
          <article
            key={i}
            className="group rounded-xl border border-border bg-card text-card-foreground p-5 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-semibold font-['Inter']">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={onCtaClick} className="rounded-xl shadow-sm">
          Scopri come funziona
        </Button>
      </div>
    </section>
  );
}
