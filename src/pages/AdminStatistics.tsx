
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Database, FileText, Users, Percent, Target } from 'lucide-react';
import { PeriodSelector } from '@/components/admin/statistics/PeriodSelector';
import { StatisticsCard } from '@/components/admin/statistics/StatisticsCard';
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
              <h1 className="text-2xl font-bold text-[#245C4F]">Statistiche</h1>
              <p className="text-gray-600">Analytics e metriche della piattaforma</p>
            </div>
          </div>
          <PeriodSelector value={period} onValueChange={setPeriod} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiche Principali</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatisticsCard
              title="Simulazioni Salvate"
              value={data?.totalSimulations || 0}
              previousValue={data?.previousPeriod.totalSimulations}
              onClick={() => openChart('Simulazioni Salvate nel Tempo', 'simulations', 'bar')}
            />
            
            <StatisticsCard
              title="Submissions"
              value={data?.totalSubmissions || 0}
              previousValue={data?.previousPeriod.totalSubmissions}
              onClick={() => openChart('Submissions nel Tempo', 'submissions', 'bar')}
            />
            
            <StatisticsCard
              title="% Submissions / Simulazioni"
              value={data?.submissionsPercentage || 0}
              previousValue={data?.previousPeriod.submissionsPercentage}
              format="percentage"
              onClick={() => openChart('Tasso di Conversione nel Tempo', 'submissions', 'line')}
            />
            
            <StatisticsCard
              title="% Submissions con Contatti"
              value={data?.submissionsWithContactPercentage || 0}
              previousValue={data?.previousPeriod.submissionsWithContactPercentage}
              format="percentage"
              onClick={() => openChart('Submissions con Contatti nel Tempo', 'submissionsWithContact', 'line')}
            />
            
            <StatisticsCard
              title="% Contatti / Simulazioni"
              value={data?.submissionsWithContactOverSimulationsPercentage || 0}
              previousValue={data?.previousPeriod.submissionsWithContactOverSimulationsPercentage}
              format="percentage"
              onClick={() => openChart('Tasso Contatti su Simulazioni nel Tempo', 'submissionsWithContact', 'line')}
            />
          </div>
        </div>

        {/* Form Breakdown */}
        {data?.formBreakdown && Object.keys(data.formBreakdown).length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Breakdown per Form</h2>
            <div className="space-y-6">
              {Object.entries(data.formBreakdown).map(([formSlug, breakdown]) => (
                <Card key={formSlug}>
                  <CardHeader>
                    <CardTitle className="text-lg text-[#245C4F]">
                      Form: {formSlug}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <StatisticsCard
                        title="Simulazioni"
                        value={breakdown.simulations}
                        description={`Form: ${formSlug}`}
                      />
                      
                      <StatisticsCard
                        title="Submissions"
                        value={breakdown.submissions}
                        description={`Form: ${formSlug}`}
                      />
                      
                      <StatisticsCard
                        title="% Conversione"
                        value={breakdown.submissionsPercentage}
                        format="percentage"
                        description={`Submissions / Simulazioni`}
                      />
                      
                      <StatisticsCard
                        title="% Con Contatti"
                        value={breakdown.submissionsWithContactPercentage}
                        format="percentage"
                        description={`Su submissions`}
                      />
                      
                      <StatisticsCard
                        title="% Contatti/Sim"
                        value={breakdown.submissionsWithContactOverSimulationsPercentage}
                        format="percentage"
                        description={`Contatti / Simulazioni`}
                      />
                    </div>
                  </CardContent>
                </Card>
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
