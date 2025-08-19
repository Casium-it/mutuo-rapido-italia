import React from "react";
import { Check } from "lucide-react";

const AnalysisDeepMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 lg:p-10 w-full h-full border border-gray-100">        
        <div className="space-y-4 md:space-y-6 lg:space-y-7">
          {/* Mutuo richiesto */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-green-100 rounded-xl">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-base md:text-lg font-semibold text-gray-900">Mutuo richiesto</div>
                <div className="text-sm md:text-base text-gray-600">85% del valore immobile</div>
              </div>
            </div>
          </div>

          {/* Categoria lavorativa */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-green-100 rounded-xl">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-base md:text-lg font-semibold text-gray-900">Categoria lavorativa</div>
                <div className="text-sm md:text-base text-gray-600">P.IVA – libero professionista</div>
              </div>
            </div>
          </div>

          {/* Tempo ottenimento */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-green-100 rounded-xl">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-base md:text-lg font-semibold text-gray-900">Tempo ottenimento</div>
                <div className="text-sm md:text-base text-gray-600">45 giorni stimati</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDeepMockup;