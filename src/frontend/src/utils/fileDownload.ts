import { format } from 'date-fns';

export function generateExportFilename(startDate: Date, endDate: Date, fileFormat: 'csv' | 'pdf' | 'xlsx'): string {
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  return `export_${startStr}_to_${endStr}.${fileFormat}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
