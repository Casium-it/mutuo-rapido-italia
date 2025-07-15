
import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PeriodType, PeriodData, CustomPeriod } from '@/hooks/useStatistics';

interface PeriodSelectorProps {
  value: PeriodData;
  onChange: (period: PeriodData) => void;
}

const periodOptions: { value: PeriodType; label: string }[] = [
  { value: 'lifetime', label: 'Lifetime' },
  { value: '60d', label: 'Ultimi 60 giorni' },
  { value: '30d', label: 'Ultimi 30 giorni' },
  { value: '14d', label: 'Ultimi 14 giorni' },
  { value: '7d', label: 'Ultimi 7 giorni' },
  { value: '3d', label: 'Ultimi 3 giorni' },
  { value: 'yesterday', label: 'Ieri' },
  { value: 'today', label: 'Oggi' },
  { value: 'custom', label: 'Personalizzato' }
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();

  const handlePeriodChange = (newPeriod: PeriodType) => {
    if (newPeriod === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onChange({ type: newPeriod });
    }
  };

  const handleCustomPeriodApply = () => {
    if (customStart && customEnd) {
      onChange({
        type: 'custom',
        custom: { startDate: customStart, endDate: customEnd }
      });
      setShowCustom(false);
    }
  };

  const getCurrentLabel = () => {
    const option = periodOptions.find(p => p.value === value.type);
    if (value.type === 'custom' && value.custom) {
      return `${format(value.custom.startDate, 'dd/MM/yyyy')} - ${format(value.custom.endDate, 'dd/MM/yyyy')}`;
    }
    return option?.label || 'Seleziona periodo';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {periodOptions.filter(p => p.value !== 'custom').map((option) => (
            <Button
              key={option.value}
              variant={value.type === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(option.value)}
              className={value.type === option.value ? "bg-[#245C4F] hover:bg-[#1e4f44]" : ""}
            >
              {option.label}
            </Button>
          ))}
          
          <Popover open={showCustom} onOpenChange={setShowCustom}>
            <PopoverTrigger asChild>
              <Button
                variant={value.type === 'custom' ? "default" : "outline"}
                size="sm"
                onClick={() => handlePeriodChange('custom')}
                className={cn(
                  "flex items-center gap-2",
                  value.type === 'custom' ? "bg-[#245C4F] hover:bg-[#1e4f44]" : ""
                )}
              >
                <Calendar className="h-4 w-4" />
                {value.type === 'custom' ? getCurrentLabel() : 'Personalizzato'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Data inizio
                  </label>
                  <CalendarComponent
                    mode="single"
                    selected={customStart}
                    onSelect={setCustomStart}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Data fine
                  </label>
                  <CalendarComponent
                    mode="single"
                    selected={customEnd}
                    onSelect={setCustomEnd}
                    className="rounded-md border"
                    disabled={(date) => customStart ? date < customStart : false}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCustomPeriodApply}
                    disabled={!customStart || !customEnd}
                    className="bg-[#245C4F] hover:bg-[#1e4f44]"
                  >
                    Applica
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCustom(false)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
