
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LeadStatusBadgeProps {
  status: 'not_contacted' | 'first_contact' | 'advanced_conversations' | 'converted' | 'rejected';
}

const statusConfig = {
  not_contacted: {
    label: 'Non Contattato',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800'
  },
  first_contact: {
    label: 'Primo Contatto',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800'
  },
  advanced_conversations: {
    label: 'Conversazioni Avanzate',
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800'
  },
  converted: {
    label: 'Convertito',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800'
  },
  rejected: {
    label: 'Rifiutato',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
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
