
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { FormStatistics } from '@/hooks/useStatistics';
import { StatisticsGraphDialog } from './StatisticsGraphDialog';

interface FormBreakdownTableProps {
  formStats: FormStatistics[];
}

interface GraphDialogState {
  open: boolean;
  metricType: 'simulations' | 'submissions' | 'submissionsWithContact';
  formSlug: string;
  formTitle: string;
}

export function FormBreakdownTable({ formStats }: FormBreakdownTableProps) {
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
                    <td className="py-4 px-2 text-center">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-[#245C4F]">
                          {formatNumber(form.simulations.current)}
                        </div>
                        <div className="text-xs text-gray-500">
                          era {formatNumber(form.simulations.previous)} → <span className={`${Math.abs(form.simulations.change) >= 10 ? (form.simulations.change >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                            {form.simulations.change >= 0 ? '+' : ''}{formatNumber(form.simulations.change)}%
                          </span>
                        </div>
                        <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                        <div className="flex items-center justify-between px-2">
                          <div className="text-xs font-medium text-[#245C4F]">
                            - conv.
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openGraphDialog('simulations', form.formSlug, form.formTitle)}
                            className="h-5 w-5 p-0 hover:bg-gray-100"
                          >
                            <BarChart3 className="h-3 w-3 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </td>

                    {/* Submissions */}
                    <td className="py-4 px-2 text-center">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-[#245C4F]">
                          {formatNumber(form.submissions.current)}
                        </div>
                        <div className="text-xs text-gray-500">
                          era {formatNumber(form.submissions.previous)} → <span className={`${Math.abs(form.submissions.change) >= 10 ? (form.submissions.change >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                            {form.submissions.change >= 0 ? '+' : ''}{formatNumber(form.submissions.change)}%
                          </span>
                        </div>
                        <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                        <div className="flex items-center justify-between px-2">
                          <div className="text-xs font-medium text-[#245C4F]">
                            conv. al {form.submissions.conversionRate !== undefined ? formatPercent(form.submissions.conversionRate) : '0%'}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openGraphDialog('submissions', form.formSlug, form.formTitle)}
                            className="h-5 w-5 p-0 hover:bg-gray-100"
                          >
                            <BarChart3 className="h-3 w-3 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </td>

                    {/* Con Contatto */}
                    <td className="py-4 px-2 text-center">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-[#245C4F]">
                          {formatNumber(form.submissionsWithContact.current)}
                        </div>
                        <div className="text-xs text-gray-500">
                          era {formatNumber(form.submissionsWithContact.previous)} → <span className={`${Math.abs(form.submissionsWithContact.change) >= 10 ? (form.submissionsWithContact.change >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                            {form.submissionsWithContact.change >= 0 ? '+' : ''}{formatNumber(form.submissionsWithContact.change)}%
                          </span>
                        </div>
                        <div className="w-8 h-px bg-gray-300 mx-auto my-1"></div>
                        <div className="flex items-center justify-between px-2">
                          <div className="text-xs font-medium text-[#245C4F]">
                            conv. al {form.submissionsWithContact.conversionRate !== undefined ? formatPercent(form.submissionsWithContact.conversionRate) : '0%'}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openGraphDialog('submissionsWithContact', form.formSlug, form.formTitle)}
                            className="h-5 w-5 p-0 hover:bg-gray-100"
                          >
                            <BarChart3 className="h-3 w-3 text-gray-500" />
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
