import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Habit, HabitRecord, UserProfile, ExportData, HabitUnit, DefaultAmount } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  // Return deterministic loading state that blocks until query has resolved
  return {
    ...query,
    isLoading: actorFetching || query.isLoading || (!!actor && !!identity && !query.isFetched),
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetHabits() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabits();
    },
    enabled: !!actor && !!identity && !actorFetching,
  });
}

export function useCreateHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, weeklyTarget, unit, defaultAmount }: { name: string; weeklyTarget: number; unit: HabitUnit; defaultAmount?: number | null }) => {
      if (!actor) throw new Error('Actor not available');
      const amountValue: DefaultAmount = defaultAmount !== undefined && defaultAmount !== null ? BigInt(defaultAmount) : null;
      return actor.createHabit(name, BigInt(weeklyTarget), unit, amountValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHabit(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyRecords'] });
    },
  });
}

export function useUpdateHabitName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, newName }: { habitId: string; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHabitName(habitId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyRecords'] });
    },
  });
}

export function useUpdateHabitWeeklyTarget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, newWeeklyTarget }: { habitId: string; newWeeklyTarget: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHabitWeeklyTarget(habitId, BigInt(newWeeklyTarget));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyRecords'] });
    },
  });
}

export function useUpdateHabitUnit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, newUnit }: { habitId: string; newUnit: HabitUnit }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHabitUnit(habitId, newUnit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useUpdateHabitDefaultAmount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, newDefaultAmount }: { habitId: string; newDefaultAmount: number | null }) => {
      if (!actor) throw new Error('Actor not available');
      const amountValue: DefaultAmount = newDefaultAmount !== null ? BigInt(newDefaultAmount) : null;
      return actor.updateHabitDefaultAmount(habitId, amountValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyRecords'] });
    },
  });
}

export function useGetMonthlyRecords(month: number, year: number) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<HabitRecord[]>({
    queryKey: ['monthlyRecords', month, year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlyRecords(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !!identity && !actorFetching,
  });
}

export function useToggleHabitCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      day,
      month,
      year,
      amount,
    }: {
      habitId: string;
      day: number;
      month: number;
      year: number;
      amount?: number | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const amountBigInt = amount !== undefined && amount !== null ? BigInt(amount) : null;
      return actor.toggleHabitCompletion(habitId, BigInt(day), BigInt(month), BigInt(year), amountBigInt);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['monthlyRecords', variables.month, variables.year],
      });
    },
  });
}

export function useExportAllData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      startDay,
      startMonth,
      startYear,
      endDay,
      endMonth,
      endYear,
    }: {
      startDay: number;
      startMonth: number;
      startYear: number;
      endDay: number;
      endMonth: number;
      endYear: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportAllData(
        BigInt(startDay),
        BigInt(startMonth),
        BigInt(startYear),
        BigInt(endDay),
        BigInt(endMonth),
        BigInt(endYear)
      );
    },
  });
}

export function useExportSelectedHabitsData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      habitIds,
      startDay,
      startMonth,
      startYear,
      endDay,
      endMonth,
      endYear,
    }: {
      habitIds: string[];
      startDay: number;
      startMonth: number;
      startYear: number;
      endDay: number;
      endMonth: number;
      endYear: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportSelectedHabitsData(
        habitIds,
        BigInt(startDay),
        BigInt(startMonth),
        BigInt(startYear),
        BigInt(endDay),
        BigInt(endMonth),
        BigInt(endYear)
      );
    },
  });
}
