import type { UserProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { CheckSquare, LogOut, TrendingUp } from 'lucide-react';
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
  currentView: 'tracker' | 'investments';
  onViewChange: (view: 'tracker' | 'investments') => void;
}

export function Header({ userProfile, onLogout, currentView, onViewChange }: HeaderProps) {
  // Defensive: ensure userProfile and name exist with safe fallbacks
  const userName = userProfile?.name?.trim() || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              {currentView === 'tracker' ? (
                <CheckSquare className="h-6 w-6 text-primary" />
              ) : (
                <TrendingUp className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {currentView === 'tracker' ? 'Consistency Tracker' : 'Investment Goals'}
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Tabs value={currentView} onValueChange={(v) => onViewChange(v as 'tracker' | 'investments')}>
              <TabsList>
                <TabsTrigger value="tracker">Tracker</TabsTrigger>
                <TabsTrigger value="investments">Investment goals</TabsTrigger>
              </TabsList>
            </Tabs>

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
