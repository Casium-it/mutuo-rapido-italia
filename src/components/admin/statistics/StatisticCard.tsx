
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticMetric } from '@/hooks/useStatistics';

interface StatisticCardProps {
  title: string;
  metric: StatisticMetric;
  icon?: React.ReactNode;
  showConversion?: boolean;
  loading?: boolean;
}

export function StatisticCard({ title, metric, icon, showConversion = false, loading = false }: StatisticCardProps) {
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
        {loading ? (
          <div className="space-y-2">
            {/* Main metric skeleton */}
            <Skeleton className="h-8 w-24" />
            
            {/* Previous period comparison skeleton */}
            <Skeleton className="h-3 w-32" />

            {/* Divider line */}
            <div className="w-8 h-px bg-gray-300"></div>
            
            {/* Bottom row skeleton */}
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Main metric */}
            <div className="text-2xl font-bold text-primary-green">
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
            
            {/* Conversion rate */}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
