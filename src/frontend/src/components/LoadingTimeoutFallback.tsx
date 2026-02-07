import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, ChevronUp, Copy, RefreshCw, LogIn, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useBackendReachability } from '../hooks/useBackendReachability';
import { diagnostics } from '../utils/diagnostics';

interface LoadingTimeoutFallbackProps {
  onReload: () => void;
  onProceedToLogin: () => void;
  isIdentityInitializing: boolean;
}

export function LoadingTimeoutFallback({
  onReload,
  onProceedToLogin,
  isIdentityInitializing,
}: LoadingTimeoutFallbackProps) {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const reachability = useBackendReachability(true);

  const handleCopyDiagnostics = async () => {
    const timeline = diagnostics.formatTimeline();
    const reachabilityInfo = `\n\nBackend Reachability: ${reachability.status}\n${
      reachability.message ? `Response: ${reachability.message}` : ''
    }${reachability.error ? `Error: ${reachability.error}` : ''}`;
    
    const fullDiagnostics = timeline + reachabilityInfo;

    try {
      await navigator.clipboard.writeText(fullDiagnostics);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      // Fallback: create a text area for manual copy
      const textarea = document.createElement('textarea');
      textarea.value = fullDiagnostics;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const renderReachabilityStatus = () => {
    if (reachability.status === 'checking') {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking backend connection...</span>
        </div>
      );
    }

    if (reachability.status === 'reachable') {
      return (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm">
            <strong>Backend is reachable</strong>
            {reachability.message && (
              <div className="mt-1 text-xs text-muted-foreground font-mono">
                {reachability.message}
              </div>
            )}
            {isIdentityInitializing && (
              <div className="mt-2 text-xs">
                The backend is working, but Internet Identity initialization is taking longer than expected.
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Backend is unreachable</strong>
          {reachability.error && (
            <div className="mt-1 text-xs font-mono">
              {reachability.error}
            </div>
          )}
          <div className="mt-2 text-xs">
            Please try reloading the page. If the problem persists, the service may be temporarily unavailable.
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Loading Timeout</CardTitle>
              <CardDescription>
                The application is taking longer than expected to load
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {renderReachabilityStatus()}

          <Collapsible open={diagnosticsOpen} onOpenChange={setDiagnosticsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>View Diagnostics</span>
                {diagnosticsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="rounded-md border bg-muted/50 p-3">
                <pre className="text-xs whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {diagnostics.formatTimeline()}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyDiagnostics}
                  className="mt-2 w-full"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Diagnostics
                    </>
                  )}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button onClick={onReload} className="w-full" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
          <Button onClick={onProceedToLogin} variant="outline" className="w-full" size="lg">
            <LogIn className="mr-2 h-4 w-4" />
            Proceed to Login Anyway
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
