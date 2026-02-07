import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HabitManager } from './HabitManager';
import { useGetHabits } from '../hooks/useQueries';

export function CollapsibleHabitManagerPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: habits = [], isLoading } = useGetHabits();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg bg-card">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50"
          >
            <span className="font-medium">Add/ Manage habits</span>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <HabitManager habits={habits} />
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
