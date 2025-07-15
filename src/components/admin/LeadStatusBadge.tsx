
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/types/leadStatus';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusConfig = {
  not_contacted: {
    label: 'Non Contattato',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800'
  },
  non_risponde_x1: {
    label: 'Non Risponde x1',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  non_risponde_x2: {
    label: 'Non Risponde x2',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  non_risponde_x3: {
    label: 'Non Risponde x3',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  non_interessato: {
    label: 'Non Interessato',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  da_risentire: {
    label: 'Da Risentire',
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800'
  },
  prenotata_consulenza: {
    label: 'Prenotata Consulenza',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800'
  },
  pratica_bocciata: {
    label: 'Pratica Bocciata',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  converted: {
    label: 'Convertito',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800'
  },
  perso: {
    label: 'Perso',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  // Legacy status mappings
  first_contact: {
    label: 'Primo Contatto',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800'
  },
  advanced_conversations: {
    label: 'Conversazioni Avanzate',
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800'
  },
  rejected: {
    label: 'Rifiutato',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  }
} as const;

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  
  if (!config) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
