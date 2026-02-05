/**
 * Duration parsing and formatting utilities for Time habit amounts.
 * Parses free-text durations into seconds and formats seconds back to human-readable strings.
 */

/**
 * Parse a free-text duration string into whole seconds.
 * Supports formats like:
 * - "1 min 15 seconds" / "1 min 15 sec" / "1m 15s"
 * - "75 sec" / "75 seconds" / "75s"
 * - "1:15" (minutes:seconds)
 * - "2 min" / "2 minutes" / "2m"
 * - "90" (assumes seconds if no unit)
 * 
 * @param input - The free-text duration string
 * @returns The duration in seconds, or null if invalid
 */
export function parseDuration(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim().toLowerCase();
  if (trimmed === '') {
    return null;
  }

  // Pattern 1: "MM:SS" format (e.g., "1:15" = 75 seconds)
  const colonMatch = trimmed.match(/^(\d+):(\d+)$/);
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10);
    const seconds = parseInt(colonMatch[2], 10);
    if (!isNaN(minutes) && !isNaN(seconds) && seconds < 60) {
      return minutes * 60 + seconds;
    }
  }

  // Pattern 2: Extract minutes and seconds with various formats
  // Matches: "1 min 15 sec", "1m 15s", "2 minutes 30 seconds", etc.
  const minutesMatch = trimmed.match(/(\d+)\s*(min|minute|minutes|m)(?:\s|$)/);
  const secondsMatch = trimmed.match(/(\d+)\s*(sec|second|seconds|s)(?:\s|$)/);

  let totalSeconds = 0;

  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1], 10);
    if (!isNaN(minutes)) {
      totalSeconds += minutes * 60;
    }
  }

  if (secondsMatch) {
    const seconds = parseInt(secondsMatch[1], 10);
    if (!isNaN(seconds)) {
      totalSeconds += seconds;
    }
  }

  // If we found at least one unit, return the total
  if (minutesMatch || secondsMatch) {
    return totalSeconds;
  }

  // Pattern 3: Plain number (assume seconds)
  const plainNumber = parseInt(trimmed, 10);
  if (!isNaN(plainNumber) && plainNumber >= 0) {
    return plainNumber;
  }

  // Invalid format
  return null;
}

/**
 * Format seconds into a compact human-readable duration string.
 * Examples:
 * - 75 seconds -> "1:15"
 * - 120 seconds -> "2:00"
 * - 45 seconds -> "0:45"
 * - 3665 seconds -> "1:01:05" (with hours if >= 1 hour)
 * 
 * @param seconds - The duration in seconds
 * @returns A formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0 || !Number.isFinite(seconds)) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    // Format with hours: "H:MM:SS"
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    // Format without hours: "M:SS"
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }
}

/**
 * Validate a duration input string.
 * Returns true if the input can be parsed into a valid duration.
 * 
 * @param input - The free-text duration string
 * @returns true if valid, false otherwise
 */
export function isValidDuration(input: string): boolean {
  return parseDuration(input) !== null;
}
