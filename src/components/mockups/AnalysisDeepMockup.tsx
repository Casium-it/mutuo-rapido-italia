import React from "react";
import { Home, Briefcase, Clock } from "lucide-react";

const AnalysisDeepMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 lg:p-10 w-full h-full border border-gray-100">
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 md:mb-6 lg:mb-8 text-gray-900">
          Analisi della tua situazione
        </h3>
        
        <div className="space-y-4 md:space-y-6 lg:space-y-7">
          {/* Mutuo richiesto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#245C4F]/10 rounded-xl">
                <Home className="w-5 h-5 md:w-6 md:h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base md:text-lg font-semibold text-gray-900">Mutuo richiesto</div>
                <div className="text-sm md:text-base text-gray-600">85% del valore immobile</div>
              </div>
            </div>
          </div>

          {/* Categoria lavorativa */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#245C4F]/10 rounded-xl">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base md:text-lg font-semibold text-gray-900">Categoria lavorativa</div>
                <div className="text-sm md:text-base text-gray-600">P.IVA – libero professionista</div>
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
                <div className="text-base md:text-lg font-semibold text-gray-900">Tempo ottenimento</div>
                <div className="text-sm md:text-base text-gray-600">45 giorni stimati</div>
              </div>
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#245C4F]">45gg</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDeepMockup;