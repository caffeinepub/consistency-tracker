import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { diagnostics } from '../utils/diagnostics';

interface ReachabilityResult {
  status: 'checking' | 'reachable' | 'unreachable';
  message?: string;
  error?: string;
}

export function useBackendReachability(shouldCheck: boolean) {
  const { actor } = useActor();
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
        if (!actor) {
          const errorMsg = 'Actor not available for reachability check';
          diagnostics.record(errorMsg, 'error');
          if (!cancelled) {
            setResult({
              status: 'unreachable',
              error: errorMsg,
            });
          }
          return;
        }

        // Call the diagnostic backend method
        const response = await actor.testLog('Frontend reachability check');
        
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
  }, [shouldCheck, actor]);

  return result;
}
