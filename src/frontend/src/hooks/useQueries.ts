import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Habit, HabitRecord, UserProfile, HabitUnit, DefaultAmount, MonthlyTarget } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getCallerUserProfile();
      return profile;
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      const habits = await actor.getHabits();
      return habits || [];
    },
    enabled: !!actor && !!identity && !actorFetching,
    placeholderData: [],
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
      queryClient.invalidateQueries({ queryKey: ['monthlyTarget'] });
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
      const records = await actor.getMonthlyRecords(BigInt(month), BigInt(year));
      return records || [];
    },
    enabled: !!actor && !!identity && !actorFetching,
    placeholderData: [],
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
      // Invalidate the monthly records for the affected month
      queryClient.invalidateQueries({
        queryKey: ['monthlyRecords', variables.month, variables.year],
      });
      // Invalidate monthly target for this specific habit+month+year
      queryClient.invalidateQueries({
        queryKey: ['monthlyTarget', variables.habitId, variables.month, variables.year],
      });
    },
  });
}

export function useGetMonthlyTarget(habitId: string, month: number, year: number) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<MonthlyTarget | null>({
    queryKey: ['monthlyTarget', habitId, month, year],
    queryFn: async () => {
      if (!actor) return null;
      const target = await actor.getMonthlyTarget(habitId, BigInt(month), BigInt(year));
      return target;
    },
    enabled: !!actor && !!identity && !actorFetching && !!habitId,
  });
}

export function useGetMultipleMonthlyTargets(habitIds: string[], month: number, year: number) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const queries = useQueries({
    queries: habitIds.map((habitId) => ({
      queryKey: ['monthlyTarget', habitId, month, year],
      queryFn: async () => {
        if (!actor) return null;
        const target = await actor.getMonthlyTarget(habitId, BigInt(month), BigInt(year));
        return target;
      },
      enabled: !!actor && !!identity && !actorFetching && !!habitId,
    })),
  });

  // Combine all targets into a single lookup map
  const targetsMap = new Map<string, MonthlyTarget>();
  queries.forEach((query) => {
    if (query.data) {
      const key = `${query.data.habitId}_${query.data.month}_${query.data.year}`;
      targetsMap.set(key, query.data);
    }
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);

  return {
    targetsMap,
    isLoading,
    isFetching,
  };
}

export function useUpdateMonthlyTarget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      amount,
      month,
      year,
    }: {
      habitId: string;
      amount: number;
      month: number;
      year: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMonthlyTarget(habitId, BigInt(amount), BigInt(month), BigInt(year));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['monthlyTarget', variables.habitId, variables.month, variables.year] 
      });
    },
  });
}
