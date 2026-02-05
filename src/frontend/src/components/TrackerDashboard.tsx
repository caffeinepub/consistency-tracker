import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../backend';
import { Header } from './Header';
import { MonthTabs } from './MonthTabs';
import { HabitGrid } from './HabitGrid';
import { ProgressCharts } from './ProgressCharts';
import { CollapsibleHabitManagerPanel } from './CollapsibleHabitManagerPanel';
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
  const { data: records = [], isLoading: recordsLoading } = useGetMonthlyRecords(
    selectedMonth,
    selectedYear
  );

  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userProfile={userProfile} onLogout={handleLogout} habits={habits} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <CollapsibleHabitManagerPanel />

            <div className="space-y-4">
              <MonthTabs
                months={MONTHS}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />

              <HabitGrid
                habits={habits}
                records={records}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                isLoading={habitsLoading || recordsLoading}
              />
            </div>
          </div>

          <div className="lg:w-96">
            <ProgressCharts
              habits={habits}
              records={records}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>
        </div>
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
