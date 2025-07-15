
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatisticMetric } from '@/hooks/useStatistics';

interface StatisticCardProps {
  title: string;
  metric: StatisticMetric;
  icon?: React.ReactNode;
  showConversion?: boolean;
}

export function StatisticCard({ title, metric, icon, showConversion = false }: StatisticCardProps) {
  const getTrendIcon = () => {
    if (metric.change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (metric.change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (metric.change > 0) return 'text-green-600';
    if (metric.change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT').format(num);
  };

  const formatPercent = (num: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num / 100);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main metric */}
          <div className="text-2xl font-bold text-[#245C4F]">
            {formatNumber(metric.current)}
          </div>

          {/* Previous period comparison */}
          <div className="flex items-center gap-2 text-sm">
            {getTrendIcon()}
            <span className={cn("font-medium", getTrendColor())}>
              {metric.change >= 0 ? '+' : ''}{formatNumber(metric.change)}
            </span>
            <span className={cn("font-medium", getTrendColor())}>
              ({metric.changePercent >= 0 ? '+' : ''}{formatPercent(metric.changePercent)})
            </span>
          </div>

          {/* Previous period total */}
          <div className="text-xs text-gray-500">
            Periodo precedente: {formatNumber(metric.previous)}
          </div>

          {/* Conversion rate if available */}
          {showConversion && metric.conversionRate !== undefined && (
            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-gray-700">
                Tasso di conversione: {formatPercent(metric.conversionRate)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
