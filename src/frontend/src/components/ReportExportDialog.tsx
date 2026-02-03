import { useState } from 'react';
import { Calendar, Download, FileText, Loader2 } from 'lucide-react';
import type { Habit } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useExportAllData, useExportSelectedHabitsData } from '../hooks/useQueries';
import { dateRangeToComponents } from '../utils/reportDateRange';
import { generateCSV, downloadCSV } from '../utils/reportCsv';
import { generateFilename } from '../utils/fileDownload';
import { toast } from 'sonner';

interface ReportExportDialogProps {
  habits: Habit[];
}

export function ReportExportDialog({ habits }: ReportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'all' | 'selected'>('all');
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const exportAllMutation = useExportAllData();
  const exportSelectedMutation = useExportSelectedHabitsData();

  const isExporting = exportAllMutation.isPending || exportSelectedMutation.isPending;
  const hasNoHabits = habits.length === 0;

  const handleHabitToggle = (habitId: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      toast.error('Start date must be before end date');
      return;
    }

    if (selectionMode === 'selected' && selectedHabitIds.length === 0) {
      toast.error('Please select at least one habit');
      return;
    }

    try {
      const dateRange = dateRangeToComponents(startDate, endDate);

      const exportData =
        selectionMode === 'all'
          ? await exportAllMutation.mutateAsync(dateRange)
          : await exportSelectedMutation.mutateAsync({
              habitIds: selectedHabitIds,
              ...dateRange,
            });

      const filename = generateFilename(
        'csv',
        dateRange.startDay,
        dateRange.startMonth,
        dateRange.startYear,
        dateRange.endDay,
        dateRange.endMonth,
        dateRange.endYear
      );

      const csvContent = generateCSV(
        exportData,
        dateRange.startDay,
        dateRange.startMonth,
        dateRange.startYear,
        dateRange.endDay,
        dateRange.endMonth,
        dateRange.endYear
      );
      downloadCSV(csvContent, filename);

      toast.success('Report exported successfully as CSV with volume data');
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={hasNoHabits}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Habit Report</DialogTitle>
          <DialogDescription>
            {hasNoHabits
              ? 'Create some habits first to export reports.'
              : 'Choose your date range and habits to include in the CSV export with volume data.'}
          </DialogDescription>
        </DialogHeader>

        {!hasNoHabits && (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Date Range</Label>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs text-muted-foreground mb-2 block">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? startDate.toLocaleDateString() : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs text-muted-foreground mb-2 block">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? endDate.toLocaleDateString() : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Habits to Include</Label>
              <RadioGroup
                value={selectionMode}
                onValueChange={(value) => setSelectionMode(value as 'all' | 'selected')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All habits ({habits.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <Label htmlFor="selected" className="font-normal cursor-pointer">
                    Selected habits
                  </Label>
                </div>
              </RadioGroup>

              {selectionMode === 'selected' && (
                <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                  {habits.map((habit) => (
                    <div key={habit.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={habit.id}
                        checked={selectedHabitIds.includes(habit.id)}
                        onCheckedChange={() => handleHabitToggle(habit.id)}
                      />
                      <Label htmlFor={habit.id} className="font-normal cursor-pointer flex-1">
                        {habit.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || hasNoHabits}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
