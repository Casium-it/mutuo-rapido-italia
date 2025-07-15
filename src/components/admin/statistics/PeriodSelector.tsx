
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatisticsPeriod } from '@/hooks/useStatistics';

interface PeriodSelectorProps {
  value: StatisticsPeriod;
  onValueChange: (value: StatisticsPeriod) => void;
}

const periodLabels: Record<StatisticsPeriod, string> = {
  lifetime: 'Lifetime',
  '60d': 'Ultimi 60 giorni',
  '30d': 'Ultimi 30 giorni',
  '14d': 'Ultimi 14 giorni',
  '7d': 'Ultimi 7 giorni',
  '3d': 'Ultimi 3 giorni',
  yesterday: 'Ieri',
  today: 'Oggi'
};

export function PeriodSelector({ value, onValueChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Seleziona periodo" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(periodLabels).map(([period, label]) => (
          <SelectItem key={period} value={period}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
