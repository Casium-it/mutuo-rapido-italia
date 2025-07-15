
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'percentage';
  onClick?: () => void;
  description?: string;
}

export function StatisticsCard({ 
  title, 
  value, 
  previousValue, 
  format = 'number', 
  onClick,
  description 
}: StatisticsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    return format === 'percentage' ? `${val}%` : val.toLocaleString();
  };

  const calculateChange = () => {
    if (previousValue === undefined || typeof value === 'string') return null;
    
    if (previousValue === 0) {
      return value > 0 ? 100 : 0;
    }
    
    return Math.round(((value - previousValue) / previousValue) * 100);
  };

  const change = calculateChange();
  
  const getTrendIcon = () => {
    if (change === null || change === 0) return <Minus className="h-3 w-3" />;
    return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (change === null || change === 0) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-[#245C4F]">{formatValue(value)}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {change !== null && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
