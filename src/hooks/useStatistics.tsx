
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
      submissionsWithContact: { current: 0, previous: 0, change: 0, changePercent: 0 }
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

      // Fetch current period data
      const [currentSimulations, currentSubmissions, currentSubmissionsWithContact] = await Promise.all([
        // Simulazioni salvate
        supabase
          .from('saved_simulations')
          .select('form_slug, created_at')
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString()),
        
        // Submissions totali
        supabase
          .from('form_submissions')
          .select('form_id, created_at')
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString()),
        
        // Submissions con contatto (con phone_number)
        supabase
          .from('form_submissions')
          .select('form_id, created_at')
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString())
          .not('phone_number', 'is', null)
          .neq('phone_number', '')
      ]);

      // Fetch previous period data
      const [prevSimulations, prevSubmissions, prevSubmissionsWithContact] = await Promise.all([
        supabase
          .from('saved_simulations')
          .select('form_slug, created_at')
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString()),
        
        supabase
          .from('form_submissions')
          .select('form_id, created_at')
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString()),
        
        supabase
          .from('form_submissions')
          .select('form_id, created_at')
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString())
          .not('phone_number', 'is', null)
          .neq('phone_number', '')
      ]);

      // Fetch forms for mapping
      const { data: forms } = await supabase
        .from('forms')
        .select('id, slug, title');

      if (currentSimulations.error) throw currentSimulations.error;
      if (currentSubmissions.error) throw currentSubmissions.error;
      if (currentSubmissionsWithContact.error) throw currentSubmissionsWithContact.error;

      const formsMap = new Map(forms?.map(f => [f.id, { slug: f.slug, title: f.title }]) || []);
      const slugToIdMap = new Map(forms?.map(f => [f.slug, f.id]) || []);

      // Calculate totals
      const currentSimulationsCount = currentSimulations.data?.length || 0;
      const currentSubmissionsCount = currentSubmissions.data?.length || 0;
      const currentSubmissionsWithContactCount = currentSubmissionsWithContact.data?.length || 0;

      const prevSimulationsCount = prevSimulations.data?.length || 0;
      const prevSubmissionsCount = prevSubmissions.data?.length || 0;
      const prevSubmissionsWithContactCount = prevSubmissionsWithContact.data?.length || 0;

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

      // Calculate form breakdown
      const formBreakdown: FormStatistics[] = [];
      const processedForms = new Set<string>();

      // Process simulations by form
      currentSimulations.data?.forEach(sim => {
        if (!processedForms.has(sim.form_slug)) {
          processedForms.add(sim.form_slug);
          
          const formId = slugToIdMap.get(sim.form_slug);
          const formInfo = formsMap.get(formId || '');
          
          const formCurrentSims = currentSimulations.data?.filter(s => s.form_slug === sim.form_slug).length || 0;
          const formCurrentSubs = currentSubmissions.data?.filter(s => formsMap.get(s.form_id || '')?.slug === sim.form_slug).length || 0;
          const formCurrentSubsWithContact = currentSubmissionsWithContact.data?.filter(s => formsMap.get(s.form_id || '')?.slug === sim.form_slug).length || 0;
          
          const formPrevSims = prevSimulations.data?.filter(s => s.form_slug === sim.form_slug).length || 0;
          const formPrevSubs = prevSubmissions.data?.filter(s => formsMap.get(s.form_id || '')?.slug === sim.form_slug).length || 0;
          const formPrevSubsWithContact = prevSubmissionsWithContact.data?.filter(s => formsMap.get(s.form_id || '')?.slug === sim.form_slug).length || 0;

          formBreakdown.push({
            formSlug: sim.form_slug,
            formTitle: formInfo?.title || sim.form_slug,
            simulations: calculateMetric(formCurrentSims, formPrevSims),
            submissions: calculateMetric(formCurrentSubs, formPrevSubs, formCurrentSims),
            submissionsWithContact: calculateMetric(formCurrentSubsWithContact, formPrevSubsWithContact, formCurrentSims)
          });
        }
      });

      setData({
        totals: {
          simulations: calculateMetric(currentSimulationsCount, prevSimulationsCount),
          submissions: calculateMetric(currentSubmissionsCount, prevSubmissionsCount, currentSimulationsCount),
          submissionsWithContact: calculateMetric(currentSubmissionsWithContactCount, prevSubmissionsWithContactCount, currentSimulationsCount)
        },
        formBreakdown,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nel caricamento delle statistiche'
      }));
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle statistiche",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  return { ...data, refetch: fetchStatistics };
}
