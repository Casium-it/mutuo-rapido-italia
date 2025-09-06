
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableField } from './EditableField';
import { StatusSelector } from './StatusSelector';
import { DateTimePicker } from './DateTimePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, UserCog, Clock, StickyNote } from 'lucide-react';
import { LeadStatus } from '@/types/leadStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AINotesSection } from './AINotesSection';
import { MediatoreSelector } from './MediatorSelector';

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
    ai_notes: string | null;
    lead_status: LeadStatus;
    mediatore: string | null;
    mediatore_assegnato: string | null;
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
      <CardContent className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Informazioni Personali</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

        <Separator />

        {/* Lead Management Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <UserCog className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Gestione Lead</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <StatusSelector
                value={submission.lead_status}
                onValueChange={(value) => onUpdate('lead_status', value)}
              />
            </div>

            <div className="md:col-span-1">
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

            <div className="md:col-span-1">
              <MediatoreSelector
                value={submission.mediatore_assegnato}
                onValueChange={(value) => onUpdate('mediatore_assegnato', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Tracking Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Tracciamento Contatti</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <DateTimePicker
                label="Ultimo Contatto"
                value={submission.ultimo_contatto}
                onChange={(value) => onUpdate('ultimo_contatto', value)}
                placeholder="Seleziona data ultimo contatto"
              />
            </div>

            <div className="md:col-span-1">
              <DateTimePicker
                label="Prossimo Contatto"
                value={submission.prossimo_contatto}
                onChange={(value) => {
                  onUpdate('prossimo_contatto', value);
                  // Reset reminder_sent when prossimo_contatto changes
                  if (value) {
                    onUpdate('reminder_sent', false);
                  }
                }}
                placeholder="Seleziona data prossimo contatto"
              />
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <div className="w-full">
                <Label className="text-sm font-medium text-gray-600 mb-2 block">
                  Opzioni
                </Label>
                <div className="flex items-center space-x-2 h-10">
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
                  <Label htmlFor="reminder" className="text-sm font-medium">
                    Abilita Reminder
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Note</h4>
          </div>
          <EditableField
            label="Note Lead"
            value={submission.notes || ''}
            onSave={(value) => onUpdate('notes', value)}
            placeholder="Aggiungi note dettagliate sul lead..."
            multiline
          />
          
          <AINotesSection
            submissionId={submission.id}
            aiNotes={submission.ai_notes}
            onUpdate={onUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
}
