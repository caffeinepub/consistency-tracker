/**
 * Steady Climb Year Plan lookup for monthly targets.
 * Maps calendar months (1-12) to progressive monthly targets for specific habits.
 */

export interface SteadyClimbTargets {
  pushUps: number;
  squats: number;
  plankSeconds: number;
}

/**
 * Get the Steady Climb plan targets for a given calendar month (1-12).
 * January = Month 1, February = Month 2, etc.
 */
export function getSteadyClimbTargets(month: number): SteadyClimbTargets {
  // Clamp month to valid range 1-12
  const validMonth = Math.max(1, Math.min(12, month));

  const planData: Record<number, SteadyClimbTargets> = {
    1: { pushUps: 20, squats: 20, plankSeconds: 60 }, // 1 Min
    2: { pushUps: 25, squats: 25, plankSeconds: 75 }, // 1 Min 15s
    3: { pushUps: 30, squats: 30, plankSeconds: 90 }, // 1 Min 30s
    4: { pushUps: 35, squats: 35, plankSeconds: 105 }, // 1 Min 45s
    5: { pushUps: 40, squats: 40, plankSeconds: 120 }, // 2 Mins
    6: { pushUps: 45, squats: 45, plankSeconds: 135 }, // 2 Mins 15s
    7: { pushUps: 50, squats: 50, plankSeconds: 150 }, // 2 Mins 30s
    8: { pushUps: 55, squats: 55, plankSeconds: 165 }, // 2 Mins 45s
    9: { pushUps: 60, squats: 60, plankSeconds: 180 }, // 3 Mins
    10: { pushUps: 65, squats: 65, plankSeconds: 195 }, // 3 Mins 15s
    11: { pushUps: 70, squats: 70, plankSeconds: 210 }, // 3 Mins 30s
    12: { pushUps: 75, squats: 75, plankSeconds: 240 }, // 4 Mins
  };

  return planData[validMonth];
}

/**
 * Get the Steady Climb plan target for a specific habit and month.
 * Returns null if the habit is not part of the Steady Climb plan.
 */
export function getSteadyClimbTargetForHabit(habitName: string, month: number): number | null {
  const normalized = habitName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const targets = getSteadyClimbTargets(month);

  // Push-ups and Press-ups share the same target
  if (normalized === 'pushups' || normalized === 'pressups') {
    return targets.pushUps;
  }

  if (normalized === 'squats') {
    return targets.squats;
  }

  if (normalized === 'plank') {
    return targets.plankSeconds;
  }

  return null;
}
