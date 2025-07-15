
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
        <div className="space-y-2">
          {/* Main metric */}
          <div className="text-2xl font-bold text-[#245C4F]">
            {formatNumber(metric.current)}
          </div>

          {/* Previous period comparison */}
          <div className="text-xs text-gray-500">
            era {formatNumber(metric.previous)} → <span className={`${Math.abs(metric.change) >= 10 ? (metric.change >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
              {metric.change >= 0 ? '+' : ''}{formatNumber(metric.change)}%
            </span>
          </div>

          {/* Add divider line for all cards */}
          <div className="w-8 h-px bg-gray-300"></div>
          
          {/* Only show conversion rate for submissions, not for simulazioni salvate */}
          {showConversion && metric.conversionRate !== undefined && title !== "Simulazioni Salvate" ? (
            <div className="text-xs font-medium text-[#245C4F]">
              {formatPercent(metric.conversionRate)} conv.
            </div>
          ) : (
            <div className="text-xs text-transparent">
              &nbsp;
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
