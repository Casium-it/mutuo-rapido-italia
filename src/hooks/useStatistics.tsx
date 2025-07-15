
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type StatisticsPeriod = 'lifetime' | '60d' | '30d' | '14d' | '7d' | '3d' | 'yesterday' | 'today';

export interface FunnelStep {
  label: string;
  value: number;
  previousValue: number;
  lossFromPrevious?: number; // percentage lost from previous step
  conversionFromTotal: number; // percentage from total simulations
}

export interface FormFunnelData {
  formSlug: string;
  funnel: FunnelStep[];
}

export interface StatisticsData {
  totalFunnel: FunnelStep[];
  formBreakdown: FormFunnelData[];
  period: StatisticsPeriod;
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
}

export interface DailyData {
  date: string;
  simulations: number;
  submissions: number;
  submissionsWithContact: number;
}

const getPeriodDates = (period: StatisticsPeriod) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  let endDate: Date;
  
  switch (period) {
    case 'today':
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'yesterday':
      startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      endDate = today;
      break;
    case '3d':
      startDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case '14d':
      startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case '60d':
      startDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'lifetime':
      startDate = new Date('2025-07-13T00:00:00.000Z');
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
  }
  
  return { startDate, endDate };
};

const getPreviousPeriodDates = (period: StatisticsPeriod, startDate: Date, endDate: Date) => {
  if (period === 'lifetime') {
    return { startDate: new Date('2025-07-13T00:00:00.000Z'), endDate: startDate };
  }
  
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousEndDate = startDate;
  const previousStartDate = new Date(startDate.getTime() - periodLength);
  
  return { startDate: previousStartDate, endDate: previousEndDate };
};

const calculateFunnel = (
  simulations: number,
  submissions: number,
  submissionsWithContact: number,
  prevSimulations: number,
  prevSubmissions: number,
  prevSubmissionsWithContact: number
): FunnelStep[] => {
  const steps: FunnelStep[] = [
    {
      label: 'Simulazioni',
      value: simulations,
      previousValue: prevSimulations,
      conversionFromTotal: 100
    },
    {
      label: 'Submissions',
      value: submissions,
      previousValue: prevSubmissions,
      lossFromPrevious: simulations > 0 ? Math.round(((simulations - submissions) / simulations) * 100) : 0,
      conversionFromTotal: simulations > 0 ? Math.round((submissions / simulations) * 100) : 0
    },
    {
      label: 'Submissions con Contatti',
      value: submissionsWithContact,
      previousValue: prevSubmissionsWithContact,
      lossFromPrevious: submissions > 0 ? Math.round(((submissions - submissionsWithContact) / submissions) * 100) : 0,
      conversionFromTotal: simulations > 0 ? Math.round((submissionsWithContact / simulations) * 100) : 0
    }
  ];

  return steps;
};

const getMinimumGraphPeriod = (period: StatisticsPeriod, startDate: Date, endDate: Date) => {
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  
  if (periodDays < 14) {
    // Extend to 14 days minimum
    const newStartDate = new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    return { startDate: newStartDate, endDate };
  }
  
  return { startDate, endDate };
};

