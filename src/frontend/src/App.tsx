import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { LoginScreen } from './components/LoginScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { TrackerDashboard } from './components/TrackerDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FatalErrorFallback } from './components/FatalErrorFallback';
import { LoadingTimeoutFallback } from './components/LoadingTimeoutFallback';
import { useLoadingWatchdog } from './hooks/useLoadingWatchdog';
import { diagnostics } from './utils/diagnostics';
import { useActor } from './hooks/useActor';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched, error } = useGetCallerUserProfile();
  
  const [showTimeout, setShowTimeout] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || (isAuthenticated && (profileLoading || !isFetched));

  // Record diagnostic events
  useEffect(() => {
    diagnostics.record('App mounted', 'info');
  }, []);

  useEffect(() => {
    if (isInitializing) {
      diagnostics.record('Internet Identity initializing...', 'info');
    } else {
      diagnostics.record('Internet Identity initialization complete', 'info');
      if (identity) {
        const principal = identity.getPrincipal().toString();
        diagnostics.record(`Identity: ${principal.substring(0, 20)}...`, 'info');
      } else {
        diagnostics.record('Identity: Anonymous', 'info');
      }
    }
  }, [isInitializing, identity]);

  useEffect(() => {
    if (actor) {
      diagnostics.record('Actor ready', 'info');
    } else if (!actorFetching) {
      diagnostics.record('Actor not available', 'warning');
    }
  }, [actor, actorFetching]);

  useEffect(() => {
    if (isAuthenticated && profileLoading) {
      diagnostics.record('Profile query started', 'info');
    }
  }, [isAuthenticated, profileLoading]);

  useEffect(() => {
    if (isAuthenticated && isFetched) {
      if (userProfile === null) {
        diagnostics.record('Profile query complete: No profile found', 'info');
      } else if (userProfile) {
        diagnostics.record(`Profile query complete: ${userProfile.name}`, 'info');
      }
    }
  }, [isAuthenticated, isFetched, userProfile]);

  useEffect(() => {
    if (error) {
      diagnostics.record(`Profile query error: ${String(error)}`, 'error');
    }
  }, [error]);

  // Loading watchdog
  useLoadingWatchdog({
    isLoading,
    timeoutMs: 5000,
    enabled: !showTimeout && !forceLogin,
    onTimeout: () => {
      diagnostics.record('Loading timeout triggered after 5 seconds', 'warning');
      setShowTimeout(true);
    },
  });

  // Show timeout fallback
  if (showTimeout && !forceLogin) {
    return (
      <LoadingTimeoutFallback
        onReload={() => window.location.reload()}
        onProceedToLogin={() => {
          diagnostics.record('User chose to proceed to login', 'info');
          setForceLogin(true);
          setShowTimeout(false);
        }}
        isIdentityInitializing={isInitializing}
      />
    );
  }

  // Show error state if profile query failed
  if (error && isAuthenticated && !forceLogin) {
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
  if (isLoading && !forceLogin) {
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
  if (!isAuthenticated || forceLogin) {
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
