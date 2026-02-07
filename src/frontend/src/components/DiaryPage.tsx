import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useGetDiaryEntry, useSaveDiaryEntry, useGetAllDiaryEntries } from '../hooks/useQueries';
import { formatDateToYYYYMMDD, parseYYYYMMDD } from '../utils/diaryDates';
import { DiaryAnalyticsChart } from './DiaryAnalyticsChart';
import type { Habit } from '../backend';

interface DiaryPageProps {
  habits: Habit[];
}

export function DiaryPage({ habits }: DiaryPageProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const dateKey = formatDateToYYYYMMDD(selectedDate);

  const { data: diaryEntry, isLoading: entryLoading } = useGetDiaryEntry(dateKey);
  const { data: allEntries = [] } = useGetAllDiaryEntries();
  const saveMutation = useSaveDiaryEntry();

  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [win, setWin] = useState<string>('');
  const [friction, setFriction] = useState<string>('');
  const [investmentMindset, setInvestmentMindset] = useState<string>('');

  // Load entry data when it changes
  useMemo(() => {
    if (diaryEntry) {
      // Parse the title to extract energy level (format: "Energy: 3")
      const energyMatch = diaryEntry.title.match(/Energy:\s*(\d+)/);
      if (energyMatch) {
        setEnergyLevel(parseInt(energyMatch[1], 10));
      }

      // Parse content to extract the three fields
      const lines = diaryEntry.content.split('\n');
      let currentField = '';
      let winText = '';
      let frictionText = '';
      let investmentText = '';

      lines.forEach((line) => {
        if (line.startsWith('Win:')) {
          currentField = 'win';
          winText = line.substring(4).trim();
        } else if (line.startsWith('Friction:')) {
          currentField = 'friction';
          frictionText = line.substring(9).trim();
        } else if (line.startsWith('Investment Mindset:')) {
          currentField = 'investment';
          investmentText = line.substring(19).trim();
        } else if (line.trim() && currentField) {
          if (currentField === 'win') winText += '\n' + line;
          else if (currentField === 'friction') frictionText += '\n' + line;
          else if (currentField === 'investment') investmentText += '\n' + line;
        }
      });

      setWin(winText);
      setFriction(frictionText);
      setInvestmentMindset(investmentText);
    } else {
      // Reset to defaults when no entry exists
      setEnergyLevel(3);
      setWin('');
      setFriction('');
      setInvestmentMindset('');
    }
  }, [diaryEntry]);

  const handleSave = async () => {
    if (energyLevel < 1 || energyLevel > 5) {
      toast.error('Energy level must be between 1 and 5');
      return;
    }

    try {
      const title = `Energy: ${energyLevel}`;
      const content = `Win: ${win}\nFriction: ${friction}\nInvestment Mindset: ${investmentMindset}`;

      await saveMutation.mutateAsync({
        date: dateKey,
        title,
        content,
      });

      toast.success('Diary entry saved successfully');
    } catch (error) {
      console.error('Failed to save diary entry:', error);
      toast.error('Failed to save diary entry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selector and Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {entryLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Energy Level */}
              <div className="space-y-2">
                <Label>Energy Level (1-5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      variant={energyLevel === level ? 'default' : 'outline'}
                      size="lg"
                      className="flex-1"
                      onClick={() => setEnergyLevel(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Win (Consistency) */}
              <div className="space-y-2">
                <Label htmlFor="win">The "Win" (Consistency)</Label>
                <p className="text-sm text-muted-foreground">
                  What is the one thing you did today that moved the needle?
                </p>
                <Textarea
                  id="win"
                  placeholder="e.g., Hit the gym even though I was tired"
                  value={win}
                  onChange={(e) => setWin(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Friction (Obstacles) */}
              <div className="space-y-2">
                <Label htmlFor="friction">The "Friction" (Obstacles)</Label>
                <p className="text-sm text-muted-foreground">
                  What tripped you up? Identifying the "why" behind a broken streak is the only way to fix it.
                </p>
                <Textarea
                  id="friction"
                  placeholder="What obstacles did you face today?"
                  value={friction}
                  onChange={(e) => setFriction(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Investment Mindset */}
              <div className="space-y-2">
                <Label htmlFor="investment">The "Investment Mindset"</Label>
                <p className="text-sm text-muted-foreground">
                  Did you make a rational financial decision today, or an emotional one?
                </p>
                <Textarea
                  id="investment"
                  placeholder="Reflect on your financial decisions today"
                  value={investmentMindset}
                  onChange={(e) => setInvestmentMindset(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                {saveMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Entry
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Analytics Chart */}
      <DiaryAnalyticsChart habits={habits} diaryEntries={allEntries} />
    </div>
  );
}
