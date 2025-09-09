import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Calendar, User, FileText, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  submission_id: string;
  mediatore_id: string;
  activity_type: string;
  description: string;
  old_value: any;
  new_value: any;
  metadata: any;
  mediatore_name: string;
  created_at: string;
}

export default function AdminMediatoriLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('lead_activity_log')
        .select(`
          id,
          submission_id,
          mediatore_id,
          activity_type,
          description,
          old_value,
          new_value,
          metadata,
          created_at,
          profiles!lead_activity_log_mediatore_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching activity logs:', error);
        return;
      }

      const formattedLogs = data?.map(log => ({
        ...log,
        mediatore_name: log.profiles 
          ? `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim() || log.profiles.email || 'Utente Sconosciuto'
          : 'Utente Sconosciuto'
      })) || [];

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.mediatore_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'note_added':
      case 'note_updated':
      case 'note_deleted':
        return <FileText className="h-4 w-4" />;
      case 'field_updated':
        return <Activity className="h-4 w-4" />;
      case 'document_added':
      case 'document_removed':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadgeVariant = (activityType: string) => {
    switch (activityType) {
      case 'note_added':
        return 'default';
      case 'note_updated':
        return 'secondary';
      case 'note_deleted':
        return 'destructive';
      case 'field_updated':
        return 'outline';
      case 'document_added':
        return 'default';
      case 'document_removed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatActivityType = (activityType: string) => {
    const types: Record<string, string> = {
      'note_added': 'Nota Aggiunta',
      'note_updated': 'Nota Modificata',
      'note_deleted': 'Nota Eliminata',
      'field_updated': 'Campo Modificato',
      'document_added': 'Documento Aggiunto',
      'document_removed': 'Documento Rimosso'
    };
    return types[activityType] || activityType;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#245C4F]"></div>
          <p className="mt-4 text-gray-600">Caricamento log attività...</p>
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
              Torna all'Admin
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">Log Mediatori</h1>
              <p className="text-gray-600">Visualizza tutti i log delle attività dei mediatori</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cerca per descrizione, mediatore o tipo attività..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={fetchLogs} variant="outline">
                Aggiorna
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Log Attività ({filteredLogs.length})</span>
              <Badge variant="outline">{logs.length} totali</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun log trovato
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Prova a modificare i criteri di ricerca.' : 'Non ci sono ancora log di attività.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getActivityIcon(log.activity_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getActivityBadgeVariant(log.activity_type) as any}>
                              {formatActivityType(log.activity_type)}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <User className="h-3 w-3" />
                              {log.mediatore_name}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                            </div>
                          </div>
                          <p className="text-gray-900 font-medium mb-1">{log.description}</p>
                          <p className="text-xs text-gray-500">ID Lead: {log.submission_id}</p>
                          
                          {/* Show old/new values if available */}
                          {(log.old_value || log.new_value) && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              {log.old_value && (
                                <div className="mb-1">
                                  <span className="font-medium">Valore precedente:</span>{' '}
                                  <span className="text-red-600">
                                    {typeof log.old_value === 'object' 
                                      ? JSON.stringify(log.old_value, null, 2) 
                                      : String(log.old_value)}
                                  </span>
                                </div>
                              )}
                              {log.new_value && (
                                <div>
                                  <span className="font-medium">Nuovo valore:</span>{' '}
                                  <span className="text-green-600">
                                    {typeof log.new_value === 'object' 
                                      ? JSON.stringify(log.new_value, null, 2) 
                                      : String(log.new_value)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}