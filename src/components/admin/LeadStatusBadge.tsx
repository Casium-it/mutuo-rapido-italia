
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LeadStatusBadgeProps {
  status: 'not_contacted' | 'non_risponde_x1' | 'non_risponde_x2' | 'non_risponde_x3' | 'non_interessato' | 'da_risentire' | 'prenotata_consulenza' | 'pratica_bocciata' | 'converted';
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
  }
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
