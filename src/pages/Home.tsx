import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/utils/analytics";
import { Footer } from "@/components/Footer";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast()

  const handleSimulazioneAvanzataClick = () => {
    trackEvent('home_page_button_click', {
      button_name: 'Simulazione Avanzata',
      page_location: 'home_page'
    });
    navigate('/simulazione-avanzata');
  };

  const handleSimulazioniClick = () => {
    trackEvent('home_page_button_click', {
      button_name: 'Simulazioni',
      page_location: 'home_page'
    });
    navigate('/simulazioni');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      <main className="flex-grow py-12 md:py-24">
        <div className="container mx-auto px-4">
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#245C4F] mb-4">
              Benvenuto in GoMutuo
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Il tuo strumento per trovare il mutuo perfetto. Inizia subito la tua simulazione!
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">
                  Simulazione Avanzata
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Personalizza ogni dettaglio del tuo mutuo.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  La simulazione avanzata ti permette di esplorare tutte le opzioni disponibili e
                  trovare la soluzione più adatta alle tue esigenze.
                </p>
                <Button className="w-full bg-[#245C4F] hover:bg-[#1e4f44] text-white" onClick={handleSimulazioneAvanzataClick}>
                  Inizia Simulazione Avanzata
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">
                  Le Tue Simulazioni
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Accedi e gestisci le tue simulazioni salvate.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  Visualizza, modifica o elimina le tue simulazioni precedenti. Trova facilmente
                  le informazioni che ti servono.
                </p>
                <Button className="w-full bg-[#245C4F] hover:bg-[#1e4f44] text-white" onClick={handleSimulazioniClick}>
                  Vai alle Simulazioni
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
