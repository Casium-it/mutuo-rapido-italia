import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Shield } from "lucide-react";

const SimulatorMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl p-6 md:p-8 lg:p-10 w-full h-full relative overflow-hidden flex flex-col justify-center" style={{ boxShadow: '0 8px 32px rgba(190, 184, 174, 0.4)' }}>
        
        {/* 3 Indicatori Principali */}
        <div className="space-y-4 md:space-y-6 lg:space-y-7">
          
          {/* 1. Difficoltà di ottenimento */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#245C4F]/10 rounded-xl">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base md:text-base font-semibold text-gray-900">Difficoltà</div>
                <div className="text-sm md:text-sm text-gray-600">Media</div>
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
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#245C4F]/10 rounded-xl">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base md:text-base font-semibold text-gray-900">Banche</div>
                <div className="text-sm md:text-sm text-gray-600">Disponibili</div>
              </div>
            </div>
            <div className="text-2xl md:text-2xl font-bold text-[#245C4F]">4</div>
          </div>

          {/* 3. Tasso stimato */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-[#245C4F]/10 rounded-xl">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#245C4F]" />
              </div>
              <div>
                <div className="text-base md:text-base font-semibold text-gray-900">Tasso</div>
                <div className="text-sm md:text-sm text-gray-600">Migliore</div>
              </div>
            </div>
            <div className="text-2xl md:text-2xl font-bold text-[#245C4F]">3.2%</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimulatorMockup;