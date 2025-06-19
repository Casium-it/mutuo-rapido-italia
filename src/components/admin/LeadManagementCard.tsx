
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableField } from './EditableField';
import { StatusSelector } from './StatusSelector';
import { User, Mail, FileText } from 'lucide-react';

interface LeadManagementCardProps {
  submission: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    notes: string | null;
    lead_status: 'not_contacted' | 'first_contact' | 'advanced_conversations' | 'converted' | 'rejected';
  };
  onUpdate: (field: string, value: string) => Promise<void>;
}

export function LeadManagementCard({ submission, onUpdate }: LeadManagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-[#245C4F]" />
          Gestione Lead
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <EditableField
              label="Nome"
              value={submission.first_name || ''}
              onSave={(value) => onUpdate('first_name', value)}
              placeholder="Inserisci il nome"
            />
            
            <EditableField
              label="Cognome"
              value={submission.last_name || ''}
              onSave={(value) => onUpdate('last_name', value)}
              placeholder="Inserisci il cognome"
            />
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <EditableField
                label="Email"
                value={submission.email || ''}
                onSave={(value) => onUpdate('email', value)}
                placeholder="Inserisci l'email"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <StatusSelector
              value={submission.lead_status}
              onValueChange={(value) => onUpdate('lead_status', value)}
            />
            
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-500 mt-2" />
              <EditableField
                label="Note"
                value={submission.notes || ''}
                onSave={(value) => onUpdate('notes', value)}
                placeholder="Aggiungi note sul lead..."
                multiline
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
