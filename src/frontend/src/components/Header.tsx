import type { UserProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { CheckSquare, LogOut, TrendingUp, BookOpen, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeaderProps {
  userProfile: UserProfile;
  onLogout: () => void;
  currentView: 'tracker' | 'investments' | 'diary' | 'export';
  onViewChange: (view: 'tracker' | 'investments' | 'diary' | 'export') => void;
}

export function Header({ userProfile, onLogout, currentView, onViewChange }: HeaderProps) {
  // Defensive: ensure userProfile and name exist with safe fallbacks
  const userName = userProfile?.name?.trim() || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const getIcon = () => {
    switch (currentView) {
      case 'tracker':
        return <CheckSquare className="h-6 w-6 text-primary" />;
      case 'investments':
        return <TrendingUp className="h-6 w-6 text-primary" />;
      case 'diary':
        return <BookOpen className="h-6 w-6 text-primary" />;
      case 'export':
        return <Download className="h-6 w-6 text-primary" />;
      default:
        return <CheckSquare className="h-6 w-6 text-primary" />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'tracker':
        return 'Consistency Tracker';
      case 'investments':
        return 'Investment Goals';
      case 'diary':
        return 'Daily Diary';
      case 'export':
        return 'Export Data';
      default:
        return 'Consistency Tracker';
    }
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto w-full max-w-screen-sm px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                {getIcon()}
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {getTitle()}
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
              </div>
            </div>

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

          <div className="overflow-x-auto -mx-4 px-4">
            <Tabs value={currentView} onValueChange={(v) => onViewChange(v as 'tracker' | 'investments' | 'diary' | 'export')}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="tracker" className="flex-shrink-0">Tracker</TabsTrigger>
                <TabsTrigger value="investments" className="flex-shrink-0">Investment goals</TabsTrigger>
                <TabsTrigger value="diary" className="flex-shrink-0">Diary</TabsTrigger>
                <TabsTrigger value="export" className="flex-shrink-0">Export</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </header>
  );
}
