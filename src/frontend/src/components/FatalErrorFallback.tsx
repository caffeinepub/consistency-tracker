import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface FatalErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function FatalErrorFallback({ error, resetError }: FatalErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            The application encountered an unexpected error and needs to reload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-mono text-muted-foreground break-all">
              {error.message || 'Unknown error'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReload} className="flex-1">
              Reload Page
            </Button>
            <Button onClick={resetError} variant="outline" className="flex-1">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
