
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
import { toast } from '@/hooks/use-toast';

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
    reminder_sent?: boolean;
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

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <DateTimePicker
                  label="Prossimo Contatto"
                  value={submission.prossimo_contatto}
                  onChange={(value) => {
                    const newValue = value || '';
                    onUpdate('prossimo_contatto', newValue);
                    // Reset reminder_sent when prossimo_contatto changes
                    if (newValue) {
                      onUpdate('reminder_sent', false);
                    }
                  }}
                  placeholder="Seleziona data prossimo contatto"
                />
              </div>
              
              <div className="flex flex-col items-center gap-1 pb-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reminder"
                    checked={submission.reminder}
                    onCheckedChange={(checked) => {
                      if (checked && !submission.assigned_to) {
                        toast({
                          title: "Errore",
                          description: "Devi assegnare il lead prima di abilitare il reminder",
                          variant: "destructive"
                        });
                        return;
                      }
                      onUpdate('reminder', checked);
                    }}
                  />
                  <Label htmlFor="reminder" className="text-sm font-medium whitespace-nowrap">
                    Reminder
                  </Label>
                </div>
              </div>
            </div>
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
                value={submission.assigned_to || 'unassigned'} 
                onValueChange={(value) => {
                  const newValue = value === 'unassigned' ? null : value;
                  onUpdate('assigned_to', newValue);
                  
                  // If unassigning and reminder is enabled, disable it
                  if (!newValue && submission.reminder) {
                    onUpdate('reminder', false);
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Nessuno</SelectItem>
                  {adminNotifications.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.admin_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
