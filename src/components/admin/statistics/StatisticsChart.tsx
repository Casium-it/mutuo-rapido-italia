
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyData, ConversionType } from '@/hooks/useGraphData';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface StatisticsChartProps {
  data: DailyData[];
  conversionType: ConversionType;
  metricType: 'simulations' | 'submissions' | 'submissionsWithContact';
}

export function StatisticsChart({ data, conversionType, metricType }: StatisticsChartProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT').format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getConversionKey = () => {
    switch (conversionType) {
      case 'completion':
        return 'completionRate';
      case 'contact':
        return 'contactRate';
      case 'funnel':
        return 'funnelRate';
      default:
        return 'completionRate';
    }
  };

  const getConversionLabel = () => {
    switch (conversionType) {
      case 'completion':
        return 'Completamento Simulazione';
      case 'contact':
        return 'Lascio di Contatto';
      case 'funnel':
        return 'Funnel Completo';
      default:
        return 'Completamento Simulazione';
    }
  };

  const getMetricLabel = () => {
    switch (metricType) {
      case 'simulations':
        return 'Simulazioni';
      case 'submissions':
        return 'Submissions';
      case 'submissionsWithContact':
        return 'Submissions con Contatto';
      default:
        return 'Simulazioni';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = format(date, 'dd MMM yyyy', { locale: it });
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey.includes('Rate') ? formatPercent(entry.value) : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const conversionKey = getConversionKey();

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(new Date(value), 'dd/MM')}
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            stroke="#245C4F"
            fontSize={12}
            tickFormatter={formatNumber}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#00853E"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Main metric bars */}
          <Bar
            yAxisId="left"
            dataKey={metricType}
            fill="#245C4F"
            name={getMetricLabel()}
          />
          
          {/* Conversion rate line (semi-transparent) */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={conversionKey}
            stroke="#00853E"
            strokeWidth={2}
            strokeOpacity={0.5}
            dot={{ fill: '#00853E', strokeWidth: 2, r: 4, fillOpacity: 0.5 }}
            name={getConversionLabel()}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
