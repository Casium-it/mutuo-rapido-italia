
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGraphData, GraphPeriod, ConversionType } from '@/hooks/useGraphData';
import { StatisticsChart } from './StatisticsChart';

interface StatisticsGraphDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricType: 'simulations' | 'submissions' | 'submissionsWithContact';
  title: string;
  formSlug?: string;
}

export function StatisticsGraphDialog({ 
  open, 
  onOpenChange, 
  metricType, 
  title, 
  formSlug 
}: StatisticsGraphDialogProps) {
  const [period, setPeriod] = useState<GraphPeriod>('30d');
  const [conversionType, setConversionType] = useState<ConversionType>('completion');
  
  const { data, loading, error } = useGraphData(period, formSlug);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT').format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getCurrentValues = () => {
    if (data.length === 0) return { metric: 0, conversion: 0 };
    
    const totals = data.reduce((acc, day) => ({
      simulations: acc.simulations + day.simulations,
      submissions: acc.submissions + day.submissions,
      submissionsWithContact: acc.submissionsWithContact + day.submissionsWithContact
    }), { simulations: 0, submissions: 0, submissionsWithContact: 0 });

    const metricValue = totals[metricType];
    
    let conversionValue = 0;
    switch (conversionType) {
      case 'completion':
        conversionValue = totals.simulations > 0 ? (totals.submissions / totals.simulations) * 100 : 0;
        break;
      case 'contact':
        conversionValue = totals.submissions > 0 ? (totals.submissionsWithContact / totals.submissions) * 100 : 0;
        break;
      case 'funnel':
        conversionValue = totals.simulations > 0 ? (totals.submissionsWithContact / totals.simulations) * 100 : 0;
        break;
    }

    return { metric: metricValue, conversion: conversionValue };
  };

  const periodOptions = [
    { value: '14d' as GraphPeriod, label: '14 giorni' },
    { value: '30d' as GraphPeriod, label: '30 giorni' },
    { value: '60d' as GraphPeriod, label: '60 giorni' }
  ];

  const conversionOptions = [
    { value: 'completion' as ConversionType, label: 'Completamento simulazione' },
    { value: 'contact' as ConversionType, label: 'Lascio di contatto' },
    { value: 'funnel' as ConversionType, label: 'Funnel completo' }
  ];

  const currentValues = getCurrentValues();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#245C4F]">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Period Selection */}
            <div className="min-w-32">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Periodo
              </label>
              <Select value={period} onValueChange={(value: GraphPeriod) => setPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conversion Type Selection */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo di Conversione
              </label>
              <Select value={conversionType} onValueChange={(value: ConversionType) => setConversionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conversionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Values Display */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#245C4F]">
                {formatNumber(currentValues.metric)}
              </div>
              <div className="text-sm text-gray-600">
                {metricType === 'simulations' ? 'Simulazioni' : 
                 metricType === 'submissions' ? 'Submissions' : 'Submissions con Contatto'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00853E]">
                {formatPercent(currentValues.conversion)}
              </div>
              <div className="text-sm text-gray-600">
                {conversionType === 'completion' ? 'Completamento' :
                 conversionType === 'contact' ? 'Lascio Contatto' : 'Funnel Completo'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="border border-gray-200 rounded-lg p-4">
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Caricamento grafico...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : data.length > 0 ? (
              <StatisticsChart 
                data={data} 
                conversionType={conversionType}
                metricType={metricType}
              />
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Nessun dato disponibile per il periodo selezionato</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#245C4F] rounded-full"></div>
              <span>Numeri (asse sinistro)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00853E] rounded-full"></div>
              <span>Percentuali (asse destro)</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
