
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Users, FileText, Phone } from 'lucide-react';
import { useStatistics, PeriodData } from '@/hooks/useStatistics';
import { PeriodSelector } from '@/components/admin/statistics/PeriodSelector';
import { StatisticCard } from '@/components/admin/statistics/StatisticCard';
import { FormBreakdownTable } from '@/components/admin/statistics/FormBreakdownTable';

export default function AdminStatistics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodData>({ type: 'lifetime' });
  const { totals, formBreakdown, loading, error, refetch } = useStatistics(period);

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/admin')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">Statistiche</h1>
              <p className="text-gray-600">Analisi dettagliate delle performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={refetch}
              variant="outline"
              size="sm"
            >
              Aggiorna
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Period Selector */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Seleziona Periodo</h2>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Total Statistics Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Generali</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatisticCard
              title="Simulazioni Salvate"
              metric={totals.simulations}
              icon={<BarChart3 className="h-6 w-6" />}
              loading={loading}
            />
            <StatisticCard
              title="Submissions Totali"
              metric={totals.submissions}
              icon={<FileText className="h-6 w-6" />}
              showConversion={true}
              loading={loading}
            />
            <StatisticCard
              title="Submissions con Contatto"
              metric={totals.submissionsWithContact}
              icon={<Phone className="h-6 w-6" />}
              showConversion={true}
              loading={loading}
            />
          </div>
        </div>

        {/* Form Breakdown */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analisi per Form</h2>
          <FormBreakdownTable formStats={formBreakdown} loading={loading} />
        </div>

        {/* Summary Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Definizioni</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Simulazioni:</strong> Numero totale di simulazioni salvate nel periodo</li>
            <li><strong>Submissions:</strong> Numero di form completati e inviati</li>
            <li><strong>Submissions con Contatto:</strong> Submissions che includono un numero di telefono</li>
            <li><strong>Tasso di conversione:</strong> Percentuale calcolata sul totale delle simulazioni</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
