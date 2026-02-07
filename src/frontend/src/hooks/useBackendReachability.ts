import { useState, useEffect } from 'react';
import { diagnostics } from '../utils/diagnostics';
import { createActorWithConfig } from '../config';

interface ReachabilityResult {
  status: 'checking' | 'reachable' | 'unreachable';
  message?: string;
  error?: string;
}

export function useBackendReachability(shouldCheck: boolean) {
  const [result, setResult] = useState<ReachabilityResult>({ status: 'checking' });

  useEffect(() => {
    if (!shouldCheck) {
      return;
    }

    let cancelled = false;

    const checkReachability = async () => {
      diagnostics.record('Starting backend reachability check', 'info');
      setResult({ status: 'checking' });

      try {
        // Create a fresh anonymous actor for the health check
        // This bypasses any authentication or initialization issues
        diagnostics.record('Creating anonymous actor for health check', 'info');
        const healthCheckActor = await createActorWithConfig();
        
        if (!healthCheckActor) {
          throw new Error('Failed to create health check actor');
        }

        diagnostics.record('Calling healthCheck endpoint', 'info');
        
        // Use healthCheck instead of testLog for a more reliable check
        const response = await healthCheckActor.healthCheck();
        
        diagnostics.record(`Backend reachable: ${response}`, 'info');
        
        if (!cancelled) {
          setResult({
            status: 'reachable',
            message: response,
          });
        }
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        diagnostics.record(`Backend unreachable: ${errorMsg}`, 'error');
        
        if (!cancelled) {
          setResult({
            status: 'unreachable',
            error: errorMsg,
          });
        }
      }
    };

    checkReachability();

    return () => {
      cancelled = true;
    };
  }, [shouldCheck]);

  return result;
}
