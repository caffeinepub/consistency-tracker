import type { UserProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { CheckSquare, LogOut, Moon, Sun, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportExportDialog } from './ReportExportDialog';
import type { Habit } from '../backend';

interface HeaderProps {
  userProfile: UserProfile;
  onLogout: () => void;
  habits: Habit[];
  viewMode: 'habits' | 'investments';
  onViewModeChange: (mode: 'habits' | 'investments') => void;
}

export function Header({ userProfile, onLogout, habits, viewMode, onViewModeChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  // Safe fallback for profile name
  const userName = userProfile?.name?.trim() || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Consistency Tracker</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'habits' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('habits')}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Habits
              </Button>
              <Button
                variant={viewMode === 'investments' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('investments')}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Investments
              </Button>
            </div>

            {viewMode === 'habits' && <ReportExportDialog habits={habits} />}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                    {userInitial}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
