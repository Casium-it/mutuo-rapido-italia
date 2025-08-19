import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Shield } from "lucide-react";

const SimulatorMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl p-6 md:p-8 lg:p-10 w-full h-full relative overflow-hidden flex flex-col justify-center" style={{ boxShadow: '0 8px 32px rgba(190, 184, 174, 0.4)' }}>
        
        {/* Platform-like header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-base md:text-lg font-medium text-gray-900">Simulazione Mutuo</h3>
          <button className="text-xs bg-[#245C4F] text-white px-2 py-1 rounded hover:bg-[#1e4f44]">
            Modifica
          </button>
        </div>
        
        {/* 3 Indicatori Principali */}
        <div className="space-y-3 md:space-y-4">
          
          {/* 1. Difficoltà di ottenimento */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#245C4F]" />
                <span className="text-sm font-medium text-gray-900">Difficoltà</span>
              </div>
              <button className="text-xs text-[#245C4F] hover:underline">Modifica</button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="w-1/2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <span className="text-sm font-medium text-yellow-600">Media</span>
            </div>
          </div>

          {/* 2. Numero di banche */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#245C4F]" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Banche disponibili</div>
                  <div className="text-xs text-gray-600">Su 47 analizzate</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#245C4F]">4</div>
                <button className="text-xs text-[#245C4F] hover:underline">Vedi tutte</button>
              </div>
            </div>
          </div>

          {/* 3. Tasso stimato */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#245C4F]" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Tasso migliore</div>
                  <div className="text-xs text-gray-600">Intesa Sanpaolo</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#245C4F]">3.2%</div>
                <div className="text-xs text-green-600">-0.3% vs media</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button className="flex-1 bg-[#245C4F] text-white text-xs py-2 px-3 rounded hover:bg-[#1e4f44]">
              Confronta Offerte
            </button>
            <button className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              Salva
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimulatorMockup;