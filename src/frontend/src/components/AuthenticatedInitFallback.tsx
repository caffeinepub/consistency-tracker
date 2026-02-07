import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { diagnostics } from '../utils/diagnostics';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface AuthenticatedInitFallbackProps {
  onRetry: () => void;
  onReload: () => void;
  actorError: boolean;
}

export function AuthenticatedInitFallback({ onRetry, onReload, actorError }: AuthenticatedInitFallbackProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleCopyDiagnostics = () => {
    const timeline = diagnostics.formatTimeline();
    navigator.clipboard.writeText(timeline);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Initialization Problem</CardTitle>
          </div>
          <CardDescription>
            {actorError 
              ? 'Unable to connect to the backend. This might be a temporary network issue.'
              : 'Unable to load your profile. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You're logged in, but we couldn't complete the initialization. Try the actions below to recover.
          </p>

          <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-md bg-muted p-3 text-xs font-mono max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {diagnostics.formatTimeline()}
                </pre>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={handleCopyDiagnostics}
              >
                Copy to Clipboard
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={onRetry} className="w-full" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Initialization
          </Button>
          <Button onClick={onReload} className="w-full" variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
