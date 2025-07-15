
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PeriodSelector } from '@/components/admin/statistics/PeriodSelector';
import { FunnelCard } from '@/components/admin/statistics/FunnelCard';
import { StatisticsChart } from '@/components/admin/statistics/StatisticsChart';
import { useStatistics, StatisticsPeriod, DailyData } from '@/hooks/useStatistics';

export default function AdminStatistics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<StatisticsPeriod>('30d');
  const [chartOpen, setChartOpen] = useState(false);
  const [chartConfig, setChartConfig] = useState<{
    title: string;
    dataKey: keyof DailyData;
    chartType: 'line' | 'bar';
  } | null>(null);

  const { data, dailyData, loading, error } = useStatistics(period);

  const openChart = (title: string, dataKey: keyof DailyData, chartType: 'line' | 'bar' = 'line') => {
    setChartConfig({ title, dataKey, chartType });
    setChartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento statistiche...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Riprova
          </Button>
        </div>
      </div>
    );
  }

  const formatPeriodLabel = (period: StatisticsPeriod) => {
    switch (period) {
      case 'lifetime': return 'Lifetime';
      case '60d': return 'Ultimi 60 giorni';
      case '30d': return 'Ultimi 30 giorni';
      case '14d': return 'Ultimi 14 giorni';
      case '7d': return 'Ultimi 7 giorni';
      case '3d': return 'Ultimi 3 giorni';
      case 'yesterday': return 'Ieri';
      case 'today': return 'Oggi';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
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
              Torna al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">Statistiche - Funnel di Conversione</h1>
              <p className="text-gray-600">
                Analisi del percorso: Simulazione → Submission → Contatto ({formatPeriodLabel(period)})
              </p>
            </div>
          </div>
          <PeriodSelector value={period} onValueChange={setPeriod} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Total Funnel */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Funnel Totale</h2>
          <div className="max-w-2xl">
            {data && (
              <FunnelCard
                title="Conversione Globale"
                funnel={data.totalFunnel}
                onClick={() => openChart('Funnel di Conversione nel Tempo', 'simulations', 'line')}
              />
            )}
          </div>
        </div>

        {/* Form Breakdown */}
        {data?.formBreakdown && data.formBreakdown.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Breakdown per Form</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.formBreakdown.map((formData) => (
                <FunnelCard
                  key={formData.formSlug}
                  title={`Form: ${formData.formSlug}`}
                  funnel={formData.funnel}
                  onClick={() => openChart(`Funnel ${formData.formSlug} nel Tempo`, 'simulations', 'line')}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Chart Dialog */}
      {chartConfig && (
        <StatisticsChart
          open={chartOpen}
          onOpenChange={setChartOpen}
          title={chartConfig.title}
          data={dailyData}
          dataKey={chartConfig.dataKey}
          chartType={chartConfig.chartType}
        />
      )}
    </div>
  );
}
