import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useRef } from 'react';
import { useHorizontalDragScroll } from '../hooks/useHorizontalDragScroll';

interface MonthTabsProps {
  months: string[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
}

export function MonthTabs({ months, selectedMonth, onMonthChange }: MonthTabsProps) {
  const { scrollRef, onMouseDown } = useHorizontalDragScroll();
  const selectedTriggerRef = useRef<HTMLButtonElement>(null);

  const handleMonthChange = (value: string) => {
    // Parse with explicit base 10 and clamp to valid range 1-12
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(12, parsed));
      onMonthChange(clamped);
    }
  };

  // Auto-scroll selected month into view
  useEffect(() => {
    if (selectedTriggerRef.current && scrollRef.current) {
      const trigger = selectedTriggerRef.current;
      const container = scrollRef.current;
      
      const triggerLeft = trigger.offsetLeft;
      const triggerWidth = trigger.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      
      // Check if trigger is fully visible
      const isFullyVisible = 
        triggerLeft >= scrollLeft && 
        triggerLeft + triggerWidth <= scrollLeft + containerWidth;
      
      if (!isFullyVisible) {
        // Scroll to center the selected tab
        const targetScroll = triggerLeft - (containerWidth / 2) + (triggerWidth / 2);
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedMonth, scrollRef]);

  return (
    <div 
      ref={scrollRef}
      onMouseDown={onMouseDown}
      className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      data-testid="month-tabs-scroll-container"
      data-scroll-enabled="true"
      style={{ cursor: 'grab' }}
    >
      <Tabs value={selectedMonth.toString()} onValueChange={handleMonthChange}>
        <TabsList className="inline-flex h-11 w-auto flex-nowrap whitespace-nowrap" data-testid="month-tabs-list">
          {months.map((month, index) => {
            const monthValue = (index + 1).toString();
            const isSelected = selectedMonth === index + 1;
            
            return (
              <TabsTrigger 
                key={month} 
                value={monthValue} 
                className="px-4 flex-shrink-0"
                ref={isSelected ? selectedTriggerRef : undefined}
                data-testid={`month-tab-${monthValue}`}
              >
                {month}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
