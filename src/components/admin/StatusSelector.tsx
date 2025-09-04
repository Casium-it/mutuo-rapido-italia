
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadStatus } from '@/types/leadStatus';

interface StatusSelectorProps {
  value: LeadStatus;
  onValueChange: (value: LeadStatus) => Promise<void>;
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'not_contacted', label: 'Non Contattato' },
  { value: 'non_risponde_x1', label: 'Non Risponde x1' },
  { value: 'non_risponde_x2', label: 'Non Risponde x2' },
  { value: 'non_risponde_x3', label: 'Non Risponde x3' },
  { value: 'non_interessato', label: 'Non Interessato' },
  { value: 'da_risentire', label: 'Da Risentire' },
  { value: 'da_assegnare', label: 'Da Assegnare' },
  { value: 'prenotata_consulenza', label: 'Prenotata Consulenza' },
  { value: 'pratica_bocciata', label: 'Pratica Bocciata' },
  { value: 'converted', label: 'Convertito' },
  { value: 'perso', label: 'Perso' }
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
          {statusOptions.filter(option => option.value && option.value.trim() !== '').map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <LeadStatusBadge status={option.value} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
