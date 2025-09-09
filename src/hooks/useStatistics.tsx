
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type PeriodType = 'lifetime' | '60d' | '30d' | '14d' | '7d' | '3d' | 'yesterday' | 'today' | 'custom';

export interface CustomPeriod {
  startDate: Date;
  endDate: Date;
}

export interface PeriodData {
  type: PeriodType;
  custom?: CustomPeriod;
}

export interface StatisticMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  conversionRate?: number;
}

export interface FormStatistics {
  formSlug: string;
  formTitle: string;
  simulations: StatisticMetric;
  submissions: StatisticMetric;
  submissionsWithContact: StatisticMetric;
}

export interface StatisticsData {
  totals: {
    simulations: StatisticMetric;
    submissions: StatisticMetric;
    submissionsWithContact: StatisticMetric;
    consulting: StatisticMetric;
  };
  formBreakdown: FormStatistics[];
  loading: boolean;
  error: string | null;
}

export function useStatistics(period: PeriodData) {
  const [data, setData] = useState<StatisticsData>({
    totals: {
      simulations: { current: 0, previous: 0, change: 0, changePercent: 0 },
      submissions: { current: 0, previous: 0, change: 0, changePercent: 0 },
      submissionsWithContact: { current: 0, previous: 0, change: 0, changePercent: 0 },
      consulting: { current: 0, previous: 0, change: 0, changePercent: 0 }
    },
    formBreakdown: [],
    loading: true,
    error: null
  });

  const calculatePeriodDates = (periodData: PeriodData) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (periodData.type) {
      case 'lifetime':
        startDate = new Date('2025-07-13T00:00:00.000Z'); // Project start date
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '14d':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '3d':
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case 'yesterday':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
        break;
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (periodData.custom) {
          startDate = periodData.custom.startDate;
          endDate = periodData.custom.endDate;
        } else {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = new Date(startDate.getTime() - 1);

    return {
      currentPeriod: { start: startDate, end: endDate },
      previousPeriod: { start: previousStartDate, end: previousEndDate }
    };
  };

  const fetchStatistics = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const { currentPeriod, previousPeriod } = calculatePeriodDates(period);

      // Fetch forms first for form breakdown
      const { data: forms } = await supabase
        .from('forms')
        .select('id, slug, title');

      const formsMap = new Map(forms?.map(f => [f.id, { slug: f.slug, title: f.title }]) || []);

      // Fetch current period totals using COUNT
      const [currentSimulations, currentSubmissions, currentSubmissionsWithContact, currentConsulting] = await Promise.all([
        // Simulazioni salvate - count total
        supabase
          .from('saved_simulations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString()),
        
        // Submissions totali - count total
        supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString()),
        
        // Submissions con contatto - count total
        supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString())
          .not('phone_number', 'is', null)
          .neq('phone_number', ''),

        // Submissions with consulting - count total
        supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString())
          .or('consulting.eq.true,gomutuo_service.eq.consulenza')
      ]);

      // Fetch previous period totals using COUNT
      const [prevSimulations, prevSubmissions, prevSubmissionsWithContact, prevConsulting] = await Promise.all([
        supabase
          .from('saved_simulations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString()),
        
        supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString()),
        
        supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString())
          .not('phone_number', 'is', null)
          .neq('phone_number', ''),

        supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString())
          .or('consulting.eq.true,gomutuo_service.eq.consulenza')
      ]);

      if (currentSimulations.error) throw currentSimulations.error;
      if (currentSubmissions.error) throw currentSubmissions.error;
      if (currentSubmissionsWithContact.error) throw currentSubmissionsWithContact.error;
      if (currentConsulting.error) throw currentConsulting.error;

      // Calculate totals from counts
      const currentSimulationsCount = currentSimulations.count || 0;
      const currentSubmissionsCount = currentSubmissions.count || 0;
      const currentSubmissionsWithContactCount = currentSubmissionsWithContact.count || 0;
      const currentConsultingCount = currentConsulting.count || 0;

      const prevSimulationsCount = prevSimulations.count || 0;
      const prevSubmissionsCount = prevSubmissions.count || 0;
      const prevSubmissionsWithContactCount = prevSubmissionsWithContact.count || 0;
      const prevConsultingCount = prevConsulting.count || 0;

      // Helper function to calculate metrics
      const calculateMetric = (current: number, previous: number, totalSimulations?: number): StatisticMetric => {
        const change = current - previous;
        const changePercent = previous > 0 ? (change / previous) * 100 : current > 0 ? 100 : 0;
        const conversionRate = totalSimulations && totalSimulations > 0 ? (current / totalSimulations) * 100 : undefined;

        return {
          current,
          previous,
          change,
          changePercent,
          conversionRate
        };
      };

      // Calculate form breakdown using count queries for each form
      const formBreakdown: FormStatistics[] = [];
      
      if (forms && forms.length > 0) {
        // Fetch counts for each form in parallel
        const formCountPromises = forms.map(async (form) => {
          const [
            currentSimsCount,
            currentSubsCount, 
            currentSubsWithContactCount,
            prevSimsCount,
            prevSubsCount,
            prevSubsWithContactCount
          ] = await Promise.all([
            // Current period counts for this form
            supabase
              .from('saved_simulations')
              .select('*', { count: 'exact', head: true })
              .eq('form_slug', form.slug)
              .gte('created_at', currentPeriod.start.toISOString())
              .lte('created_at', currentPeriod.end.toISOString()),
            
            supabase
              .from('form_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('form_id', form.id)
              .gte('created_at', currentPeriod.start.toISOString())
              .lte('created_at', currentPeriod.end.toISOString()),
            
            supabase
              .from('form_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('form_id', form.id)
              .gte('created_at', currentPeriod.start.toISOString())
              .lte('created_at', currentPeriod.end.toISOString())
              .not('phone_number', 'is', null)
              .neq('phone_number', ''),
            
            // Previous period counts for this form
            supabase
              .from('saved_simulations')
              .select('*', { count: 'exact', head: true })
              .eq('form_slug', form.slug)
              .gte('created_at', previousPeriod.start.toISOString())
              .lte('created_at', previousPeriod.end.toISOString()),
            
            supabase
              .from('form_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('form_id', form.id)
              .gte('created_at', previousPeriod.start.toISOString())
              .lte('created_at', previousPeriod.end.toISOString()),
            
            supabase
              .from('form_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('form_id', form.id)
              .gte('created_at', previousPeriod.start.toISOString())
              .lte('created_at', previousPeriod.end.toISOString())
              .not('phone_number', 'is', null)
              .neq('phone_number', '')
          ]);

          const formCurrentSims = currentSimsCount.count || 0;
          const formCurrentSubs = currentSubsCount.count || 0;
          const formCurrentSubsWithContact = currentSubsWithContactCount.count || 0;
          
          const formPrevSims = prevSimsCount.count || 0;
          const formPrevSubs = prevSubsCount.count || 0;
          const formPrevSubsWithContact = prevSubsWithContactCount.count || 0;

          return {
            formSlug: form.slug,
            formTitle: form.title || form.slug,
            simulations: calculateMetric(formCurrentSims, formPrevSims),
            submissions: calculateMetric(formCurrentSubs, formPrevSubs, formCurrentSims),
            submissionsWithContact: calculateMetric(formCurrentSubsWithContact, formPrevSubsWithContact, formCurrentSims)
          };
        });

        // Wait for all form counts to complete
        const formStats = await Promise.all(formCountPromises);
        formBreakdown.push(...formStats.filter(stat => stat.simulations.current > 0 || stat.simulations.previous > 0));
      }

      setData({
        totals: {
          simulations: calculateMetric(currentSimulationsCount, prevSimulationsCount),
          submissions: calculateMetric(currentSubmissionsCount, prevSubmissionsCount, currentSimulationsCount),
          submissionsWithContact: calculateMetric(currentSubmissionsWithContactCount, prevSubmissionsWithContactCount, currentSimulationsCount),
          consulting: calculateMetric(currentConsultingCount, prevConsultingCount, currentSimulationsCount)
        },
        formBreakdown,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
      
      // Check if it's an auth error
      const isAuthError = error?.message?.includes('Invalid Refresh Token') || 
                         error?.message?.includes('refresh_token_not_found') ||
                         error?.code === 'refresh_token_not_found';
      
      const errorMessage = isAuthError 
        ? 'Sessione scaduta. Aggiorna la pagina per riautenticarti e vedere tutti i dati.'
        : 'Errore nel caricamento delle statistiche';
      
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      toast({
        title: isAuthError ? "Sessione Scaduta" : "Errore",
        description: errorMessage,
        variant: "destructive",
        duration: isAuthError ? 8000 : 5000,
      });
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  return { ...data, refetch: fetchStatistics };
}
