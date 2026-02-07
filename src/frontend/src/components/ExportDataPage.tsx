import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { ExportDateRangePicker } from './ExportDateRangePicker';
import { ExportPreviewSections } from './ExportPreviewSections';
import { useExportAllData } from '../hooks/useQueries';
import { dateRangeToComponents } from '../utils/reportDateRange';
import { exportToXlsx } from '../utils/exportXlsx';
import { exportToPdf } from '../utils/exportPdf';
import { toast } from 'sonner';
import type { ExportData } from '../backend';

export function ExportDataPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState<Date>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<Date>(today);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const exportMutation = useExportAllData();

  const [isExportingXlsx, setIsExportingXlsx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Load data when date range changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const dateRange = dateRangeToComponents(startDate, endDate);
        const data = await exportMutation.mutateAsync({
          startDay: BigInt(dateRange.startDay),
          startMonth: BigInt(dateRange.startMonth),
          startYear: BigInt(dateRange.startYear),
          endDay: BigInt(dateRange.endDay),
          endMonth: BigInt(dateRange.endMonth),
          endYear: BigInt(dateRange.endYear),
        });
        setExportData(data);
      } catch (error) {
        console.error('Failed to load export data:', error);
        toast.error('Failed to load export data');
        setExportData(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [startDate, endDate]);

  const handleExportXlsx = async () => {
    if (!exportData) return;
    
    setIsExportingXlsx(true);
    try {
      await exportToXlsx(exportData, startDate, endDate);
      toast.success('XLSX file downloaded successfully');
    } catch (error) {
      console.error('XLSX export error:', error);
      toast.error('Failed to export XLSX file');
    } finally {
      setIsExportingXlsx(false);
    }
  };

  const handleExportPdf = async () => {
    if (!exportData) return;
    
    setIsExportingPdf(true);
    try {
      await exportToPdf(exportData, startDate, endDate);
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF file');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date Range
          </CardTitle>
          <CardDescription>
            Choose a date range to filter your data for export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportXlsx}
              disabled={isLoadingData || isExportingXlsx || !exportData}
              className="flex items-center gap-2"
            >
              {isExportingXlsx ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Export XLSX
            </Button>

            <Button
              onClick={handleExportPdf}
              disabled={isLoadingData || isExportingPdf || !exportData}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoadingData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading export data...</p>
          </div>
        </div>
      )}

      {exportMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load export data. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoadingData && !exportMutation.isError && exportData && (
        <ExportPreviewSections exportData={exportData} />
      )}
    </div>
  );
}
