
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FormStatistics } from '@/hooks/useStatistics';

interface FormBreakdownTableProps {
  formStats: FormStatistics[];
}

export function FormBreakdownTable({ formStats }: FormBreakdownTableProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT').format(num);
  };

  const formatPercent = (num: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num / 100);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (formStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breakdown per Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Nessun dato disponibile per il periodo selezionato
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown per Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Form</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Simulazioni</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Submissions</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Con Contatto</th>
              </tr>
            </thead>
            <tbody>
              {formStats.map((form) => (
                <tr key={form.formSlug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div>
                      <div className="font-medium text-gray-900">{form.formTitle}</div>
                      <div className="text-xs text-gray-500">{form.formSlug}</div>
                    </div>
                  </td>
                  
                  {/* Simulazioni */}
                  <td className="py-4 px-2 text-center">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-[#245C4F]">
                        {formatNumber(form.simulations.current)}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        {getTrendIcon(form.simulations.change)}
                        <span className={`font-medium ${getTrendColor(form.simulations.change)}`}>
                          {form.simulations.change >= 0 ? '+' : ''}{formatNumber(form.simulations.change)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.simulations.previous)}
                      </div>
                    </div>
                  </td>

                  {/* Submissions */}
                  <td className="py-4 px-2 text-center">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-blue-600">
                        {formatNumber(form.submissions.current)}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        {getTrendIcon(form.submissions.change)}
                        <span className={`font-medium ${getTrendColor(form.submissions.change)}`}>
                          {form.submissions.change >= 0 ? '+' : ''}{formatNumber(form.submissions.change)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.submissions.previous)}
                      </div>
                      {form.submissions.conversionRate !== undefined && (
                        <div className="text-xs font-medium text-blue-700">
                          {formatPercent(form.submissions.conversionRate)} conv.
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Con Contatto */}
                  <td className="py-4 px-2 text-center">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-purple-600">
                        {formatNumber(form.submissionsWithContact.current)}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        {getTrendIcon(form.submissionsWithContact.change)}
                        <span className={`font-medium ${getTrendColor(form.submissionsWithContact.change)}`}>
                          {form.submissionsWithContact.change >= 0 ? '+' : ''}{formatNumber(form.submissionsWithContact.change)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.submissionsWithContact.previous)}
                      </div>
                      {form.submissionsWithContact.conversionRate !== undefined && (
                        <div className="text-xs font-medium text-purple-700">
                          {formatPercent(form.submissionsWithContact.conversionRate)} conv.
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
