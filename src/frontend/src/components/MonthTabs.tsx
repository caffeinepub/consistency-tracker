import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface MonthTabsProps {
  months: string[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
}

export function MonthTabs({ months, selectedMonth, onMonthChange }: MonthTabsProps) {
  const handleMonthChange = (value: string) => {
    // Parse with explicit base 10 and clamp to valid range 1-12
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(12, parsed));
      onMonthChange(clamped);
    }
  };

  return (
    <ScrollArea className="w-full">
      <Tabs value={selectedMonth.toString()} onValueChange={handleMonthChange}>
        <TabsList className="inline-flex h-11 w-auto">
          {months.map((month, index) => (
            <TabsTrigger key={month} value={(index + 1).toString()} className="px-4">
              {month}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
