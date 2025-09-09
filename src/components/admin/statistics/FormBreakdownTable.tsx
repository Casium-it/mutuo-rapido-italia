
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { FormStatistics } from '@/hooks/useStatistics';
import { StatisticsGraphDialog } from './StatisticsGraphDialog';

interface FormBreakdownTableProps {
  formStats: FormStatistics[];
  loading?: boolean;
}

interface GraphDialogState {
  open: boolean;
  metricType: 'simulations' | 'submissions' | 'submissionsWithContact';
  formSlug: string;
  formTitle: string;
}

export function FormBreakdownTable({ formStats, loading = false }: FormBreakdownTableProps) {
  const [graphDialog, setGraphDialog] = useState<GraphDialogState>({
    open: false,
    metricType: 'simulations',
    formSlug: '',
    formTitle: ''
  });

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

  const openGraphDialog = (
    metricType: 'simulations' | 'submissions' | 'submissionsWithContact',
    formSlug: string,
    formTitle: string
  ) => {
    setGraphDialog({
      open: true,
      metricType,
      formSlug,
      formTitle
    });
  };

  const getGraphTitle = () => {
    const metricName = graphDialog.metricType === 'simulations' ? 'Simulazioni' :
                     graphDialog.metricType === 'submissions' ? 'Submissions' : 'Submissions con Contatto';
    return `Grafico ${metricName} - ${graphDialog.formTitle}`;
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
                    {[1, 2, 3].map((j) => (
                      <td key={j} className="py-6 px-2 text-center">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-12 mx-auto" />
                          <Skeleton className="h-3 w-20 mx-auto" />
                          <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                          <Skeleton className="h-3 w-16 mx-auto" />
                          <div className="flex justify-center mt-2">
                            <Skeleton className="h-7 w-7" />
                          </div>
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
    <>
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
                        <div className="flex justify-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGraphDialog('simulations', form.formSlug, form.formTitle)}
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                          >
                            <BarChart3 className="h-4 w-4 text-gray-600" />
                          </Button>
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
                        <div className="flex justify-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGraphDialog('submissions', form.formSlug, form.formTitle)}
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                          >
                            <BarChart3 className="h-4 w-4 text-gray-600" />
                          </Button>
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
                        <div className="flex justify-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGraphDialog('submissionsWithContact', form.formSlug, form.formTitle)}
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                          >
                            <BarChart3 className="h-4 w-4 text-gray-600" />
                          </Button>
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

      <StatisticsGraphDialog
        open={graphDialog.open}
        onOpenChange={(open) => setGraphDialog(prev => ({ ...prev, open }))}
        metricType={graphDialog.metricType}
        title={getGraphTitle()}
        formSlug={graphDialog.formSlug}
      />
    </>
  );
}
