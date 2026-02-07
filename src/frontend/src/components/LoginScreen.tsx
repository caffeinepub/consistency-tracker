import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, AlertCircle } from 'lucide-react';

export function LoginScreen() {
  const { login, isLoggingIn, isInitializing, isLoginError, loginError } = useInternetIdentity();

  const isDisabled = isInitializing || isLoggingIn;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-4">
              <CheckSquare className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Consistency Tracker</h1>
          <p className="text-lg text-muted-foreground">
            Build better habits, one day at a time
          </p>
        </div>

        <div className="space-y-4 pt-8">
          {isInitializing && (
            <Alert>
              <AlertDescription className="text-center">
                Initializing authentication...
              </AlertDescription>
            </Alert>
          )}

          {isLoginError && loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginError.message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={login}
            disabled={isDisabled}
            size="lg"
            className="w-full text-lg h-12"
          >
            {isInitializing
              ? 'Initializing...'
              : isLoggingIn
              ? 'Connecting...'
              : 'Login to Get Started'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Track your daily habits and visualize your progress
          </p>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © 2026. Built with love using{' '}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
