import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Shield } from "lucide-react";

const BankComparisonMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Confronto Banche</h3>
        
        {/* Bank 1 - Best Option */}
        <div className="border-2 border-primary rounded-lg p-4 mb-3 bg-primary/5">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">Intesa Sanpaolo</h4>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Migliore Offerta
            </Badge>
          </div>
          <div className="text-2xl font-bold text-primary mb-2">1.82%</div>
          <div className="flex items-center gap-1 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">-0.3% vs media</span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(star => (
              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-600 ml-2">4.8/5</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rata mensile:</span>
              <span className="font-medium">€ 1.247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spese istruttoria:</span>
              <span className="font-medium">€ 0</span>
            </div>
          </div>
        </div>

        {/* Bank 2 */}
        <div className="border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">UniCredit</h4>
            <Badge variant="secondary" className="text-xs">Alternative</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-700 mb-2">2.15%</div>
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
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rata mensile:</span>
              <span className="font-medium">€ 1.289</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spese istruttoria:</span>
              <span className="font-medium">€ 500</span>
            </div>
          </div>
        </div>

        {/* Bank 3 */}
        <div className="border border-gray-200 rounded-lg p-4 opacity-75">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">BPER Banca</h4>
          </div>
          <div className="text-2xl font-bold text-gray-700 mb-2">2.45%</div>
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
        <div className="mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Confronta tutte le 47 offerte</p>
            <div className="w-full h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-medium text-sm">Vedi dettagli completi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankComparisonMockup;