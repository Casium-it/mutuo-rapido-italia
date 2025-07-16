
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableField } from './EditableField';
import { StatusSelector } from './StatusSelector';
import { DateTimePicker } from './DateTimePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { LeadStatus } from '@/types/leadStatus';
import { supabase } from '@/integrations/supabase/client';

interface AdminNotification {
  id: string;
  admin_name: string;
}

interface LeadManagementCardProps {
  submission: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    notes: string | null;
    lead_status: LeadStatus;
    mediatore: string | null;
    ultimo_contatto: string | null;
    prossimo_contatto: string | null;
    assigned_to: string | null;
    reminder: boolean;
  };
  onUpdate: (field: string, value: string | boolean) => Promise<void>;
}

export function LeadManagementCard({ submission, onUpdate }: LeadManagementCardProps) {
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    const fetchAdminNotifications = async () => {
      const { data, error } = await supabase
        .from('admin_notification_settings')
        .select('id, admin_name')
        .eq('notifications_enabled', true);
        
      if (!error && data) {
        setAdminNotifications(data);
      }
    };
    
    fetchAdminNotifications();
  }, []);

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
            
            <EditableField
              label="Email"
              value={submission.email || ''}
              onSave={(value) => onUpdate('email', value)}
              placeholder="Inserisci l'email"
            />

            <DateTimePicker
              label="Ultimo Contatto"
              value={submission.ultimo_contatto}
              onChange={(value) => onUpdate('ultimo_contatto', value || '')}
              placeholder="Seleziona data ultimo contatto"
            />

            <DateTimePicker
              label="Prossimo Contatto"
              value={submission.prossimo_contatto}
              onChange={(value) => onUpdate('prossimo_contatto', value || '')}
              placeholder="Seleziona data prossimo contatto"
            />
          </div>
          
          <div className="space-y-4">
            <StatusSelector
              value={submission.lead_status}
              onValueChange={(value) => onUpdate('lead_status', value)}
            />

            <div>
              <Label htmlFor="assigned-to" className="text-sm font-medium">
                Assegnato a
              </Label>
              <Select 
                value={submission.assigned_to || ''} 
                onValueChange={(value) => onUpdate('assigned_to', value || '')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nessuno</SelectItem>
                  {adminNotifications.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.admin_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="reminder"
                checked={submission.reminder}
                onCheckedChange={(checked) => onUpdate('reminder', checked)}
              />
              <Label htmlFor="reminder" className="text-sm font-medium">
                Reminder
              </Label>
            </div>

            <EditableField
              label="Mediatore"
              value={submission.mediatore || ''}
              onSave={(value) => onUpdate('mediatore', value)}
              placeholder="Inserisci il nome del mediatore"
            />
            
            <EditableField
              label="Note"
              value={submission.notes || ''}
              onSave={(value) => onUpdate('notes', value)}
              placeholder="Aggiungi note sul lead..."
              multiline
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
