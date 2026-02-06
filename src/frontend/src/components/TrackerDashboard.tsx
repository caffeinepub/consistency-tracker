import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../backend';
import { Header } from './Header';
import { MonthTabs } from './MonthTabs';
import { HabitGrid } from './HabitGrid';
import { ProgressCharts } from './ProgressCharts';
import { CollapsibleHabitManagerPanel } from './CollapsibleHabitManagerPanel';
import { MonthlyTargetsEditor } from './MonthlyTargetsEditor';
import { useGetHabits, useGetMonthlyRecords } from '../hooks/useQueries';

interface TrackerDashboardProps {
  userProfile: UserProfile;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function TrackerDashboard({ userProfile }: TrackerDashboardProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear] = useState(currentDate.getFullYear());

  const { data: habits = [], isLoading: habitsLoading } = useGetHabits();
  const { 
    data: records = [], 
    isLoading: recordsLoading,
    isFetching: recordsFetching 
  } = useGetMonthlyRecords(
    selectedMonth,
    selectedYear
  );

  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Show loading state only for initial data load
  const isInitialLoading = habitsLoading || recordsLoading;
  
  // For month switching, pass a loading flag but don't block the entire dashboard
  const isMonthSwitching = recordsFetching && !recordsLoading;

  // Defensive: only pass valid data to child components
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeRecords = Array.isArray(records) ? records : [];

  // Filter records to ensure they match the selected month/year
  const filteredRecords = safeRecords.filter(
    (r) => Number(r.month) === selectedMonth && Number(r.year) === selectedYear
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading your habits...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <CollapsibleHabitManagerPanel />

              <MonthlyTargetsEditor 
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                habits={safeHabits}
                records={filteredRecords}
              />

              <div className="space-y-4">
                <MonthTabs
                  months={MONTHS}
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />

                <HabitGrid
                  habits={safeHabits}
                  records={filteredRecords}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  isLoading={isMonthSwitching}
                />
              </div>
            </div>

            <div className="lg:w-96">
              <ProgressCharts
                habits={safeHabits}
                records={filteredRecords}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with love using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
