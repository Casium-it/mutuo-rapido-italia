import React from "react";

const AnalysisDeepMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 w-full h-full border border-gray-100 flex flex-col justify-center">
        {/* Platform-like header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg md:text-xl font-medium text-gray-900">Analisi Profilo</h3>
          <div className="w-2 h-2 bg-[#245C4F] rounded-full"></div>
        </div>
        
        {/* Analysis Cards */}
        <div className="space-y-5">
          {/* Mutuo richiesto */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-[#245C4F] rounded-full"></div>
                <div className="text-base font-medium text-gray-900">Mutuo richiesto</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#245C4F]">85%</div>
                <div className="text-sm text-gray-500">del valore</div>
              </div>
            </div>
          </div>

          {/* Categoria lavorativa */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-[#245C4F] rounded-full"></div>
                <div className="text-base font-medium text-gray-900">Categoria lavorativa</div>
              </div>
              <div className="text-right">
                <div className="text-base font-medium text-gray-700">P.IVA</div>
                <div className="text-sm text-gray-500">Libero prof.</div>
              </div>
            </div>
          </div>

          {/* Tempo stimato */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-[#245C4F] rounded-full"></div>
                <div className="text-base font-medium text-gray-900">Tempo stimato</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#245C4F]">45</div>
                <div className="text-sm text-gray-500">giorni</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDeepMockup;