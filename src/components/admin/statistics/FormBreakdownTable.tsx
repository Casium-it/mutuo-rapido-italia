import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormStatistics } from '@/hooks/useStatistics';

interface FormBreakdownTableProps {
  formStats: FormStatistics[];
  loading?: boolean;
}

export function FormBreakdownTable({ formStats, loading = false }: FormBreakdownTableProps) {
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

  if (loading) {
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
                  <th className="text-center py-3 px-2 font-medium text-gray-700">Consulenza (ALL)</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">Consulenza (Phone)</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-2">
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="py-6 px-2 text-center">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-12 mx-auto" />
                          <Skeleton className="h-3 w-20 mx-auto" />
                          <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                          <Skeleton className="h-3 w-16 mx-auto" />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <th className="text-center py-3 px-2 font-medium text-gray-700">Consulenza (ALL)</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Consulenza (Phone)</th>
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
                  <td className="py-6 px-2 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-[#245C4F]">
                        {formatNumber(form.simulations.current)}
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.simulations.previous)} → <span className={`${Math.abs(form.simulations.changePercent) >= 10 ? (form.simulations.changePercent >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                          {form.simulations.changePercent >= 0 ? '+' : ''}{form.simulations.changePercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                      <div className="text-xs font-medium text-[#245C4F]">
                        - conv.
                      </div>
                    </div>
                  </td>

                  {/* Submissions */}
                  <td className="py-6 px-2 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-[#245C4F]">
                        {formatNumber(form.submissions.current)}
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.submissions.previous)} → <span className={`${Math.abs(form.submissions.changePercent) >= 10 ? (form.submissions.changePercent >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                          {form.submissions.changePercent >= 0 ? '+' : ''}{form.submissions.changePercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                      <div className="text-xs font-medium text-[#245C4F]">
                        conv. al {form.submissions.conversionRate !== undefined ? formatPercent(form.submissions.conversionRate) : '0%'}
                      </div>
                    </div>
                  </td>

                  {/* Con Contatto */}
                  <td className="py-6 px-2 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-[#245C4F]">
                        {formatNumber(form.submissionsWithContact.current)}
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.submissionsWithContact.previous)} → <span className={`${Math.abs(form.submissionsWithContact.changePercent) >= 10 ? (form.submissionsWithContact.changePercent >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                          {form.submissionsWithContact.changePercent >= 0 ? '+' : ''}{form.submissionsWithContact.changePercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                      <div className="text-xs font-medium text-[#245C4F]">
                        conv. al {form.submissionsWithContact.conversionRate !== undefined ? formatPercent(form.submissionsWithContact.conversionRate) : '0%'}
                      </div>
                    </div>
                  </td>

                  {/* Consulenza (ALL) */}
                  <td className="py-6 px-2 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-[#245C4F]">
                        {formatNumber(form.consultingAll.current)}
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.consultingAll.previous)} → <span className={`${Math.abs(form.consultingAll.changePercent) >= 10 ? (form.consultingAll.changePercent >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                          {form.consultingAll.changePercent >= 0 ? '+' : ''}{form.consultingAll.changePercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                      <div className="text-xs font-medium text-[#245C4F]">
                        conv. al {form.consultingAll.conversionRate !== undefined ? formatPercent(form.consultingAll.conversionRate) : '0%'}
                      </div>
                    </div>
                  </td>

                  {/* Consulenza (Phone) */}
                  <td className="py-6 px-2 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-[#245C4F]">
                        {formatNumber(form.consultingWithContact.current)}
                      </div>
                      <div className="text-xs text-gray-500">
                        era {formatNumber(form.consultingWithContact.previous)} → <span className={`${Math.abs(form.consultingWithContact.changePercent) >= 10 ? (form.consultingWithContact.changePercent >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                          {form.consultingWithContact.changePercent >= 0 ? '+' : ''}{form.consultingWithContact.changePercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                      <div className="text-xs font-medium text-[#245C4F]">
                        conv. al {form.consultingWithContact.conversionRate !== undefined ? formatPercent(form.consultingWithContact.conversionRate) : '0%'}
                      </div>
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