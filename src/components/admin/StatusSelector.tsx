
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatusBadge } from './LeadStatusBadge';

interface StatusSelectorProps {
  value: 'not_contacted' | 'first_contact' | 'advanced_conversations' | 'converted' | 'rejected';
  onValueChange: (value: 'not_contacted' | 'first_contact' | 'advanced_conversations' | 'converted' | 'rejected') => Promise<void>;
}

const statusOptions = [
  { value: 'not_contacted' as const, label: 'Non Contattato' },
  { value: 'first_contact' as const, label: 'Primo Contatto' },
  { value: 'advanced_conversations' as const, label: 'Conversazioni Avanzate' },
  { value: 'converted' as const, label: 'Convertito' },
  { value: 'rejected' as const, label: 'Rifiutato' }
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
