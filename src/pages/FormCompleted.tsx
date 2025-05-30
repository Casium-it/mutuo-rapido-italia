import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, TrendingUp, Building2, Target, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function FormCompleted() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keySummary, setKeySummary] = useState<Record<string, any>>({});

  // Controlla se l'utente è arrivato a questa pagina dopo aver completato il form
  const submissionData = location.state?.submissionData;
  useEffect(() => {
    // Se l'utente accede direttamente senza aver completato un form, reindirizza alla home
    if (!submissionData) {
      navigate("/");
      return;
    }

    // Estrai i dati principali per il riepilogo
    if (submissionData.responses) {
      const summary: Record<string, any> = {};

      // Mappa delle domande chiave che vogliamo mostrare nel riepilogo
      const keyQuestions = {
        'anticipo_disponibile': 'Anticipo disponibile',
        'importo_mutuo': 'Importo mutuo',
        'situazione_abitativa': 'Situazione abitativa',
        'eta': 'Età',
        'reddito_mensile': 'Reddito mensile',
        'tipo_contratto': 'Tipo di contratto',
        'stato_civile': 'Stato civile'
      };

      // Estrai le risposte chiave
      Object.entries(submissionData.responses).forEach(([questionId, placeholders]) => {
        const keyName = Object.keys(keyQuestions).find(key => questionId.includes(key));
        if (keyName) {
          const placeholderKey = Object.keys(placeholders)[0];
          const value = placeholders[placeholderKey];

          // Formatta i valori in base al tipo
          if (typeof value === 'string' && !isNaN(Number(value)) && (questionId.includes('importo') || questionId.includes('reddito') || questionId.includes('anticipo'))) {
            summary[keyQuestions[keyName]] = formatCurrency(Number(value));
          } else {
            summary[keyQuestions[keyName]] = value;
          }
        }
      });
      setKeySummary(summary);
    }
  }, [submissionData, navigate]);
  if (!submissionData) {
    return null; // Non mostrare nulla durante il reindirizzamento
  }
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-[#245C4F]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Grazie per aver completato il form!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Abbiamo ricevuto la tue informazioni e abbiamo elaborato una simulazione completa del tuo mutuo personalizzata per te.
          </p>
        </div>

        {/* Riepilogo delle risposte */}
        <div className="bg-[#F8F4EF] p-6 rounded-lg shadow-sm w-full max-w-2xl mb-8">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-[#245C4F] mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Riepilogo della tua richiesta
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {Object.entries(keySummary).map(([key, value], index) => (
              <div key={index} className="py-3 flex justify-between">
                <span className="font-medium text-gray-700">{key}</span>
                <span className="text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiche Mutuo */}
        <div className="bg-[#F8F4EF] p-6 rounded-lg shadow-sm w-full max-w-2xl mb-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-5 w-5 text-[#245C4F] mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Analisi del tuo mutuo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Range Mutuo */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#245C4F]" />
                <span className="text-sm font-medium text-gray-600">Range mutuo disponibile</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                <span style={{ filter: 'blur(2px)', userSelect: 'none' }}>
                  €100.000 - €300.000
                </span>
              </div>
            </div>

            {/* Probabilità Mutuo */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-[#245C4F]" />
                <span className="text-sm font-medium text-gray-600">Probabilità di approvazione</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                <span style={{ filter: 'blur(1.5px)', userSelect: 'none' }}>
                  89%
                </span>
              </div>
            </div>

            {/* Banche Possibili */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#245C4F]" />
                <span className="text-sm font-medium text-gray-600">Banche disponibili</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                4
              </div>
            </div>

            {/* Banca più conveniente */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#245C4F]" />
                <span className="text-sm font-medium text-gray-600">Banca più conveniente</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                <span style={{ filter: 'blur(2px)', userSelect: 'none' }}>
                  Unicredit Bank
                </span>
              </div>
            </div>
          </div>

          {/* Banca con probabilità più alta */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Banca con probabilità più alta</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                <span style={{ filter: 'blur(2px)', userSelect: 'none' }}>
                  Intesa Sanpaolo
                </span>
              </div>
            </div>
          </div>

          {/* Note informativa */}
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              * I dati mostrati sono una stima preliminare basata sulle informazioni fornite
            </p>
          </div>
        </div>

        {/* Cosa succede adesso */}
        <div className="bg-[#F8F4EF] p-6 rounded-lg shadow-sm w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cosa succede adesso?
          </h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[#245C4F] text-white h-6 w-6 rounded-full flex items-center justify-center mt-0.5">
                1
              </div>
              <div>
                <span className="font-medium">Analisi della tua richiesta</span>
                <p className="text-gray-600 mt-1">
                  Il nostro team analizzerà le informazioni fornite per trovare le migliori opzioni di mutuo per te.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[#245C4F] text-white h-6 w-6 rounded-full flex items-center justify-center mt-0.5">
                2
              </div>
              <div>
                <span className="font-medium">Contatto iniziale</span>
                <p className="text-gray-600 mt-1">
                  Ti contatteremo entro 24-48 ore lavorative per discutere le opzioni disponibili.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[#245C4F] text-white h-6 w-6 rounded-full flex items-center justify-center mt-0.5">
                3
              </div>
              <div>
                <span className="font-medium">Proposta personalizzata</span>
                <p className="text-gray-600 mt-1">
                  Riceverai una proposta su misura basata sulle tue esigenze specifiche.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button 
            className="bg-[#245C4F] hover:bg-[#1a453b] text-white py-2.5 px-6 rounded-md flex-1" 
            onClick={() => navigate("/")}
          >
            Torna alla home <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoMutuo. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
