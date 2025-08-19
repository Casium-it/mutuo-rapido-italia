import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Shield } from "lucide-react";

const BankComparisonMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 w-full h-full border border-gray-100 overflow-y-auto">
        {/* Platform-like header with filters */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <h3 className="text-base md:text-lg font-medium text-gray-900">Confronto Banche</h3>
          <div className="flex items-center gap-2">
            <select className="text-xs border border-gray-300 rounded px-2 py-1">
              <option>Ordina per: Tasso</option>
            </select>
            <button className="text-xs text-[#245C4F] hover:underline">Filtri</button>
          </div>
        </div>
        
        {/* Bank 1 - Best Option */}
        <div className="border-2 border-[#245C4F] rounded-lg p-3 md:p-4 mb-2 md:mb-3 bg-[#245C4F]/5">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-3 h-3 accent-[#245C4F]" />
              <h4 className="font-semibold text-gray-900 text-base md:text-base">Intesa Sanpaolo</h4>
            </div>
            <Badge className="bg-[#245C4F]/10 text-[#245C4F] border-[#245C4F]/20">
              Migliore Offerta
            </Badge>
          </div>
          <div className="text-2xl md:text-2xl font-bold text-[#245C4F] mb-2">1.82%</div>
          <div className="flex items-center gap-1 mb-3">
            <TrendingUp className="w-4 h-4 text-[#245C4F]" />
            <span className="text-[#245C4F] font-medium">-0.3% vs media</span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(star => (
              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-600 ml-2">4.8/5</span>
          </div>
          <div className="space-y-2 text-sm md:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rata mensile:</span>
              <span className="font-medium">€ 1.247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spese istruttoria:</span>
              <span className="font-medium">€ 0</span>
            </div>
          </div>
          <button className="w-full mt-2 bg-[#245C4F] text-white text-xs py-2 rounded hover:bg-[#1e4f44]">
            Seleziona Offerta
          </button>
        </div>

        {/* Bank 2 */}
        <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-2 md:mb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-3 h-3" />
              <h4 className="font-semibold text-gray-900 text-base md:text-base">UniCredit</h4>
            </div>
            <Badge variant="secondary" className="text-xs">Alternative</Badge>
          </div>
          <div className="text-2xl md:text-2xl font-bold text-gray-700 mb-2">2.15%</div>
          <div className="flex items-center gap-1 mb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 text-sm">Polizza inclusa</span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4].map(star => (
              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <Star className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-600 ml-2">4.2/5</span>
          </div>
          <div className="space-y-2 text-sm md:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rata mensile:</span>
              <span className="font-medium">€ 1.289</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spese istruttoria:</span>
              <span className="font-medium">€ 500</span>
            </div>
          </div>
          <button className="w-full mt-2 border border-gray-300 text-gray-700 text-xs py-2 rounded hover:bg-gray-50">
            Confronta
          </button>
        </div>

        {/* Bank 3 - Hidden on mobile */}
        <div className="border border-gray-200 rounded-lg p-3 md:p-4 opacity-75 hidden md:block">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">BPER Banca</h4>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-700 mb-2">2.45%</div>
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4].map(star => (
              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <Star className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-600 ml-2">3.9/5</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rata mensile:</span>
              <span className="font-medium">€ 1.324</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spese istruttoria:</span>
              <span className="font-medium">€ 300</span>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-600 mb-2">Confronta tutte le 47 offerte</p>
            <div className="w-full h-7 md:h-8 bg-[#245C4F]/10 rounded-lg flex items-center justify-center">
              <span className="text-[#245C4F] font-medium text-xs md:text-sm">Vedi dettagli completi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankComparisonMockup;