import React from "react";
import { Home, Briefcase, Clock, Users } from "lucide-react";

const AnalysisDeepMockup: React.FC = () => {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 md:p-6 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
          Analisi della tua situazione
        </h3>
      </div>

      {/* Parametri chiave */}
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Mutuo richiesto */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#2C967F] bg-opacity-10 rounded-full flex items-center justify-center">
              <Home className="w-4 h-4 text-[#2C967F]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-gray-900">Mutuo richiesto</p>
              <p className="text-xs md:text-sm text-gray-600">85% del valore immobile</p>
            </div>
          </div>

          {/* Categoria lavorativa */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#7019E1] bg-opacity-10 rounded-full flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#7019E1]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-gray-900">Categoria lavorativa</p>
              <p className="text-xs md:text-sm text-gray-600">P.IVA – libero professionista ristorazione</p>
            </div>
          </div>

          {/* Tempo ottenimento */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#2C967F] bg-opacity-10 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#2C967F]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-gray-900">Tempo ottenimento stimato</p>
              <p className="text-xs md:text-sm text-gray-600">45 giorni</p>
            </div>
          </div>

          {/* Figli a carico */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-[#7019E1] bg-opacity-10 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-[#7019E1]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-gray-900">Figli a carico</p>
              <p className="text-xs md:text-sm text-gray-600">2</p>
            </div>
          </div>
        </div>

        {/* Sezione evidenziata */}
        <div className="bg-[#ADEE67] bg-opacity-20 border border-[#ADEE67] border-opacity-40 rounded-lg p-3 mt-4">
          <p className="text-sm font-medium text-gray-900 text-center">
            Analisi approfondita dei fattori → ottenibilità reale
          </p>
        </div>

        {/* Pulsante CTA */}
        <div className="flex justify-end pt-2">
          <button className="px-4 py-2 bg-[#2C967F] text-white text-sm font-medium rounded-lg shadow-sm hover:bg-[#245C4F] transition-colors">
            Prosegui con un mediatore
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDeepMockup;