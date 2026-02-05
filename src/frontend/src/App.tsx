import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { LoginScreen } from './components/LoginScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { TrackerDashboard } from './components/TrackerDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FatalErrorFallback } from './components/FatalErrorFallback';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Loading state - wait for identity initialization and profile query to resolve
  if (isInitializing || (isAuthenticated && !isFetched)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Authenticated but no profile - show profile setup
  if (userProfile === null || !userProfile) {
    return <ProfileSetup />;
  }

  // Authenticated with profile - show dashboard
  // At this point userProfile is guaranteed to be a UserProfile object
  return <TrackerDashboard userProfile={userProfile} />;
}

export default function App() {
  return (
    <ErrorBoundary fallback={(error, resetError) => <FatalErrorFallback error={error} resetError={resetError} />}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppContent />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
