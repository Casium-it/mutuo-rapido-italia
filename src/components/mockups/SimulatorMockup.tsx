import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Shield } from "lucide-react";

const SimulatorMockup: React.FC = () => {
  return (
    <div className="w-[400px] h-[400px] flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full h-full relative overflow-hidden flex flex-col justify-center">
        
        {/* 3 Indicatori Principali */}
        <div className="space-y-6 mb-8">
          
          {/* 1. Difficoltà di ottenimento */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#245C4F]/10 rounded-lg">
                <Shield className="w-5 h-5 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Difficoltà</div>
                <div className="text-xs text-gray-500">Bassa</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div className="w-4 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* 2. Numero di banche */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#245C4F]/10 rounded-lg">
                <Building2 className="w-5 h-5 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Banche</div>
                <div className="text-xs text-gray-500">Disponibili</div>
              </div>
            </div>
            <div className="text-xl font-bold text-[#245C4F]">12</div>
          </div>

          {/* 3. Tasso stimato */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#245C4F]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Tasso</div>
                <div className="text-xs text-gray-500">Migliore</div>
              </div>
            </div>
            <div className="text-xl font-bold text-[#245C4F]">3.2%</div>
          </div>
        </div>

        {/* Risultato Prominente */}
        <div className="bg-[#245C4F]/5 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Importo massimo</div>
          <div className="text-2xl font-bold text-[#245C4F]">€ 280.000</div>
          <div className="text-xs text-green-600 mt-1">✓ Mutuo fattibile</div>
        </div>

      </div>
    </div>
  );
};

export default SimulatorMockup;