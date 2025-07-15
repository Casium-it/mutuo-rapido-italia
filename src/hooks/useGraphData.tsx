
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type GraphPeriod = '14d' | '30d' | '60d';
export type ConversionType = 'completion' | 'contact' | 'funnel';

export interface DailyData {
  date: string;
  simulations: number;
  submissions: number;
  submissionsWithContact: number;
  completionRate: number; // submissions/simulations
  contactRate: number; // submissionsWithContact/submissions
  funnelRate: number; // submissionsWithContact/simulations
}

export interface GraphData {
  data: DailyData[];
  loading: boolean;
  error: string | null;
}

export function useGraphData(period: GraphPeriod, formSlug?: string) {
  const [data, setData] = useState<GraphData>({
    data: [],
    loading: true,
    error: null
  });

  const calculatePeriodDates = (period: GraphPeriod) => {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now);

    switch (period) {
      case '14d':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  };

  const fetchGraphData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const { startDate, endDate } = calculatePeriodDates(period);

      // Build queries based on whether we need form-specific data
      let simulationsQuery = supabase
        .from('saved_simulations')
        .select('created_at, form_slug')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      let submissionsQuery = supabase
        .from('form_submissions')
        .select('created_at, form_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      let submissionsWithContactQuery = supabase
        .from('form_submissions')
        .select('created_at, form_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('phone_number', 'is', null)
        .neq('phone_number', '');

      // If formSlug is provided, filter by specific form
      if (formSlug) {
        simulationsQuery = simulationsQuery.eq('form_slug', formSlug);
        
        // Get form ID for filtering submissions
        const { data: forms } = await supabase
          .from('forms')
          .select('id')
          .eq('slug', formSlug)
          .single();

        if (forms) {
          submissionsQuery = submissionsQuery.eq('form_id', forms.id);
          submissionsWithContactQuery = submissionsWithContactQuery.eq('form_id', forms.id);
        }
      }

      const [simulationsResult, submissionsResult, submissionsWithContactResult] = await Promise.all([
        simulationsQuery,
        submissionsQuery,
        submissionsWithContactQuery
      ]);

      if (simulationsResult.error) throw simulationsResult.error;
      if (submissionsResult.error) throw submissionsResult.error;
      if (submissionsWithContactResult.error) throw submissionsWithContactResult.error;

      // Group data by date
      const dailyMap = new Map<string, DailyData>();

      // Initialize all dates in the period
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyMap.set(dateStr, {
          date: dateStr,
          simulations: 0,
          submissions: 0,
          submissionsWithContact: 0,
          completionRate: 0,
          contactRate: 0,
          funnelRate: 0
        });
      }

      // Count simulations by date
      simulationsResult.data?.forEach(sim => {
        const dateStr = sim.created_at.split('T')[0];
        const entry = dailyMap.get(dateStr);
        if (entry) {
          entry.simulations++;
        }
      });

      // Count submissions by date
      submissionsResult.data?.forEach(sub => {
        const dateStr = sub.created_at.split('T')[0];
        const entry = dailyMap.get(dateStr);
        if (entry) {
          entry.submissions++;
        }
      });

      // Count submissions with contact by date
      submissionsWithContactResult.data?.forEach(sub => {
        const dateStr = sub.created_at.split('T')[0];
        const entry = dailyMap.get(dateStr);
        if (entry) {
          entry.submissionsWithContact++;
        }
      });

      // Calculate conversion rates
      dailyMap.forEach(entry => {
        entry.completionRate = entry.simulations > 0 ? (entry.submissions / entry.simulations) * 100 : 0;
        entry.contactRate = entry.submissions > 0 ? (entry.submissionsWithContact / entry.submissions) * 100 : 0;
        entry.funnelRate = entry.simulations > 0 ? (entry.submissionsWithContact / entry.simulations) * 100 : 0;
      });

      const sortedData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      setData({
        data: sortedData,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching graph data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nel caricamento dei dati del grafico'
      }));
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati del grafico",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [period, formSlug]);

  return { ...data, refetch: fetchGraphData };
}
