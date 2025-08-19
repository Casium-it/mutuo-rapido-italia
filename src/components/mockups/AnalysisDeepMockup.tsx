import React from "react";
import { Home, Briefcase, Clock, Users } from "lucide-react";

const AnalysisDeepMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 w-full h-full border border-gray-100 overflow-y-auto">
        <h3 className="text-lg md:text-lg font-semibold mb-3 md:mb-4 text-gray-900">
          Analisi della tua situazione
        </h3>
        
        {/* Parametri chiave */}
        <div className="space-y-2 md:space-y-3">
          {/* Mutuo richiesto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#245C4F]/10 rounded-xl">
                <Home className="w-5 h-5 md:w-6 md:h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base md:text-base font-semibold text-gray-900">Mutuo richiesto</div>
                <div className="text-sm md:text-sm text-gray-600">85% del valore immobile</div>
              </div>
            </div>
          </div>

          {/* Categoria lavorativa */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#7019E1]/10 rounded-xl">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-[#7019E1]" />
              </div>
              <div>
                <div className="text-base md:text-base font-semibold text-gray-900">Categoria lavorativa</div>
                <div className="text-sm md:text-sm text-gray-600">P.IVA – libero professionista</div>
              </div>
            </div>
          </div>

          {/* Tempo ottenimento */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#245C4F]/10 rounded-xl">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base md:text-base font-semibold text-gray-900">Tempo ottenimento</div>
                <div className="text-sm md:text-sm text-gray-600">45 giorni stimati</div>
              </div>
            </div>
            <div className="text-2xl md:text-2xl font-bold text-[#245C4F]">45gg</div>
          </div>

          {/* Figli a carico */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#7019E1]/10 rounded-xl">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-[#7019E1]" />
              </div>
              <div>
                <div className="text-base md:text-base font-semibold text-gray-900">Figli a carico</div>
                <div className="text-sm md:text-sm text-gray-600">Nucleo familiare</div>
              </div>
            </div>
            <div className="text-2xl md:text-2xl font-bold text-[#7019E1]">2</div>
          </div>
        </div>

        {/* Sezione evidenziata */}
        <div className="bg-[#245C4F]/5 border border-[#245C4F]/20 rounded-lg p-3 md:p-4 mt-4 md:mt-6">
          <p className="text-sm md:text-sm font-medium text-gray-900 text-center">
            Analisi approfondita dei fattori → ottenibilità reale
          </p>
        </div>

        {/* Action Section */}
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-600 mb-2">Prosegui con la consulenza specializzata</p>
            <div className="w-full h-7 md:h-8 bg-[#245C4F]/10 rounded-lg flex items-center justify-center">
              <span className="text-[#245C4F] font-medium text-xs md:text-sm">Contatta un mediatore</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDeepMockup;