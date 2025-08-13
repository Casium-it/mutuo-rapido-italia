import React from "react";
import { Badge } from "@/components/ui/badge";

const BankComparisonMockup: React.FC = () => {
  const banks = [
    { name: "Banca Intesa", score: 95, available: true },
    { name: "UniCredit", score: 88, available: true },
    { name: "BNL", score: 82, available: true },
    { name: "Monte Paschi", score: 75, available: false },
    { name: "Credem", score: 70, available: true },
    { name: "Mediolanum", score: 68, available: false },
  ];

  const durations = Array.from({ length: 19 }, (_, i) => i + 12);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 min-h-[400px]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Confronta le banche</h2>
        <div className="flex gap-2 mb-4">
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded"></div>
          <span className="text-xs text-muted-foreground">Non disponibile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <span className="text-xs text-muted-foreground">Disponibile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span className="text-xs text-muted-foreground">Consigliato</span>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="space-y-1">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-1 mb-2">
          <div className="col-span-3 text-xs font-semibold text-muted-foreground">
            Durata (anni)
          </div>
          {durations.slice(0, 9).map(duration => (
            <div key={duration} className="text-xs text-center font-medium text-muted-foreground">
              {duration}
            </div>
          ))}
        </div>

        {/* Bank Rows */}
        {banks.map((bank, bankIndex) => (
          <div key={bank.name} className="grid grid-cols-12 gap-1 items-center">
            <div className="col-span-3">
              <div className="text-sm font-medium text-foreground truncate">
                {bank.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {bank.score}% compatibilità
              </div>
            </div>
            
            {durations.slice(0, 9).map((duration, durationIndex) => {
              const isAvailable = bank.available && Math.random() > 0.3;
              const isRecommended = bankIndex === 0 && durationIndex === 3;
              
              return (
                <div 
                  key={`${bank.name}-${duration}`}
                  className={`h-8 rounded-sm relative ${
                    !isAvailable 
                      ? 'bg-red-200' 
                      : isRecommended 
                        ? 'bg-primary' 
                        : 'bg-green-200'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs">★</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected Bank Details */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">BANCA INTESA</h3>
            <div className="space-y-1 mt-2">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">Durata:</span>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">Tasso:</span>
                <div className="w-12 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">Rata:</span>
                <div className="w-20 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">✓ Disponibile</Badge>
              <Badge variant="outline" className="text-xs">✓ Veloce</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankComparisonMockup;