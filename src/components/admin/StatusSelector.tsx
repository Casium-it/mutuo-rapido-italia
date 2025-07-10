
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatusBadge } from './LeadStatusBadge';

interface StatusSelectorProps {
  value: 'not_contacted' | 'non_risponde_x1' | 'non_risponde_x2' | 'non_risponde_x3' | 'non_interessato' | 'da_risentire' | 'prenotata_consulenza' | 'pratica_bocciata' | 'converted';
  onValueChange: (value: 'not_contacted' | 'non_risponde_x1' | 'non_risponde_x2' | 'non_risponde_x3' | 'non_interessato' | 'da_risentire' | 'prenotata_consulenza' | 'pratica_bocciata' | 'converted') => Promise<void>;
}

const statusOptions = [
  { value: 'not_contacted' as const, label: 'Non Contattato' },
  { value: 'non_risponde_x1' as const, label: 'Non Risponde x1' },
  { value: 'non_risponde_x2' as const, label: 'Non Risponde x2' },
  { value: 'non_risponde_x3' as const, label: 'Non Risponde x3' },
  { value: 'non_interessato' as const, label: 'Non Interessato' },
  { value: 'da_risentire' as const, label: 'Da Risentire' },
  { value: 'prenotata_consulenza' as const, label: 'Prenotata Consulenza' },
  { value: 'pratica_bocciata' as const, label: 'Pratica Bocciata' },
  { value: 'converted' as const, label: 'Convertito' }
];

export function StatusSelector({ value, onValueChange }: StatusSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600">Status Lead</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <LeadStatusBadge status={value} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <LeadStatusBadge status={option.value} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
