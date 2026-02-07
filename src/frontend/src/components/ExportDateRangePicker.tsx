import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ExportDateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function ExportDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ExportDateRangePickerProps) {
  // Normalize dates: if end < start, swap them
  const normalizedStart = startDate <= endDate ? startDate : endDate;
  const normalizedEnd = endDate >= startDate ? endDate : startDate;

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (date > normalizedEnd) {
      // If new start is after end, set end to match start
      onStartDateChange(date);
      onEndDateChange(date);
    } else {
      onStartDateChange(date);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (date < normalizedStart) {
      // If new end is before start, set start to match end
      onEndDateChange(date);
      onStartDateChange(date);
    } else {
      onEndDateChange(date);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(normalizedStart, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={normalizedStart}
              onSelect={handleStartDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(normalizedEnd, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={normalizedEnd}
              onSelect={handleEndDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
