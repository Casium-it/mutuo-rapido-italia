import React from "react";
import { Check } from "lucide-react";

const AnalysisDeepMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 lg:p-10 w-full h-full border border-gray-100 flex flex-col justify-center">
        {/* Platform-like header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-base md:text-lg font-medium text-gray-900">Analisi Profilo</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">In tempo reale</span>
          </div>
        </div>
        
        {/* Analysis Cards */}
        <div className="space-y-3 md:space-y-4">
          {/* Mutuo richiesto */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#245C4F] rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Mutuo richiesto</div>
                  <div className="text-xs text-gray-600">LTV verificato</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#245C4F]">85%</div>
                <div className="text-xs text-gray-500">del valore</div>
              </div>
            </div>
          </div>

          {/* Categoria lavorativa */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Categoria lavorativa</div>
                  <div className="text-xs text-gray-600">Validato da sistema</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">P.IVA</div>
                <div className="text-xs text-gray-500">Libero prof.</div>
              </div>
            </div>
          </div>

          {/* Tempo ottenimento */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Tempo stimato</div>
                  <div className="text-xs text-gray-600">Basato su storico</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">45</div>
                <div className="text-xs text-gray-500">giorni</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Analisi completata</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#245C4F] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#245C4F] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#245C4F] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDeepMockup;