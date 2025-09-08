
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/types/leadStatus';

type PraticaStatus = 'lead' | 'consulenza_programmata' | 'consulenza_completata' | 'in_attesa_documenti' | 'documenti_ricevuti' | 
  'in_attesa_mandato' | 'mandato_firmato' | 'inviata_alla_banca' | 'predelibera_ricevuta' | 'istruttoria_ricevuta' | 
  'rogito_completato' | 'pratica_rifiutata' | 'pratica_sospesa' | 'non_risponde' | 'persa';

interface LeadStatusBadgeProps {
  status?: LeadStatus | PraticaStatus | null;
  isNewLead?: boolean;
}

const praticaStatusConfig = {
  lead: {
    label: 'Lead',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800'
  },
  consulenza_programmata: {
    label: 'Consulenza Programmata',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800'
  },
  consulenza_saltata: {
    label: 'Consulenza Saltata',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  consulenza_completata: {
    label: 'Consulenza Completata',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800'
  },
  in_attesa_documenti: {
    label: 'In Attesa Documenti',
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800'
  },
  documenti_ricevuti: {
    label: 'Documenti Ricevuti',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800'
  },
  in_attesa_mandato: {
    label: 'In Attesa Mandato',
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800'
  },
  mandato_firmato: {
    label: 'Mandato Firmato',
    variant: 'default' as const,
    className: 'bg-green-600 text-white'
  },
  inviata_alla_banca: {
    label: 'Inviata alla Banca',
    variant: 'default' as const,
    className: 'bg-green-600 text-white'
  },
  predelibera_ricevuta: {
    label: 'Predelibera Ricevuta',
    variant: 'default' as const,
    className: 'bg-green-600 text-white'
  },
  istruttoria_ricevuta: {
    label: 'Istruttoria Ricevuta',
    variant: 'default' as const,
    className: 'bg-green-600 text-white'
  },
  rogito_completato: {
    label: 'Rogito Completato',
    variant: 'default' as const,
    className: 'bg-green-600 text-white'
  },
  pratica_rifiutata: {
    label: 'Pratica Rifiutata',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  pratica_sospesa: {
    label: 'Pratica Sospesa',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  non_risponde: {
    label: 'Non Risponde',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  },
  persa: {
    label: 'Persa',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800'
  }
} as const;

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
  da_assegnare: {
    label: 'Da Assegnare',
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

export function LeadStatusBadge({ status, isNewLead }: LeadStatusBadgeProps) {
  // Show animated "Nuova Lead" badge if isNewLead is true
  if (isNewLead) {
    return (
      <Badge className="bg-[#245C4F] text-white animate-pulse shadow-lg border-2 border-[#245C4F]/20">
        ✨ Nuova Lead
      </Badge>
    );
  }

  // Check if it's a pratica status first
  const praticaConfig = praticaStatusConfig[status as keyof typeof praticaStatusConfig];
  if (praticaConfig) {
    return (
      <Badge variant={praticaConfig.variant} className={praticaConfig.className}>
        {praticaConfig.label}
      </Badge>
    );
  }

  // Fall back to lead status
  const config = statusConfig[status as keyof typeof statusConfig];
  
  if (!config) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        {status || 'N/A'}
      </Badge>
    );
  }
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
