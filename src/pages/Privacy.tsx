import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoginButton } from "@/components/LoginButton";
const Privacy = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen flex flex-col bg-[#f7f5f2]">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <Logo />
        </div>
        <Button variant="ghost" onClick={() => navigate("/")} className="text-gray-700 hover:text-[#245C4F] font-medium transition-colors">
          Torna alla Home
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="bg-white rounded-lg border border-[#BEB8AE] p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#245C4F] mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Ultimo aggiornamento: 3 Giugno 2025
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">1. Titolare del Trattamento</h2>
              <p>
                Il Titolare del trattamento dei dati personali è:
              </p>
              <div className="bg-[#F8F4EF] p-4 rounded-lg mt-3">
                <p className="font-medium"></p>
                <p></p>
                <p></p>
                <p>Email: info@gomutuo.it</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">2. Dati Raccolti</h2>
              <p>GoMutuo.it raccoglie e tratta le seguenti categorie di dati personali:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Dati anagrafici e di contatto:</strong> nome, cognome, codice fiscale, data di nascita, indirizzo di residenza, numero di telefono, indirizzo email</li>
                <li><strong>Dati economici e finanziari:</strong> reddito, situazione lavorativa, patrimonio, eventuali finanziamenti in corso, capacità di rimborso</li>
                <li><strong>Dati relativi all'immobile:</strong> tipologia, valore, ubicazione, caratteristiche dell'immobile di interesse</li>
                <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, tempo di permanenza sul sito</li>
                <li><strong>Cookie tecnici e di profilazione:</strong> per migliorare l'esperienza utente e fornire servizi personalizzati</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">3. Finalità del Trattamento</h2>
              <p>I dati personali vengono trattati per le seguenti finalità:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Simulazione mutuo:</strong> per fornire calcoli personalizzati e analisi di fattibilità</li>
                <li><strong>Consulenza personalizzata:</strong> per offrire consigli specifici in base alla situazione finanziaria</li>
                <li><strong>Ricerca offerte:</strong> per identificare le migliori proposte di mutuo disponibili sul mercato</li>
                <li><strong>Assistenza nella pratica:</strong> per supportare l'utente nell'iter di richiesta del mutuo</li>
                <li><strong>Marketing diretto:</strong> per inviare comunicazioni commerciali relative ai nostri servizi (previo consenso)</li>
                <li><strong>Adempimenti legali:</strong> per rispettare gli obblighi di legge in materia di antiriciclaggio e trasparenza</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">4. Base Giuridica</h2>
              <p>Il trattamento dei dati si basa su:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Consenso dell'interessato</strong> per le attività di marketing e profilazione</li>
                <li><strong>Esecuzione di misure precontrattuali</strong> per la fornitura del servizio di simulazione e consulenza</li>
                <li><strong>Legittimo interesse</strong> per il miglioramento dei servizi e l'analisi statistica</li>
                <li><strong>Obbligo legale</strong> per gli adempimenti normativi richiesti</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">5. Modalità di Trattamento</h2>
              <p>
                I dati personali sono trattati con strumenti informatici e telematici, con modalità organizzative 
                e con logiche strettamente correlate alle finalità indicate. Sono adottate misure di sicurezza 
                tecniche e organizzative per proteggere i dati da accessi non autorizzati, perdite o distruzioni.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">6. Comunicazione e Diffusione</h2>
              <p>I dati potranno essere comunicati a:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Istituti di credito:</strong> per la ricerca e presentazione delle migliori offerte di mutuo</li>
                <li><strong>Partner commerciali:</strong> mediatori creditizi, consulenti finanziari, notai</li>
                <li><strong>Fornitori di servizi:</strong> per l'erogazione di servizi tecnici (hosting, CRM, email marketing)</li>
                <li><strong>Autorità competenti:</strong> quando richiesto per legge o per la tutela dei diritti</li>
              </ul>
              <p className="mt-3">
                I dati non saranno mai diffusi senza il preventivo consenso dell'interessato.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">7. Conservazione</h2>
              <p>
                I dati personali saranno conservati per il tempo strettamente necessario al raggiungimento 
                delle finalità per cui sono stati raccolti:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Dati per simulazione:</strong> fino a 24 mesi dalla raccolta</li>
                <li><strong>Dati per consulenza:</strong> fino a 10 anni per adempimenti fiscali</li>
                <li><strong>Dati di marketing:</strong> fino alla revoca del consenso</li>
                <li><strong>Dati di navigazione:</strong> massimo 24 mesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">8. Diritti dell'Interessato</h2>
              <p>L'interessato ha diritto di:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Accesso:</strong> ottenere informazioni sui propri dati trattati</li>
                <li><strong>Rettifica:</strong> correggere dati inesatti o incompleti</li>
                <li><strong>Cancellazione:</strong> richiedere la rimozione dei propri dati</li>
                <li><strong>Limitazione:</strong> limitare il trattamento in determinate circostanze</li>
                <li><strong>Portabilità:</strong> ricevere i propri dati in formato strutturato</li>
                <li><strong>Opposizione:</strong> opporsi al trattamento per motivi legittimi</li>
                <li><strong>Revoca consenso:</strong> revocare il consenso prestato in qualsiasi momento</li>
              </ul>
              <p className="mt-3">
                Per esercitare questi diritti, è possibile contattare il Titolare all'indirizzo 
                <strong> privacy@gomutuo.it</strong> o utilizzare i moduli disponibili sul sito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">9. Cookie</h2>
              <p>
                Il sito utilizza cookie tecnici necessari per il funzionamento e cookie di profilazione 
                per migliorare l'esperienza utente. È possibile gestire le preferenze sui cookie 
                attraverso il banner presente sul sito o le impostazioni del browser.
              </p>
              <p className="mt-3">
                Per maggiori informazioni, consultare la nostra Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">10. Trasferimenti Internazionali</h2>
              <p>
                I dati potrebbero essere trasferiti in paesi al di fuori dell'Unione Europea solo 
                in presenza di adeguate garanzie di protezione, come decisioni di adeguatezza 
                della Commissione Europea o clausole contrattuali standard.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">11. Minori</h2>
              <p>
                I nostri servizi non sono destinati a minori di 16 anni. Non raccogliamo 
                consapevolmente dati personali di minori senza il consenso dei genitori o tutori legali.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">12. Reclami</h2>
              <p>
                In caso di violazione della normativa sulla protezione dei dati, l'interessato 
                ha diritto di presentare reclamo al Garante per la Protezione dei Dati Personali:
              </p>
              <div className="bg-[#F8F4EF] p-4 rounded-lg mt-3">
                <p><strong>Garante per la Protezione dei Dati Personali</strong></p>
                <p>Piazza Venezia, 11 - 00187 Roma</p>
                <p>Tel: +39 06 69677.1</p>
                <p>Email: garante@gpdp.it</p>
                <p>Sito web: www.garanteprivacy.it</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">13. Modifiche alla Privacy Policy</h2>
              <p>
                Questa Privacy Policy può essere modificata periodicamente. Le modifiche saranno 
                pubblicate su questa pagina con indicazione della data di ultimo aggiornamento. 
                Si consiglia di consultare regolarmente questa pagina per rimanere informati 
                su eventuali cambiamenti.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#245C4F] mb-4">14. Contatti</h2>
              <p>
                Per qualsiasi domanda riguardante questa Privacy Policy o il trattamento dei 
                dati personali, è possibile contattarci:
              </p>
              <div className="bg-[#F8F4EF] p-4 rounded-lg mt-3">
                <p><strong>Email:</strong> privacy@gomutuo.it</p>
                
                
                
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE] relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center mb-4">
            <div className="flex gap-4 items-center">
              <button onClick={() => navigate("/privacy")} className="text-sm text-gray-600 hover:text-[#245C4F]">
                Privacy
              </button>
              <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
              <LoginButton />
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">© 2025 GoMutuo - Tutti i diritti riservati</p>
        </div>
      </footer>
    </div>;
};
export default Privacy;