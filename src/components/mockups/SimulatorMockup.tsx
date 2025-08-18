import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Shield } from "lucide-react";

const SimulatorMockup: React.FC = () => {
  return (
    <div className="w-[400px] h-[400px] flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl p-10 w-full h-full relative overflow-hidden flex flex-col justify-center" style={{ boxShadow: '0 8px 32px rgba(190, 184, 174, 0.4)' }}>
        
        {/* 3 Indicatori Principali */}
        <div className="space-y-7 mb-8">
          
          {/* 1. Difficoltà di ottenimento */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#245C4F]/10 rounded-xl">
                <Shield className="w-6 h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">Difficoltà</div>
                <div className="text-sm text-gray-600">Media</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-20 h-3 bg-gray-200 rounded-full">
                <div className="w-10 h-3 bg-yellow-500 rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>

          {/* 2. Numero di banche */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#245C4F]/10 rounded-xl">
                <Building2 className="w-6 h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">Banche</div>
                <div className="text-sm text-gray-600">Disponibili</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#245C4F]">4</div>
          </div>

          {/* 3. Tasso stimato */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#245C4F]/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">Tasso</div>
                <div className="text-sm text-gray-600">Migliore</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#245C4F]">3.2%</div>
          </div>
        </div>

        {/* Risultato Prominente - Ridotto */}
        <div className="bg-gradient-to-br from-[#245C4F]/8 to-[#245C4F]/12 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-600 mb-1 font-medium">Importo massimo</div>
          <div className="text-xl font-bold text-[#245C4F]">€ 280.000</div>
        </div>

      </div>
    </div>
  );
};

export default SimulatorMockup;