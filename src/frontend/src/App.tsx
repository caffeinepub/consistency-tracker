import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { LoginScreen } from './components/LoginScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { TrackerDashboard } from './components/TrackerDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FatalErrorFallback } from './components/FatalErrorFallback';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show error state if profile query failed
  if (error && isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <p className="text-destructive mb-4">Failed to load user profile</p>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      </div>
    );
  }

  // Loading state - wait for identity initialization and profile query to resolve
  // Block until we have a definitive answer about the profile
  if (isInitializing || (isAuthenticated && (profileLoading || !isFetched))) {
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
  // Explicit null check to distinguish between null (no profile) and undefined (loading)
  if (userProfile === null) {
    return <ProfileSetup />;
  }

  // Authenticated with profile - show dashboard
  // At this point userProfile is guaranteed to be a UserProfile object with a name property
  if (userProfile && userProfile.name) {
    return <TrackerDashboard userProfile={userProfile} />;
  }

  // Fallback: should never reach here, but handle gracefully
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Initializing...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={(error, resetError) => <FatalErrorFallback error={error} resetError={resetError} />}>
      <AppContent />
    </ErrorBoundary>
  );
}
