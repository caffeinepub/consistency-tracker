// Lightweight in-memory diagnostics recorder for tracking app initialization events

export interface DiagnosticEvent {
  timestamp: number;
  message: string;
  level: 'info' | 'error' | 'warning';
}

class DiagnosticsRecorder {
  private events: DiagnosticEvent[] = [];
  private startTime: number = Date.now();

  record(message: string, level: 'info' | 'error' | 'warning' = 'info') {
    const event: DiagnosticEvent = {
      timestamp: Date.now(),
      message,
      level,
    };
    this.events.push(event);
    
    // Also log to console
    const elapsed = event.timestamp - this.startTime;
    const prefix = `[${elapsed}ms]`;
    
    if (level === 'error') {
      console.error(prefix, message);
    } else if (level === 'warning') {
      console.warn(prefix, message);
    } else {
      console.log(prefix, message);
    }
  }

  getEvents(): DiagnosticEvent[] {
    return [...this.events];
  }

  formatTimeline(): string {
    if (this.events.length === 0) {
      return 'No diagnostic events recorded.';
    }

    const lines = this.events.map((event) => {
      const elapsed = event.timestamp - this.startTime;
      const levelPrefix = event.level === 'error' ? '❌' : event.level === 'warning' ? '⚠️' : '✓';
      return `${levelPrefix} [+${elapsed}ms] ${event.message}`;
    });

    return lines.join('\n');
  }

  clear() {
    this.events = [];
    this.startTime = Date.now();
  }
}

// Singleton instance
export const diagnostics = new DiagnosticsRecorder();
