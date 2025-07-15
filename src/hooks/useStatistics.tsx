
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type StatisticsPeriod = 'lifetime' | '60d' | '30d' | '14d' | '7d' | '3d' | 'yesterday' | 'today';

export interface StatisticsData {
  totalSimulations: number;
  totalSubmissions: number;
  submissionsPercentage: number;
  submissionsWithContactPercentage: number;
  submissionsWithContactOverSimulationsPercentage: number;
  formBreakdown: {
    [formSlug: string]: {
      simulations: number;
      submissions: number;
      submissionsPercentage: number;
      submissionsWithContactPercentage: number;
      submissionsWithContactOverSimulationsPercentage: number;
    };
  };
  previousPeriod: {
    totalSimulations: number;
    totalSubmissions: number;
    submissionsPercentage: number;
    submissionsWithContactPercentage: number;
    submissionsWithContactOverSimulationsPercentage: number;
  };
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

        // Fetch current period data
        const [simulationsResult, submissionsResult, submissionsWithContactResult] = await Promise.all([
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

        const forms = submissionsWithContactResult.data || [];
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

        // Calculate form breakdown
        const formBreakdown: StatisticsData['formBreakdown'] = {};
        
        // Get all form slugs
        const allFormSlugs = new Set([
          ...simulations.map(s => s.form_slug),
          ...submissions.map(s => formIdToSlug[s.form_id]).filter(Boolean)
        ]);

        allFormSlugs.forEach(formSlug => {
          const formSimulations = simulations.filter(s => s.form_slug === formSlug).length;
          const formSubmissions = submissions.filter(s => formIdToSlug[s.form_id] === formSlug).length;
          const formSubmissionsWithContact = submissionsWithContact.filter(s => formIdToSlug[s.form_id] === formSlug).length;

          formBreakdown[formSlug] = {
            simulations: formSimulations,
            submissions: formSubmissions,
            submissionsPercentage: formSimulations > 0 ? Math.round((formSubmissions / formSimulations) * 100) : 0,
            submissionsWithContactPercentage: formSubmissions > 0 ? Math.round((formSubmissionsWithContact / formSubmissions) * 100) : 0,
            submissionsWithContactOverSimulationsPercentage: formSimulations > 0 ? Math.round((formSubmissionsWithContact / formSimulations) * 100) : 0,
          };
        });

        // Generate daily data for charts
        const dailyDataMap = new Map<string, DailyData>();
        const currentDate = new Date(startDate);
        
        while (currentDate < endDate) {
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
        simulations.forEach(sim => {
          const date = sim.created_at.split('T')[0];
          const dayData = dailyDataMap.get(date);
          if (dayData) {
            dayData.simulations++;
          }
        });

        submissions.forEach(sub => {
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

        // Calculate main statistics
        const totalSimulations = simulations.length;
        const totalSubmissions = submissions.length;
        const totalSubmissionsWithContact = submissionsWithContact.length;

        const prevTotalSimulations = prevSimulations.length;
        const prevTotalSubmissions = prevSubmissions.length;
        const prevTotalSubmissionsWithContact = prevSubmissionsWithContact.length;

        setData({
          totalSimulations,
          totalSubmissions,
          submissionsPercentage: totalSimulations > 0 ? Math.round((totalSubmissions / totalSimulations) * 100) : 0,
          submissionsWithContactPercentage: totalSubmissions > 0 ? Math.round((totalSubmissionsWithContact / totalSubmissions) * 100) : 0,
          submissionsWithContactOverSimulationsPercentage: totalSimulations > 0 ? Math.round((totalSubmissionsWithContact / totalSimulations) * 100) : 0,
          formBreakdown,
          previousPeriod: {
            totalSimulations: prevTotalSimulations,
            totalSubmissions: prevTotalSubmissions,
            submissionsPercentage: prevTotalSimulations > 0 ? Math.round((prevTotalSubmissions / prevTotalSimulations) * 100) : 0,
            submissionsWithContactPercentage: prevTotalSubmissions > 0 ? Math.round((prevTotalSubmissionsWithContact / prevTotalSubmissions) * 100) : 0,
            submissionsWithContactOverSimulationsPercentage: prevTotalSimulations > 0 ? Math.round((prevTotalSubmissionsWithContact / prevTotalSimulations) * 100) : 0,
          }
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
