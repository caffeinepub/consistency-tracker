import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { LoginScreen } from './components/LoginScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { TrackerDashboard } from './components/TrackerDashboard';
import { FatalErrorFallback } from './components/FatalErrorFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useSilentActorRetry } from './hooks/useSilentActorRetry';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

export function AppContent() {
  const { identity } = useInternetIdentity();
  
  // User is authenticated if they have a valid non-anonymous identity
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Silent background retry for actor initialization when authenticated
  useSilentActorRetry(isAuthenticated);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show profile setup if authenticated, profile query completed, and no profile exists
  const showProfileSetup = isAuthenticated && profileFetched && userProfile === null;
  
  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  // Render TrackerDashboard immediately after authentication
  // No blocking UI for initialization failures - retries happen silently in background
  return (
    <TrackerDashboard
      userProfile={userProfile || null}
      isProfileLoading={profileLoading && !profileFetched}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={(error, resetError) => <FatalErrorFallback error={error} resetError={resetError} />}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AppContent />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
