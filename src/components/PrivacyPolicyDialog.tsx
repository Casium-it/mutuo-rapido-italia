import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[calc(100vw-2rem)] max-w-4xl max-h-[80vh] overflow-hidden p-0 gap-0 flex flex-col"
        hideCloseButton={false}
      >
        <DialogHeader className="px-6 py-4 border-b bg-[#f8f5f1] sticky top-0 z-10">
          <DialogTitle className="text-xl font-bold text-[#245C4F]">
            Privacy Policy - GoMutuo
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Informativa sul trattamento dei dati personali
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-6 text-sm leading-relaxed overflow-y-auto flex-1">
          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">1. Titolare del Trattamento</h2>
            <p className="text-gray-700">
              Il Titolare del trattamento dei dati è GoMutuo, con sede in Italia, contattabile tramite i canali ufficiali del sito web.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">2. Tipologie di Dati Raccolti</h2>
            <p className="text-gray-700 mb-2">
              Raccogliamo i seguenti tipi di dati personali:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Dati anagrafici (nome, cognome)</li>
              <li>Dati di contatto (numero di telefono, email)</li>
              <li>Informazioni economiche e finanziarie per la simulazione mutuo</li>
              <li>Dati relativi all'immobile di interesse</li>
              <li>Cookie e dati di navigazione</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">3. Finalità del Trattamento</h2>
            <p className="text-gray-700 mb-2">
              I tuoi dati vengono trattati per le seguenti finalità:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Fornitura del servizio di simulazione mutuo</li>
              <li>Invio di proposte personalizzate tramite WhatsApp</li>
              <li>Contatto telefonico per consulenza gratuita (se richiesta)</li>
              <li>Miglioramento dei servizi offerti</li>
              <li>Adempimenti di legge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">4. Base Giuridica</h2>
            <p className="text-gray-700">
              Il trattamento è basato sul consenso liberamente prestato per l'erogazione dei servizi richiesti 
              e per l'invio di comunicazioni commerciali tramite WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">5. Conservazione dei Dati</h2>
            <p className="text-gray-700">
              I dati personali verranno conservati per il tempo strettamente necessario alle finalità per le quali 
              sono stati raccolti e comunque non oltre 24 mesi dalla raccolta, salvo diversi obblighi di legge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">6. Comunicazione e Diffusione</h2>
            <p className="text-gray-700">
              I dati potranno essere comunicati a banche e istituti di credito partner per la ricerca delle migliori 
              offerte di mutuo. Non avviene alcuna diffusione dei dati personali.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">7. Diritti dell'Interessato</h2>
            <p className="text-gray-700 mb-2">
              Hai il diritto di:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiedere la rettifica o la cancellazione</li>
              <li>Richiedere la limitazione del trattamento</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Proporre reclamo all'Autorità Garante</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">8. Cookie</h2>
            <p className="text-gray-700">
              Il sito utilizza cookie tecnici necessari al funzionamento e cookie analitici per migliorare 
              l'esperienza utente. È possibile gestire le preferenze sui cookie tramite le impostazioni del browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#245C4F] mb-3">9. Contatti</h2>
            <p className="text-gray-700">
              Per esercitare i tuoi diritti o per qualsiasi chiarimento relativo al trattamento dei dati, 
              puoi contattarci tramite i canali ufficiali disponibili sul sito web.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
