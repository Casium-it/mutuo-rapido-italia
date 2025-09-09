import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Calendar, User, FileText, Activity, RotateCcw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
  lead_name: string;
  created_at: string;
}

interface Mediatore {
  id: string;
  name: string;
}

export default function AdminMediatoriLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [mediatoreFilter, setMediatoreFilter] = useState('all');
  const [typeLogFilter, setTypeLogFilter] = useState('all');
  const [uniqueMediaatori, setUniqueMediaatori] = useState<Mediatore[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Session Storage helpers
  const saveFiltersToSession = (mediatore: string, typeLog: string, search: string) => {
    try {
      sessionStorage.setItem('adminLogs_mediatoreFilter', mediatore);
      sessionStorage.setItem('adminLogs_typeLogFilter', typeLog);
      sessionStorage.setItem('adminLogs_searchTerm', search);
    } catch (error) {
      console.warn('Could not save filters to session storage:', error);
    }
  };

  const loadFiltersFromSession = () => {
    try {
      const savedMediator = sessionStorage.getItem('adminLogs_mediatoreFilter') || 'all';
      const savedTypeLog = sessionStorage.getItem('adminLogs_typeLogFilter') || 'all';
      const savedSearch = sessionStorage.getItem('adminLogs_searchTerm') || '';
      return { 
        mediatore: savedMediator, 
        typeLog: savedTypeLog,
        search: savedSearch
      };
    } catch (error) {
      console.warn('Could not load filters from session storage:', error);
      return { mediatore: 'all', typeLog: 'all', search: '' };
    }
  };

  const saveScrollPosition = () => {
    try {
      sessionStorage.setItem('adminLogs_scrollPosition', window.pageYOffset.toString());
    } catch (error) {
      console.warn('Could not save scroll position:', error);
    }
  };

  const restoreScrollPosition = () => {
    try {
      const savedPosition = sessionStorage.getItem('adminLogs_scrollPosition');
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('adminLogs_scrollPosition');
      }
    } catch (error) {
      console.warn('Could not restore scroll position:', error);
    }
  };

  // Initialize filters from session storage FIRST (synchronously)
  useEffect(() => {
    console.log('🔄 Loading filters from session storage...');
    const { mediatore, typeLog, search } = loadFiltersFromSession();
    console.log('📋 Loaded filters:', { mediatore, typeLog, search });
    
    setMediatoreFilter(mediatore);
    setTypeLogFilter(typeLog);
    setSearchTerm(search);
    setDebouncedSearchTerm(search);
    setFiltersLoaded(true);
  }, []);

  // Initial data load - wait for filters to be loaded
  useEffect(() => {
    if (!filtersLoaded) return;
    
    console.log('🚀 Initial data load with loaded filters');
    fetchUniqueMediaatori();
    fetchLogs();
  }, [filtersLoaded]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Restore scroll position after initial data is loaded
  useLayoutEffect(() => {
    if (!loading && filtersLoaded) {
      const timer = setTimeout(() => {
        console.log('📍 Restoring scroll position after data load');
        restoreScrollPosition();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, filtersLoaded]);

  // Filter-dependent data loads
  useEffect(() => {
    if (!filtersLoaded) return;
    
    console.log('🔄 Filter change detected, fetching data...', {
      currentPage,
      mediatoreFilter,
      typeLogFilter,
      debouncedSearchTerm
    });
    
    setLogsLoading(true);
    fetchLogs().finally(() => setLogsLoading(false));
  }, [currentPage, mediatoreFilter, typeLogFilter, debouncedSearchTerm, filtersLoaded]);

  const fetchUniqueMediaatori = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching mediatori:', error);
        return;
      }

      const formattedMediaatori = data?.map(profile => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Utente Sconosciuto'
      })) || [];

      setUniqueMediaatori(formattedMediaatori);
    } catch (error) {
      console.error('Error fetching mediatori:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      
      let query = supabase
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
          ),
          form_submissions!lead_activity_log_submission_id_fkey (
            first_name,
            last_name,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      if (mediatoreFilter !== 'all') {
        query = query.eq('mediatore_id', mediatoreFilter);
      }

      if (typeLogFilter !== 'all') {
        const typeMap = {
          'note': ['note_added', 'note_updated', 'note_deleted'] as const,
          'edit': ['field_updated', 'pratica_created'] as const,
          'status': ['document_added', 'document_removed'] as const
        };
        
        const activityTypes = typeMap[typeLogFilter as keyof typeof typeMap];
        if (activityTypes) {
          query = query.in('activity_type', activityTypes);
        }
      }

      // Search only in description field (activity_type is enum, can't use ilike)
      if (debouncedSearchTerm) {
        query = query.ilike('description', `%${debouncedSearchTerm}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) {
        console.error('Error fetching activity logs:', error);
        return;
      }

      const formattedLogs = data?.map(log => ({
        ...log,
        mediatore_name: log.profiles 
          ? `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim() || log.profiles.email || 'Utente Sconosciuto'
          : 'Utente Sconosciuto',
        lead_name: log.form_submissions
          ? `${log.form_submissions.first_name || ''} ${log.form_submissions.last_name || ''}`.trim() || log.form_submissions.email || 'Lead Sconosciuto'
          : 'Lead Sconosciuto'
      })) || [];

      setLogs(formattedLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      // Only set loading to false if this is the initial load
      if (loading) {
        console.log('✅ Initial data load complete');
        setLoading(false);
      }
    }
  };

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

  const handlePageChange = (page: number) => {
    saveScrollPosition();
    setCurrentPage(page);
  };

  // Save filters when they change
  useEffect(() => {
    if (filtersLoaded) {
      saveFiltersToSession(mediatoreFilter, typeLogFilter, searchTerm);
    }
  }, [mediatoreFilter, typeLogFilter, searchTerm, filtersLoaded]);

  if (loading && currentPage === 1) {
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Log Attività</h2>
              <p className="text-gray-600">
                Totale: {totalCount} log
                {totalPages > 1 && ` - Pagina ${currentPage} di ${totalPages}`}
              </p>
            </div>
          </div>

          {/* Filters - Same design as AdminLeads */}
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex items-center gap-4">
              {/* Mediatore Filter */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <Select value={mediatoreFilter} onValueChange={setMediatoreFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mediatore" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Tutti</SelectItem>
                    {uniqueMediaatori.map((mediatore) => (
                      <SelectItem key={mediatore.id} value={mediatore.id}>
                        {mediatore.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Log Filter */}
              <div className="flex items-center gap-2 border-l pl-4">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={typeLogFilter} onValueChange={setTypeLogFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Tipo Log" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="edit">Modifiche</SelectItem>
                    <SelectItem value="status">Documenti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right side - Search and Update */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cerca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button 
                onClick={() => {
                  setLogsLoading(true);
                  fetchLogs().finally(() => setLogsLoading(false));
                }}
                variant="outline" 
                size="sm"
                className="px-3 py-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {totalCount === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun log trovato
                </h3>
                <p className="text-gray-600">
                  {searchTerm || mediatoreFilter !== 'all' || typeLogFilter !== 'all'
                    ? 'Prova a modificare i criteri di ricerca.'
                    : 'Non ci sono ancora log di attività.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Logs List */}
            <Card>
              <CardContent className="p-0">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F]"></div>
                  </div>
                ) : (
                  <div className="space-y-4 p-6">
                    {logs.map((log) => (
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
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={getActivityBadgeVariant(log.activity_type) as any}>
                                      {formatActivityType(log.activity_type)}
                                    </Badge>
                                    <p className="text-xs text-gray-500">Lead: {log.lead_name}</p>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {log.mediatore_name}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-900 font-medium mb-1">
                                  {log.activity_type.includes('note') && log.new_value?.titolo 
                                    ? log.new_value.titolo 
                                    : log.description}
                                </p>
                                
                                {/* Inline content based on activity type */}
                                {log.activity_type.includes('note') && log.new_value?.contenuto && (
                                  <p className="text-sm text-gray-600 mb-1">{log.new_value.contenuto}</p>
                                )}
                                
                                {log.activity_type === 'field_updated' && log.new_value && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    {log.description.replace('modificato', `modificato a *${
                                      typeof log.new_value === 'object' ? JSON.stringify(log.new_value) : String(log.new_value)
                                    }*`)}
                                    {log.old_value && (
                                      <span className="text-gray-400">
                                        {' '}(prima era {typeof log.old_value === 'object' ? JSON.stringify(log.old_value) : String(log.old_value)})
                                      </span>
                                    )}
                                  </p>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} di {totalCount} log
                </p>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Precedente
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Successivo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}