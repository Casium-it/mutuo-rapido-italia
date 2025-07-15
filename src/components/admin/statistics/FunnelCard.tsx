
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowDown } from 'lucide-react';
import { FunnelStep } from '@/hooks/useStatistics';

interface FunnelCardProps {
  title: string;
  funnel: FunnelStep[];
  onClick?: () => void;
}

export function FunnelCard({ title, funnel, onClick }: FunnelCardProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  };

  const getTrendIcon = (change: number) => {
    if (change === 0) return <Minus className="h-3 w-3" />;
    return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = (change: number) => {
    if (change === 0) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#245C4F]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {funnel.map((step, index) => {
          const change = calculateChange(step.value, step.previousValue);
          
          return (
            <div key={step.label}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{step.label}</h4>
                    <span className="text-2xl font-bold text-[#245C4F]">
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1">
                    <div className={`flex items-center gap-1 ${getTrendColor(change)}`}>
                      {getTrendIcon(change)}
                      <span className="text-sm font-medium">
                        {change > 0 ? '+' : ''}{change}%
                      </span>
                      <span className="text-xs text-gray-500">
                        (era {step.previousValue})
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-[#245C4F]">{step.conversionFromTotal}%</span>
                      <span className="ml-1">del totale</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Loss percentage and arrow for next step */}
              {index < funnel.length - 1 && step.lossFromPrevious !== undefined && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <ArrowDown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      -{step.lossFromPrevious}% persi
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Final conversion rate */}
        <div className="border-t pt-3 mt-4">
          <div className="text-center">
            <span className="text-sm text-gray-600">Conversione Finale: </span>
            <span className="text-lg font-bold text-[#245C4F]">
              {funnel[funnel.length - 1]?.conversionFromTotal}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
