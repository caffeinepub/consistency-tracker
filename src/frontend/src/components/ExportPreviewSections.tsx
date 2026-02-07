import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Activity, TrendingUp } from 'lucide-react';
import type { ExportData } from '../backend';
import { formatExportDate, formatHabitUnit, formatInvestmentAmount } from '../utils/exportFormatters';

interface ExportPreviewSectionsProps {
  exportData: ExportData;
}

export function ExportPreviewSections({ exportData }: ExportPreviewSectionsProps) {
  const hasReflections = exportData.diaryEntries.length > 0;
  const hasHabits = exportData.habitRecords.length > 0;
  const hasInvestments = exportData.investmentGoals.length > 0 || exportData.investmentDiaryEntries.length > 0;

  return (
    <div className="space-y-6">
      {/* Reflections Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Daily Reflections
          </CardTitle>
          <CardDescription>
            {hasReflections
              ? `${exportData.diaryEntries.length} reflection${exportData.diaryEntries.length === 1 ? '' : 's'} in selected range`
              : 'No reflections found in selected date range'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasReflections ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {exportData.diaryEntries.map(([date, entry]) => (
                <div key={date} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{formatExportDate(date)}</Badge>
                  </div>
                  <h4 className="font-semibold">{entry.title || 'Untitled'}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {entry.content || 'No content'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No daily reflections recorded in this date range
            </p>
          )}
        </CardContent>
      </Card>

      {/* Habits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Habit Records
          </CardTitle>
          <CardDescription>
            {hasHabits
              ? `${exportData.habitRecords.length} habit record${exportData.habitRecords.length === 1 ? '' : 's'} in selected range`
              : 'No habit records found in selected date range'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasHabits ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Habit</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportData.habitRecords.slice(0, 50).map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {formatExportDate(`${record.year}-${String(record.month).padStart(2, '0')}-${String(record.day).padStart(2, '0')}`)}
                      </TableCell>
                      <TableCell className="font-medium">{record.habitName}</TableCell>
                      <TableCell>
                        {record.amount !== undefined && record.amount !== null
                          ? String(record.amount)
                          : '—'}
                      </TableCell>
                      <TableCell>{formatHabitUnit(record.unit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {exportData.habitRecords.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing first 50 of {exportData.habitRecords.length} records. Export to see all.
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No habit records found in this date range
            </p>
          )}
        </CardContent>
      </Card>

      {/* Investments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Investment Data
          </CardTitle>
          <CardDescription>
            {hasInvestments
              ? `${exportData.investmentGoals.length} goal${exportData.investmentGoals.length === 1 ? '' : 's'} and ${exportData.investmentDiaryEntries.length} entr${exportData.investmentDiaryEntries.length === 1 ? 'y' : 'ies'}`
              : 'No investment data found'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {exportData.investmentGoals.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Investment Goals</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Currently Held</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportData.investmentGoals.map((goal) => {
                    const progress = goal.target > 0n
                      ? Math.round((Number(goal.currentlyHeld) / Number(goal.target)) * 100)
                      : 0;
                    return (
                      <TableRow key={Number(goal.id)}>
                        <TableCell className="font-medium">{goal.asset}</TableCell>
                        <TableCell>{formatInvestmentAmount(goal.currentlyHeld)}</TableCell>
                        <TableCell>{formatInvestmentAmount(goal.target)}</TableCell>
                        <TableCell>
                          <Badge variant={progress >= 100 ? 'default' : 'secondary'}>
                            {progress}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {exportData.investmentDiaryEntries.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Investment Diary Entries</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportData.investmentDiaryEntries.map((entry) => (
                    <TableRow key={Number(entry.id)}>
                      <TableCell>{formatExportDate(String(entry.date))}</TableCell>
                      <TableCell className="font-medium">{entry.asset}</TableCell>
                      <TableCell>{formatInvestmentAmount(entry.amount)}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!hasInvestments && (
            <p className="text-center text-muted-foreground py-8">
              No investment data found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
