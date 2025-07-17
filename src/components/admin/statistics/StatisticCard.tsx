
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { StatisticMetric } from '@/hooks/useStatistics';
import { StatisticsGraphDialog } from './StatisticsGraphDialog';

interface StatisticCardProps {
  title: string;
  metric: StatisticMetric;
  icon?: React.ReactNode;
  showConversion?: boolean;
}

export function StatisticCard({ title, metric, icon, showConversion = false }: StatisticCardProps) {
  const [showGraph, setShowGraph] = useState(false);

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

  const getMetricType = (): 'simulations' | 'submissions' | 'submissionsWithContact' => {
    if (title === "Simulazioni Salvate") return 'simulations';
    if (title === "Submissions Totali") return 'submissions';
    if (title === "Submissions con Contatto") return 'submissionsWithContact';
    return 'simulations';
  };

  return (
    <>
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
              era {formatNumber(metric.previous)} → <span className={`${Math.abs(metric.changePercent) >= 10 ? (metric.changePercent >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
              </span>
            </div>

            {/* Add divider line for all cards */}
            <div className="w-8 h-px bg-gray-300"></div>
            
            {/* Conversion rate row with graph button */}
            <div className="flex items-center justify-between">
              <div>
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
              
              {/* Graph button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGraph(true)}
                className="h-7 w-7 p-0 hover:bg-gray-100 border-gray-300"
              >
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatisticsGraphDialog
        open={showGraph}
        onOpenChange={setShowGraph}
        metricType={getMetricType()}
        title={`Grafico ${title}`}
      />
    </>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
