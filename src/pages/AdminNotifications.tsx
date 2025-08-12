import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Bell, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AdminNotificationSetting {
  id: string;
  admin_name: string;
  phone_number: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface EditingAdmin {
  id: string;
  admin_name: string;
  phone_number: string;
}

export default function AdminNotifications() {
  const [settings, setSettings] = useState<AdminNotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState<EditingAdmin | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ admin_name: '', phone_number: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notification_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching admin settings:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle impostazioni admin",
          variant: "destructive"
        });
      } else {
        setSettings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    let formatted = phone.replace(/\s/g, "");
    if (!formatted.startsWith("+39")) {
      formatted = "+39" + formatted;
    }
    return formatted;
  };

  const toggleNotifications = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_notification_settings')
        .update({ notifications_enabled: enabled })
        .eq('id', id);

      if (error) {
        console.error('Error updating notification setting:', error);
        toast({
          title: "Errore",
          description: "Errore nell'aggiornamento delle notifiche",
          variant: "destructive"
        });
        return;
      }

      setSettings(prev => prev.map(setting => 
        setting.id === id ? { ...setting, notifications_enabled: enabled } : setting
      ));

      toast({
        title: "Successo",
        description: `Notifiche ${enabled ? 'attivate' : 'disattivate'} con successo`,
      });

      // Send webhook notification after successful update
      try {
        const adminSetting = settings.find(s => s.id === id);
        console.log('📤 Sending webhook for notification change');
        
        const { data: webhookResponse, error: webhookError } = await supabase.functions.invoke('sendLinkedFormWebhook', {
          body: {
            event_type: 'admin_notification_settings_changed',
            data: {
              admin_id: id,
              admin_name: adminSetting?.admin_name,
              phone_number: adminSetting?.phone_number,
              notifications_enabled: enabled,
              changed_at: new Date().toISOString()
            }
          }
        });

        if (webhookError) {
          console.error('❌ Webhook error:', webhookError);
        } else {
          console.log('✅ Webhook sent successfully:', webhookResponse);
        }
      } catch (webhookError) {
        console.error('❌ Failed to send webhook:', webhookError);
        // Don't show error to user as this is background functionality
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    }
  };

  const startEditing = (admin: AdminNotificationSetting) => {
    setEditingAdmin({
      id: admin.id,
      admin_name: admin.admin_name,
      phone_number: admin.phone_number
    });
  };

  const saveEdit = async () => {
    if (!editingAdmin) return;

    try {
      const formattedPhone = formatPhoneNumber(editingAdmin.phone_number);
      
      const { error } = await supabase
        .from('admin_notification_settings')
        .update({
          admin_name: editingAdmin.admin_name,
          phone_number: formattedPhone
        })
        .eq('id', editingAdmin.id);

      if (error) {
        console.error('Error updating admin:', error);
        toast({
          title: "Errore",
          description: "Errore nell'aggiornamento dell'admin",
          variant: "destructive"
        });
        return;
      }

      setSettings(prev => prev.map(setting => 
        setting.id === editingAdmin.id 
          ? { ...setting, admin_name: editingAdmin.admin_name, phone_number: formattedPhone }
          : setting
      ));

      setEditingAdmin(null);
      toast({
        title: "Successo",
        description: "Admin aggiornato con successo",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingAdmin(null);
  };

  const deleteAdmin = async (id: string) => {
    setDeletingId(id);
    
    try {
      const { error } = await supabase
        .from('admin_notification_settings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting admin:', error);
        toast({
          title: "Errore",
          description: "Errore nell'eliminazione dell'admin",
          variant: "destructive"
        });
        return;
      }

      setSettings(prev => prev.filter(setting => setting.id !== id));
      toast({
        title: "Successo",
        description: "Admin eliminato con successo",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const addNewAdmin = async () => {
    if (!newAdmin.admin_name.trim() || !newAdmin.phone_number.trim()) {
      toast({
        title: "Errore",
        description: "Nome e numero di telefono sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(newAdmin.phone_number);
      
      const { data, error } = await supabase
        .from('admin_notification_settings')
        .insert({
          admin_name: newAdmin.admin_name,
          phone_number: formattedPhone,
          notifications_enabled: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding admin:', error);
        toast({
          title: "Errore",
          description: "Errore nell'aggiunta dell'admin",
          variant: "destructive"
        });
        return;
      }

      setSettings(prev => [...prev, data]);
      setNewAdmin({ admin_name: '', phone_number: '' });
      setShowAddForm(false);
      toast({
        title: "Successo",
        description: "Admin aggiunto con successo",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento impostazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin')}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F] flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Gestisci Notifiche Admin
              </h1>
              <p className="text-gray-600">Configura le notifiche per gli amministratori</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Admin
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add New Admin Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Aggiungi Nuovo Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="new-admin-name">Nome Admin</Label>
                  <Input
                    id="new-admin-name"
                    value={newAdmin.admin_name}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, admin_name: e.target.value }))}
                    placeholder="Inserisci nome admin"
                  />
                </div>
                <div>
                  <Label htmlFor="new-admin-phone">Numero di Telefono</Label>
                  <Input
                    id="new-admin-phone"
                    value={newAdmin.phone_number}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="es. 3356332222"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addNewAdmin} className="bg-[#245C4F] hover:bg-[#1e4f44]">
                  Aggiungi
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline">
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Settings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Impostazioni Admin ({settings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {settings.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun admin configurato</h3>
                <p className="text-gray-600">Aggiungi il primo admin per iniziare a ricevere notifiche.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Notifiche</TableHead>
                    <TableHead>Creato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell>
                        {editingAdmin?.id === setting.id ? (
                          <Input
                            value={editingAdmin.admin_name}
                            onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, admin_name: e.target.value } : null)}
                          />
                        ) : (
                          <span className="font-medium">{setting.admin_name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingAdmin?.id === setting.id ? (
                          <Input
                            value={editingAdmin.phone_number}
                            onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                          />
                        ) : (
                          <span className="font-mono">{setting.phone_number}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={setting.notifications_enabled}
                            onCheckedChange={(checked) => toggleNotifications(setting.id, checked)}
                            disabled={editingAdmin?.id === setting.id}
                          />
                          <span className="text-sm text-gray-600">
                            {setting.notifications_enabled ? 'Attive' : 'Disattive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(setting.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingAdmin?.id === setting.id ? (
                            <>
                              <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button onClick={cancelEdit} size="sm" variant="outline">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => startEditing(setting)} size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                    disabled={deletingId === setting.id}
                                  >
                                    {deletingId === setting.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Sei sicuro di voler eliminare l'admin <strong>{setting.admin_name}</strong>?
                                      <br />
                                      <span className="text-red-600 font-medium">
                                        Questa azione non può essere annullata e l'admin non riceverà più notifiche.
                                      </span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteAdmin(setting.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Elimina
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
