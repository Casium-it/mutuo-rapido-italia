import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  Search, 
  Filter, 
  TrendingUp, 
  FileText, 
  Edit, 
  Trash, 
  Plus, 
  FileCheck, 
  Phone,
  Calendar,
  Bell
} from 'lucide-react';

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  mediatore_name?: string;
  created_at: string;
}

interface ActivityTimelineProps {
  submissionId: string;
}

const activityTypeMap = {
  'status_change': { label: 'Cambio Status', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  'note_added': { label: 'Nota Aggiunta', icon: Plus, color: 'bg-green-100 text-green-700' },
  'note_updated': { label: 'Nota Modificata', icon: Edit, color: 'bg-yellow-100 text-yellow-700' },
  'note_deleted': { label: 'Nota Eliminata', icon: Trash, color: 'bg-red-100 text-red-700' },
  'pratica_created': { label: 'Pratica Creata', icon: FileCheck, color: 'bg-emerald-100 text-emerald-700' },
  'pratica_updated': { label: 'Pratica Aggiornata', icon: FileText, color: 'bg-purple-100 text-purple-700' },
  'field_updated': { label: 'Campo Modificato', icon: Edit, color: 'bg-orange-100 text-orange-700' },
  'document_added': { label: 'Documento Aggiunto', icon: FileCheck, color: 'bg-indigo-100 text-indigo-700' },
  'document_removed': { label: 'Documento Rimosso', icon: Trash, color: 'bg-gray-100 text-gray-700' },
  'reminder_set': { label: 'Promemoria Impostato', icon: Bell, color: 'bg-pink-100 text-pink-700' },
  'contact_made': { label: 'Contatto Effettuato', icon: Phone, color: 'bg-cyan-100 text-cyan-700' }
};

export function ActivityTimeline({ submissionId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [submissionId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase.rpc('get_lead_timeline', {
        lead_submission_id: submissionId
      });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.mediatore_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || activity.activity_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('it-IT', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'ora';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)} min fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ore fa`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} giorni fa`;
    return `${Math.floor(diffInMinutes / 10080)} settimane fa`;
  };

  const getActivityInfo = (type: string) => {
    return activityTypeMap[type as keyof typeof activityTypeMap] || {
      label: type,
      icon: FileText,
      color: 'bg-gray-100 text-gray-700'
    };
  };

  const renderValueChange = (activity: Activity) => {
    if (!activity.old_value && !activity.new_value) return null;

    const formatValue = (value: any) => {
      if (typeof value === 'object' && value !== null) {
        // Handle note objects
        if (value.titolo && value.contenuto) {
          return `"${value.titolo}" - ${value.contenuto}`;
        }
        // Handle other objects by showing key properties
        if (value.status) return value.status;
        if (value.name) return value.name;
        // Fallback to simple string representation
        return Object.entries(value)
          .slice(0, 2) // Only show first 2 properties
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');
      }
      return String(value);
    };

    return (
      <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
        {activity.old_value && (
          <div>
            <span className="font-medium">Da:</span> {formatValue(activity.old_value)}
          </div>
        )}
        {activity.new_value && (
          <div>
            <span className="font-medium">A:</span> {formatValue(activity.new_value)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Storico Attività ({filteredActivities.length})
          </CardTitle>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca nelle attività..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                {Object.entries(activityTypeMap).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <info.icon className="h-4 w-4" />
                      {info.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'all' ? 'Nessuna attività trovata con i filtri applicati' : 'Nessuna attività registrata'}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm || typeFilter !== 'all' ? 'Prova a modificare i filtri di ricerca' : 'Le attività verranno mostrate qui quando vengono effettuate delle modifiche'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const activityInfo = getActivityInfo(activity.activity_type);
              const IconComponent = activityInfo.icon;
              const isRecent = new Date(activity.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
              
              return (
                <div
                  key={activity.id}
                  className={`flex gap-4 pb-4 ${index !== filteredActivities.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Timeline line and icon */}
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full p-2 ${activityInfo.color} ${isRecent ? 'ring-2 ring-blue-200' : ''}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    {index !== filteredActivities.length - 1 && (
                      <div className="w-px bg-gray-200 flex-1 mt-2"></div>
                    )}
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${activityInfo.color}`}>
                            {activityInfo.label}
                          </Badge>
                          {isRecent && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                              Nuovo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-1">
                          {activity.description}
                        </p>
                        {activity.mediatore_name && (
                          <p className="text-xs text-gray-500">
                            da {activity.mediatore_name}
                          </p>
                        )}
                        {renderValueChange(activity)}
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-xs text-gray-400">
                          {formatDate(activity.created_at)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}