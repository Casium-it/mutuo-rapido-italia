
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bell, BellOff } from 'lucide-react';

type AdminSetting = {
  id: string;
  admin_name: string;
  phone_number: string;
  notifications_enabled: boolean;
};

export function AdminNotificationSettings() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_notification_settings')
        .select('*')
        .order('admin_name');

      if (error) throw error;

      setSettings(data || []);
    } catch (error) {
      console.error('Errore nel caricamento impostazioni:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le impostazioni di notifica',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = async (id: string, enabled: boolean) => {
    try {
      setUpdating(id);
      
      const { error } = await supabase
        .from('admin_notification_settings')
        .update({ notifications_enabled: enabled })
        .eq('id', id);

      if (error) throw error;

      // Aggiorna lo stato locale
      setSettings(prev => 
        prev.map(setting => 
          setting.id === id 
            ? { ...setting, notifications_enabled: enabled }
            : setting
        )
      );

      toast({
        title: 'Successo',
        description: `Notifiche ${enabled ? 'abilitate' : 'disabilitate'} con successo`,
      });

    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare le impostazioni',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impostazioni Notifiche Admin</CardTitle>
          <CardDescription>
            Gestisci le notifiche per nuove submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Caricamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Impostazioni Notifiche Admin
        </CardTitle>
        <CardDescription>
          Gestisci le notifiche WhatsApp per nuove submission del form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {setting.notifications_enabled ? (
                  <Bell className="h-4 w-4 text-green-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
                <Label className="text-base font-medium">
                  {setting.admin_name}
                </Label>
              </div>
              <p className="text-sm text-gray-600">
                {setting.phone_number}
              </p>
              <p className="text-xs text-gray-500">
                {setting.notifications_enabled ? 'Riceverà notifiche' : 'Non riceverà notifiche'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {updating === setting.id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                checked={setting.notifications_enabled}
                onCheckedChange={(enabled) => updateNotificationSetting(setting.id, enabled)}
                disabled={updating === setting.id}
              />
            </div>
          </div>
        ))}
        
        {settings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessuna impostazione di notifica configurata</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