export const useStatistics = (period: StatisticsPeriod) => {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        const { startDate, endDate } = getPeriodDates(period);
        const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriodDates(period, startDate, endDate);

        // Get minimum 14 days for graph data
        const { startDate: graphStartDate, endDate: graphEndDate } = getMinimumGraphPeriod(period, startDate, endDate);

        // Fetch current period data
        const [simulationsResult, submissionsResult, formsResult] = await Promise.all([
          // Simulations
          supabase
            .from('saved_simulations')
            .select('form_slug, created_at')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString()),
          
          // Submissions
          supabase
            .from('form_submissions')
            .select('form_id, phone_number, created_at')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString()),
          
          // Forms mapping
          supabase
            .from('forms')
            .select('id, slug')
        ]);

        if (simulationsResult.error) throw simulationsResult.error;
        if (submissionsResult.error) throw submissionsResult.error;
        if (formsResult.error) throw formsResult.error;

        const forms = formsResult.data || [];
        const formIdToSlug = forms.reduce((acc, form) => {
          acc[form.id] = form.slug;
          return acc;
        }, {} as Record<string, string>);

        // Process current period data
        const simulations = simulationsResult.data || [];
        const submissions = submissionsResult.data || [];
        const submissionsWithContact = submissions.filter(s => s.phone_number);

        // Fetch previous period data
        const [prevSimulationsResult, prevSubmissionsResult] = await Promise.all([
          supabase
            .from('saved_simulations')
            .select('form_slug, created_at')
            .gte('created_at', prevStartDate.toISOString())
            .lt('created_at', prevEndDate.toISOString()),
          
          supabase
            .from('form_submissions')
            .select('form_id, phone_number, created_at')
            .gte('created_at', prevStartDate.toISOString())
            .lt('created_at', prevEndDate.toISOString())
        ]);

        const prevSimulations = prevSimulationsResult.data || [];
        const prevSubmissions = prevSubmissionsResult.data || [];
        const prevSubmissionsWithContact = prevSubmissions.filter(s => s.phone_number);

        // Calculate total funnel
        const totalFunnel = calculateFunnel(
          simulations.length,
          submissions.length,
          submissionsWithContact.length,
          prevSimulations.length,
          prevSubmissions.length,
          prevSubmissionsWithContact.length
        );

        // Calculate form breakdown
        const allFormSlugs = new Set([
          ...simulations.map(s => s.form_slug),
          ...submissions.map(s => formIdToSlug[s.form_id]).filter(Boolean)
        ]);

        const formBreakdown: FormFunnelData[] = Array.from(allFormSlugs).map(formSlug => {
          const formSimulations = simulations.filter(s => s.form_slug === formSlug).length;
          const formSubmissions = submissions.filter(s => formIdToSlug[s.form_id] === formSlug).length;
          const formSubmissionsWithContact = submissionsWithContact.filter(s => formIdToSlug[s.form_id] === formSlug).length;

          const prevFormSimulations = prevSimulations.filter(s => s.form_slug === formSlug).length;
          const prevFormSubmissions = prevSubmissions.filter(s => formIdToSlug[s.form_id] === formSlug).length;
          const prevFormSubmissionsWithContact = prevSubmissionsWithContact.filter(s => formIdToSlug[s.form_id] === formSlug).length;

          const funnel = calculateFunnel(
            formSimulations,
            formSubmissions,
            formSubmissionsWithContact,
            prevFormSimulations,
            prevFormSubmissions,
            prevFormSubmissionsWithContact
          );

          return {
            formSlug,
            funnel
          };
        });

        // Fetch graph data for minimum 14 days
        const [graphSimulationsResult, graphSubmissionsResult] = await Promise.all([
          supabase
            .from('saved_simulations')
            .select('form_slug, created_at')
            .gte('created_at', graphStartDate.toISOString())
            .lt('created_at', graphEndDate.toISOString()),
          
          supabase
            .from('form_submissions')
            .select('form_id, phone_number, created_at')
            .gte('created_at', graphStartDate.toISOString())
            .lt('created_at', graphEndDate.toISOString())
        ]);

        const graphSimulations = graphSimulationsResult.data || [];
        const graphSubmissions = graphSubmissionsResult.data || [];
        const graphSubmissionsWithContact = graphSubmissions.filter(s => s.phone_number);

        // Generate daily data for charts (minimum 14 days)
        const dailyDataMap = new Map<string, DailyData>();
        const currentDate = new Date(graphStartDate);
        
        while (currentDate < graphEndDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          dailyDataMap.set(dateStr, {
            date: dateStr,
            simulations: 0,
            submissions: 0,
            submissionsWithContact: 0
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Populate daily data
        graphSimulations.forEach(sim => {
          const date = sim.created_at.split('T')[0];
          const dayData = dailyDataMap.get(date);
          if (dayData) {
            dayData.simulations++;
          }
        });

        graphSubmissions.forEach(sub => {
          const date = sub.created_at.split('T')[0];
          const dayData = dailyDataMap.get(date);
          if (dayData) {
            dayData.submissions++;
            if (sub.phone_number) {
              dayData.submissionsWithContact++;
            }
          }
        });

        setDailyData(Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

        setData({
          totalFunnel,
          formBreakdown,
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          previousStartDate: prevStartDate.toISOString(),
          previousEndDate: prevEndDate.toISOString()
        });

      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [period]);

  return { data, dailyData, loading, error };
};
