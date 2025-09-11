import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, ArrowLeft, Phone, Calendar, FileText, Mail, User, StickyNote, Trash2, Filter, RotateCcw, Search, Headphones } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { ExpandableNotes } from '@/components/admin/ExpandableNotes';
import { LeadStatus } from '@/types/leadStatus';
import { useIsMobile } from '@/hooks/use-mobile';
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

interface FormSubmission {
  id: string;
  created_at: string;
  form_id: string | null;
  phone_number: string | null;
  consulting: boolean | null;
  user_identifier: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  gomutuo_service: string | null;
  notes: string | null;
  ai_notes: string | null;
  mediatore: string | null;
  ultimo_contatto: string | null;
  prossimo_contatto: string | null;
  lead_status: LeadStatus;
  form_title: string;
  assigned_to: string | null;
  assigned_admin_name: string | null;
  forms?: {
    slug: string;
    title: string;
  };
  form_responses?: Array<{
    question_id: string;
    response_value: any;
  }>;
}

interface FormInfo {
  slug: string;
  title: string;
}

export default function AdminLeads() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [forms, setForms] = useState<FormInfo[]>([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phoneFilter, setPhoneFilter] = useState<boolean>(true); // Default on
  const [openSubmissionsFilter, setOpenSubmissionsFilter] = useState<boolean>(true); // Default on
  const [mediatoreFilter, setMediatoreFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [prossimoContattoSort, setProssimoContattoSort] = useState<string>('none');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [uniqueMediaatori, setUniqueMediaatori] = useState<{id: string, name: string}[]>([]);
  const itemsPerPage = 50;
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Session Storage helpers
  const saveFiltersToSession = (status: string, phone: boolean, openSubmissions: boolean, mediatore: string, search: string, prossimoContatto: string) => {
    try {
      sessionStorage.setItem('adminLeads_statusFilter', status);
      sessionStorage.setItem('adminLeads_phoneFilter', phone.toString());
      sessionStorage.setItem('adminLeads_openSubmissionsFilter', openSubmissions.toString());
      sessionStorage.setItem('adminLeads_mediatoreFilter', mediatore);
      sessionStorage.setItem('adminLeads_searchQuery', search);
      sessionStorage.setItem('adminLeads_prossimoContattoSort', prossimoContatto);
    } catch (error) {
      console.warn('Could not save filters to session storage:', error);
    }
  };

  const loadFiltersFromSession = () => {
    try {
      const savedStatus = sessionStorage.getItem('adminLeads_statusFilter') || 'all';
      const savedPhone = sessionStorage.getItem('adminLeads_phoneFilter') === 'false' ? false : true;
      const savedOpenSubmissions = sessionStorage.getItem('adminLeads_openSubmissionsFilter') === 'false' ? false : true;
      const savedMediator = sessionStorage.getItem('adminLeads_mediatoreFilter') || 'all';
      const savedSearch = sessionStorage.getItem('adminLeads_searchQuery') || '';
      const savedProssimoContatto = sessionStorage.getItem('adminLeads_prossimoContattoSort') || 'none';
      return { 
        status: savedStatus, 
        phone: savedPhone,
        openSubmissions: savedOpenSubmissions,
        mediatore: savedMediator,
        search: savedSearch,
        prossimoContatto: savedProssimoContatto
      };
    } catch (error) {
      console.warn('Could not load filters from session storage:', error);
      return { status: 'all', phone: true, openSubmissions: true, mediatore: 'all', search: '', prossimoContatto: 'none' };
    }
  };

  const saveScrollPosition = () => {
    try {
      sessionStorage.setItem('adminLeads_scrollPosition', window.pageYOffset.toString());
    } catch (error) {
      console.warn('Could not save scroll position:', error);
    }
  };

  const restoreScrollPosition = () => {
    try {
      const savedPosition = sessionStorage.getItem('adminLeads_scrollPosition');
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('adminLeads_scrollPosition'); // Clean up after use
      }
    } catch (error) {
      console.warn('Could not restore scroll position:', error);
    }
  };

  // Initialize filters from session storage FIRST (synchronously)
  useEffect(() => {
    console.log('🔄 Loading filters from session storage...');
    const { status, phone, openSubmissions, mediatore, search, prossimoContatto } = loadFiltersFromSession();
    console.log('📋 Loaded filters:', { status, phone, openSubmissions, mediatore, search, prossimoContatto });
    
    setStatusFilter(status);
    setPhoneFilter(phone);
    setOpenSubmissionsFilter(openSubmissions);
    setMediatoreFilter(mediatore);
    setSearchQuery(search);
    setDebouncedSearchQuery(search);
    setProssimoContattoSort(prossimoContatto);
    setFiltersLoaded(true);
  }, []);

  // Initial data load - wait for filters to be loaded
  useEffect(() => {
    if (!filtersLoaded) return;
    
    console.log('🚀 Initial data load with loaded filters');
    fetchSubmissions();
    fetchUniqueMediaatori();
  }, [filtersLoaded]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Restore scroll position after initial data is loaded with correct filters
  useLayoutEffect(() => {
    if (!loading && filtersLoaded) {
      const timer = setTimeout(() => {
        console.log('📍 Restoring scroll position after data load');
        restoreScrollPosition();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, filtersLoaded]);

  // Filter-dependent data loads (removed loading condition that was causing race condition)
  useEffect(() => {
    if (!filtersLoaded) return; // Only skip if filters aren't loaded yet
    
    console.log('🔄 Filter change detected, fetching data...', {
      currentPage,
      statusFilter,
      phoneFilter,
      openSubmissionsFilter,
      mediatoreFilter,
      debouncedSearchQuery,
      prossimoContattoSort
    });
    
    setSubmissionsLoading(true);
    fetchSubmissions().finally(() => setSubmissionsLoading(false));
  }, [currentPage, statusFilter, phoneFilter, openSubmissionsFilter, mediatoreFilter, debouncedSearchQuery, prossimoContattoSort, filtersLoaded]);

  const fetchSubmissions = async (retryWithPage1 = false) => {
    try {
      // Pre-query validation: if we have a totalCount and currentPage would be invalid, reset to page 1
      let pageToUse = currentPage;
      if (totalCount > 0 && retryWithPage1) {
        pageToUse = 1;
        setCurrentPage(1);
      }
      
      // Build the query with safer joins
      let query = supabase
        .from('form_submissions')
        .select(`
          *,
          forms (
            title,
            slug
          ),
          form_responses (
            question_id,
            response_value
          )
        `, { count: 'exact' });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('lead_status', statusFilter as LeadStatus);
      }

      if (phoneFilter) {
        query = query.not('phone_number', 'is', null);
      }

      // Apply server-side open submissions filter BEFORE pagination
      if (openSubmissionsFilter) {
        // Exclude closed/rejected statuses: non_interessato, pratica_bocciata, rejected, non_risponde_x3, prenotata_consulenza
        query = query.not('lead_status', 'in', '(non_interessato,pratica_bocciata,rejected,non_risponde_x3,prenotata_consulenza)');
      }

      // Re-enabled mediatore filtering with UUID support
      if (mediatoreFilter !== 'all') {
        query = query.eq('mediatore', mediatoreFilter);
      }

      // Apply consultation filter only when open submissions filter is ON
      if (openSubmissionsFilter) {
        // Filter to only show submissions with consultation interest
        // Include submissions where gomutuo_service='consulenza' OR consulting=true
        query = query.or('gomutuo_service.eq.consulenza,consulting.eq.true');
      }

      // Search functionality - now we need to search by joining with profiles for mediatore names
      if (debouncedSearchQuery) {
        query = query.or(`first_name.ilike.%${debouncedSearchQuery}%,last_name.ilike.%${debouncedSearchQuery}%,email.ilike.%${debouncedSearchQuery}%,phone_number.ilike.%${debouncedSearchQuery}%,notes.ilike.%${debouncedSearchQuery}%`);
      }

      // Apply ordering based on prossimo contatto sort
      if (prossimoContattoSort === 'futuro') {
        // Future contacts only - order by prossimo_contatto ASC (closest first)
        query = query
          .gte('prossimo_contatto', new Date().toISOString().split('T')[0])
          .not('prossimo_contatto', 'is', null)
          .order('prossimo_contatto', { ascending: true });
      } else if (prossimoContattoSort === 'passato') {
        // Past contacts only - order by prossimo_contatto DESC (most recent first)
        query = query
          .lt('prossimo_contatto', new Date().toISOString().split('T')[0])
          .not('prossimo_contatto', 'is', null)
          .order('prossimo_contatto', { ascending: false });
      } else if (prossimoContattoSort === 'tutti') {
        // All contacts with prossimo_contatto - order by ASC (oldest first)
        query = query
          .not('prossimo_contatto', 'is', null)
          .order('prossimo_contatto', { ascending: true });
      } else {
        // Default ordering by created_at
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination after ordering
      const from = (pageToUse - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data: submissionsData, error: submissionsError, count } = await query;

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        
        // Handle specific pagination error - PGRST103 "Requested range not satisfiable"
        if (submissionsError.code === 'PGRST103' && !retryWithPage1) {
          console.log('Range not satisfiable, retrying with page 1...');
          return fetchSubmissions(true);
        }
        
        toast({
          title: "Errore",
          description: `Errore nel caricamento delle submissions: ${submissionsError.message || 'Errore sconosciuto'}`,
          variant: "destructive"
        });
        return;
      }

      // Map the data to include form_title from the joined form
      const mappedData = (submissionsData || []).map(submission => ({
        ...submission,
        form_title: submission.forms?.title || 'Form non trovato',
        assigned_admin_name: null // Simplified for now to avoid join issues
      }));

      // No more client-side contactable filtering - it's now handled server-side
      setSubmissions(mappedData);
      setTotalCount(count || 0);

      // Extract unique forms for any future filter
      const uniqueForms = Array.from(
        new Map(
          mappedData
            .filter(submission => submission.forms)
            .map(submission => [
              submission.forms.slug,
              {
                slug: submission.forms.slug,
                title: submission.forms.title
              }
            ])
        ).values()
      );
      
      setForms(uniqueForms);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    } finally {
      // Only set loading to false if this is the initial load
      if (loading) {
        console.log('✅ Initial data load complete');
        setLoading(false);
      }
    }
  };

  const fetchUniqueMediaatori = async () => {
    try {
      console.log('🔄 Fetching unique mediatori for filter...');
      
      // First get all user IDs with mediatore role - same approach as MediatorSelector
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mediatore');
      
      if (rolesError) {
        console.error('❌ Error fetching user roles:', rolesError);
        return;
      }
      
      if (!userRoles || userRoles.length === 0) {
        console.log('📭 No mediatori found');
        setUniqueMediaatori([]);
        return;
      }

      // Then get profiles for those user IDs
      const userIds = userRoles.map(ur => ur.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        return;
      }

      if (profiles) {
        // Transform to the format we need for the filter
        const mediatori = profiles.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Mediatore senza nome'
        }));
        
        console.log('✅ Successfully fetched unique mediatori:', mediatori);
        setUniqueMediaatori(mediatori);
      }
    } catch (error) {
      console.error('💥 Exception fetching unique mediatori:', error);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    setDeletingId(submissionId);
    
    try {
      console.log('Starting deletion process for submission:', submissionId);
      
      // First delete related responses
      const { error: responsesError } = await supabase
        .from('form_responses')
        .delete()
        .eq('submission_id', submissionId);

      if (responsesError) {
        console.error('Error deleting responses:', responsesError);
        throw responsesError;
      }

      console.log('Successfully deleted responses for submission:', submissionId);

      // Then delete the submission
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submissionId);

      if (submissionError) {
        console.error('Error deleting submission:', submissionError);
        throw submissionError;
      }

      console.log('Successfully deleted submission:', submissionId);

      // Refetch data to update pagination and counts
      await fetchSubmissions();
      
      toast({
        title: "Successo",
        description: "Submission eliminata con successo",
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Errore",
        description: `Errore nell'eliminazione della submission: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset page when filters change  
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, phoneFilter, openSubmissionsFilter, mediatoreFilter, searchQuery, prossimoContattoSort]);

  // Sync currentPage with totalPages when totalCount changes
  useEffect(() => {
    if (totalCount > 0 && currentPage > totalPages) {
      console.log(`Current page ${currentPage} exceeds total pages ${totalPages}, resetting to page 1`);
      setCurrentPage(1);
    }
  }, [totalCount, totalPages, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex items-center justify-between'}`}>
            <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-4'}`}>
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${isMobile ? 'self-start' : ''}`}
              >
                <ArrowLeft className="h-4 w-4" />
                {!isMobile && 'Torna al Dashboard'}
              </Button>
              <div>
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#245C4F]`}>Gestione Leads</h1>
                {!isMobile && <p className="text-gray-600">Visualizza e gestisci le submissions dei form</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <div className={`${isMobile ? 'mb-3' : 'flex items-center justify-between mb-4'}`}>
            <div>
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>Form Submissions</h2>
              <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
                Totale: {totalCount} submissions 
                {totalPages > 1 && ` - Pagina ${currentPage} di ${totalPages}`}
              </p>
            </div>
          </div>

          {/* Filters - Mobile responsive */}
          <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between gap-4'}`}>
            {/* Filters Row 1 (mobile) / Left side (desktop) */}
            <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center gap-4'}`}>
              {/* Mediatore Filter */}
              <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
                {!isMobile && <User className="h-4 w-4 text-gray-500" />}
                <Select value={mediatoreFilter} onValueChange={(value) => {
                  setMediatoreFilter(value);
                  saveFiltersToSession(statusFilter, phoneFilter, openSubmissionsFilter, value, searchQuery, prossimoContattoSort);
                }}>
                  <SelectTrigger className={isMobile ? 'w-full' : 'w-40'}>
                    <div className="flex items-center gap-2">
                      {isMobile && <User className="h-4 w-4 text-gray-500" />}
                      <SelectValue placeholder="Mediatore" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Tutti i mediatori</SelectItem>
                    {uniqueMediaatori.map((mediatore) => (
                      <SelectItem key={mediatore.id} value={mediatore.id}>
                        {mediatore.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Filters Row */}
              <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center gap-4'}`}>
                {/* Open Submissions Filter */}
                <div className={`flex items-center gap-3 ${isMobile ? 'justify-between' : 'border-l pl-4'}`}>
                  <div className="flex items-center gap-2">
                    <Headphones className={`h-4 w-4 ${openSubmissionsFilter ? 'text-[#245C4F]' : 'text-gray-400'}`} />
                    <span className="text-sm">Lead aperti</span>
                  </div>
                  <Switch
                    checked={openSubmissionsFilter}
                    onCheckedChange={(checked) => {
                      setOpenSubmissionsFilter(checked);
                      saveFiltersToSession(statusFilter, phoneFilter, checked, mediatoreFilter, searchQuery, prossimoContattoSort);
                    }}
                  />
                </div>

                {/* Phone Filter */}
                <div className={`flex items-center gap-3 ${isMobile ? 'justify-between' : 'border-l pl-4'}`}>
                  <div className="flex items-center gap-2">
                    <Phone className={`h-4 w-4 ${phoneFilter ? 'text-[#245C4F]' : 'text-gray-400'}`} />
                    <span className="text-sm">Solo con telefono</span>
                  </div>
                  <Switch
                    checked={phoneFilter}
                    onCheckedChange={(checked) => {
                      setPhoneFilter(checked);
                      saveFiltersToSession(statusFilter, checked, openSubmissionsFilter, mediatoreFilter, searchQuery, prossimoContattoSort);
                    }}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'border-l pl-4'}`}>
                {!isMobile && <Filter className="h-4 w-4 text-gray-500" />}
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  saveFiltersToSession(value, phoneFilter, openSubmissionsFilter, mediatoreFilter, searchQuery, prossimoContattoSort);
                }}>
                  <SelectTrigger className={isMobile ? 'w-full' : 'w-44'}>
                    <div className="flex items-center gap-2">
                      {isMobile && <Filter className="h-4 w-4 text-gray-500" />}
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Tutti gli status</SelectItem>
                    <SelectItem value="not_contacted">Non Contattato</SelectItem>
                    <SelectItem value="non_risponde_x1">Non Risponde x1</SelectItem>
                    <SelectItem value="non_risponde_x2">Non Risponde x2</SelectItem>
                    <SelectItem value="non_risponde_x3">Non Risponde x3</SelectItem>
                    <SelectItem value="non_interessato">Non Interessato</SelectItem>
                    <SelectItem value="da_risentire">Da Risentire</SelectItem>
                    <SelectItem value="da_assegnare">Da Assegnare</SelectItem>
                    <SelectItem value="prenotata_consulenza">Prenotata Consulenza</SelectItem>
                    <SelectItem value="pratica_bocciata">Pratica Bocciata</SelectItem>
                    <SelectItem value="converted">Convertito</SelectItem>
                    <SelectItem value="perso">Perso</SelectItem>
                    <SelectItem value="first_contact">Primo Contatto</SelectItem>
                    <SelectItem value="advanced_conversations">Conversazioni Avanzate</SelectItem>
                    <SelectItem value="rejected">Respinto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prossimo Contatto Sort Filter */}
              <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'border-l pl-4'}`}>
                {!isMobile && <Calendar className="h-4 w-4 text-gray-500" />}
                <Select value={prossimoContattoSort} onValueChange={(value) => {
                  setProssimoContattoSort(value);
                  saveFiltersToSession(statusFilter, phoneFilter, openSubmissionsFilter, mediatoreFilter, searchQuery, value);
                }}>
                  <SelectTrigger className={isMobile ? 'w-full' : 'w-44'}>
                    <div className="flex items-center gap-2">
                      {isMobile && <Calendar className="h-4 w-4 text-gray-500" />}
                      <SelectValue placeholder="Contatti" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 border shadow-lg">
                    <SelectItem value="none">Nessun ordinamento</SelectItem>
                    <SelectItem value="futuro">📅 Contatti futuri</SelectItem>
                    <SelectItem value="passato">📅 Contatti passati</SelectItem>
                    <SelectItem value="tutti">📅 Tutti i contatti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search and Update - Row 2 (mobile) / Right side (desktop) */}
            <div className={`flex items-center gap-3 ${isMobile ? 'w-full' : ''}`}>
              <div className={`relative ${isMobile ? 'flex-1' : ''}`}>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cerca per nome, email, telefono..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    saveFiltersToSession(statusFilter, phoneFilter, openSubmissionsFilter, mediatoreFilter, e.target.value, prossimoContattoSort);
                  }}
                  className={`pl-10 ${isMobile ? 'w-full' : 'w-64'}`}
                />
              </div>
              
              <Button 
                onClick={() => {
                  fetchSubmissions();
                  fetchUniqueMediaatori();
                }} 
                variant="outline" 
                size="sm"
                className="px-3 py-2 shrink-0"
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
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'Nessuna submission trovata' : 'Nessuna submission con questo status'}
                </h3>
                <p className="text-gray-600">
                  {statusFilter === 'all' 
                    ? 'Le submissions appariranno qui quando gli utenti invieranno i form.' 
                    : 'Prova a cambiare il filtro per vedere altre submissions.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="relative">
              {/* Loading overlay */}
              {submissionsLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
                    <p className="mt-2 text-gray-600">Caricamento...</p>
                  </div>
                </div>
              )}
              
              <div className="grid gap-4">
              {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader className={`${isMobile ? 'pb-2' : 'pb-3'}`}>
                  <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex items-center justify-between'}`}>
                    <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                      {(submission.first_name || submission.last_name) ? (
                        <span className="font-bold text-[#245C4F]">
                          {submission.first_name} {submission.last_name}
                        </span>
                      ) : (
                        <span className="opacity-50">
                          sconosciuto
                        </span>
                      )}
                    </CardTitle>
                    <div className={`flex ${isMobile ? 'flex-wrap' : 'items-center'} gap-2`}>
                      <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                        {submission.form_title}
                      </Badge>
                      {submission.consulting && (
                        <Badge className={`bg-green-100 text-green-800 ${isMobile ? 'text-xs' : ''}`}>
                          Consulenza richiesta
                        </Badge>
                      )}
                      {submission.gomutuo_service && (
                        <Badge 
                          variant={submission.gomutuo_service === 'consulenza' ? "default" : "secondary"}
                          className={`text-xs ${submission.gomutuo_service === 'consulenza' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {submission.gomutuo_service === 'consulenza' ? 'Contattatemi' : 'Non Contattatemi'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={isMobile ? 'pt-0' : ''}>
                  <div className={`${isMobile ? 'mb-3' : 'flex justify-between items-start mb-4'}`}>
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                      <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                        <Calendar className="h-4 w-4" />
                        {formatDate(submission.created_at)}
                      </div>
                      {submission.phone_number && (
                        <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                          <Phone className="h-4 w-4" />
                          {submission.phone_number}
                        </div>
                      )}
                      {submission.email && (
                        <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                          <Mail className="h-4 w-4" />
                          {submission.email}
                        </div>
                      )}
                      {submission.user_identifier && (
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                          ID Utente: {submission.user_identifier}
                        </div>
                      )}
                    </div>
                    {!isMobile && (
                      <div className="text-xs text-gray-500 opacity-50">
                        Submission #{submission.id.slice(0, 8)}
                      </div>
                    )}
                  </div>

                  {/* Mobile submission ID */}
                  {isMobile && (
                    <div className="text-xs text-gray-500 opacity-50 mb-3">
                      Submission #{submission.id.slice(0, 8)}
                    </div>
                  )}

                  {/* Lead Status */}
                  <div className={isMobile ? 'mb-3' : 'mb-4'}>
                    <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-2'} mb-2`}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Status Lead:</span>
                        <LeadStatusBadge status={submission.lead_status} />
                      </div>
                      {submission.mediatore && (
                        <span className={`${isMobile ? 'text-xs ml-6' : 'text-sm'} text-gray-600`}>
                          → {submission.mediatore}
                        </span>
                      )}
                    </div>
                    <div className={`${isMobile ? 'text-xs ml-6' : 'text-sm'} text-gray-600`}>
                      <span>Assegnata a: </span>
                      <span className="font-medium">
                        {submission.assigned_admin_name || 'nessuno'}
                      </span>
                    </div>
                    
                    {/* Contact Dates */}
                    <div className={`space-y-1 mt-2 ${isMobile ? 'text-xs ml-6' : 'text-sm'} text-gray-600`}>
                      <div className="flex items-center gap-1">
                        <span>Ultimo contatto:</span>
                        <span className="font-medium">
                          {submission.ultimo_contatto 
                            ? formatDate(submission.ultimo_contatto)
                            : '(nessuno)'
                          }
                        </span>
                      </div>
                       <div className="flex items-center gap-1">
                         <span>Prossimo contatto:</span>
                         <span className={`font-medium ${
                           submission.prossimo_contatto && new Date(submission.prossimo_contatto) < new Date()
                             ? 'text-red-600 font-bold'
                             : ''
                         }`}>
                           {submission.prossimo_contatto 
                             ? formatDate(submission.prossimo_contatto)
                             : '(non in programma)'
                           }
                         </span>
                       </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {submission.notes && (
                    <div className={isMobile ? 'mb-3' : 'mb-4'}>
                      <div className={`flex items-start gap-2 mb-2`}>
                        <StickyNote className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Note:</span>
                      </div>
                      <ExpandableNotes notes={submission.notes} aiNotes={submission.ai_notes} />
                    </div>
                  )}
                   
                   <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end items-center gap-2'}`}>
                     <Button
                       onClick={() => {
                         saveScrollPosition();
                         navigate(`/admin/leads/${submission.id}`);
                       }}
                       className={`bg-[#245C4F] hover:bg-[#1e4f44] flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
                       size={isMobile ? 'sm' : 'default'}
                     >
                       <Eye className="h-4 w-4" />
                       Visualizza Dettagli
                     </Button>
                     
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button
                           variant="outline"
                           size="sm"
                           className={`border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
                           disabled={deletingId === submission.id}
                         >
                           {deletingId === submission.id ? (
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                           ) : (
                             <Trash2 className="h-4 w-4" />
                           )}
                           Elimina
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                           <AlertDialogDescription>
                             Sei sicuro di voler eliminare questa submission? 
                             {(submission.first_name || submission.last_name) && (
                               <span className="font-medium">
                                 {' '}({submission.first_name} {submission.last_name})
                               </span>
                             )}
                             <br />
                             <span className="text-red-600 font-medium">
                               Questa azione non può essere annullata e eliminerà anche tutte le risposte associate.
                             </span>
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Annulla</AlertDialogCancel>
                           <AlertDialogAction
                             onClick={() => handleDeleteSubmission(submission.id)}
                             className="bg-red-600 hover:bg-red-700"
                           >
                             Elimina Definitivamente
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </div>
                </CardContent>
              </Card>
             ))}
             </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                     <PaginationItem>
                       <PaginationPrevious 
                         href="#"
                         onClick={(e) => {
                           e.preventDefault();
                           if (currentPage > 1 && !submissionsLoading && !loading) {
                             setCurrentPage(currentPage - 1);
                           }
                         }}
                         className={currentPage === 1 || submissionsLoading || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                       />
                     </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                           <PaginationItem key={page}>
                             <PaginationLink
                               href="#"
                               onClick={(e) => {
                                 e.preventDefault();
                                 if (!submissionsLoading && !loading) {
                                   setCurrentPage(page);
                                 }
                               }}
                               isActive={currentPage === page}
                               className={submissionsLoading || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                             >
                               {page}
                             </PaginationLink>
                           </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <span className="px-4 py-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                     <PaginationItem>
                       <PaginationNext
                         href="#"
                         onClick={(e) => {
                           e.preventDefault();
                           if (currentPage < totalPages && !submissionsLoading && !loading) {
                             setCurrentPage(currentPage + 1);
                           }
                         }}
                         className={currentPage === totalPages || submissionsLoading || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                       />
                     </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}