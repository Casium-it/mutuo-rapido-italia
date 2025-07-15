
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DailyData } from '@/hooks/useStatistics';

interface StatisticsChartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: DailyData[];
  dataKey: keyof DailyData;
  chartType?: 'line' | 'bar';
}

export function StatisticsChart({ 
  open, 
  onOpenChange, 
  title, 
  data, 
  dataKey,
  chartType = 'line' 
}: StatisticsChartProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM', { locale: it });
  };

  const chartData = data.map(item => ({
    ...item,
    dateFormatted: formatDate(item.date)
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value, payload) => {
                    const originalDate = payload?.[0]?.payload?.date;
                    return originalDate ? format(new Date(originalDate), 'dd MMMM yyyy', { locale: it }) : value;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke="#245C4F" 
                  strokeWidth={2}
                  dot={{ fill: '#245C4F', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value, payload) => {
                    const originalDate = payload?.[0]?.payload?.date;
                    return originalDate ? format(new Date(originalDate), 'dd MMMM yyyy', { locale: it }) : value;
                  }}
                />
                <Bar dataKey={dataKey} fill="#245C4F" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
