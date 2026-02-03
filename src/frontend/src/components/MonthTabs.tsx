import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface MonthTabsProps {
  months: string[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
}

export function MonthTabs({ months, selectedMonth, onMonthChange }: MonthTabsProps) {
  return (
    <ScrollArea className="w-full">
      <Tabs value={selectedMonth.toString()} onValueChange={(v) => onMonthChange(parseInt(v))}>
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
