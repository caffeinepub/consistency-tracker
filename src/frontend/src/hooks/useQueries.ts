import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Habit, HabitRecord, UserProfile, HabitUnit, DefaultAmount, MonthlyTarget, InvestmentDiaryEntry, InvestmentGoal, NewInvestmentGoal, UpdateInvestmentGoal, ExportData } from '../backend';

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
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
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
      return habits;
    },
    enabled: !!actor && !!identity && !actorFetching,
  });
}

export function useCreateHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      weeklyTarget,
      unit,
      defaultAmount,
    }: {
      name: string;
      weeklyTarget: bigint;
      unit: HabitUnit;
      defaultAmount: DefaultAmount;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createHabit(name, weeklyTarget, unit, defaultAmount);
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
    mutationFn: async ({ habitId, newWeeklyTarget }: { habitId: string; newWeeklyTarget: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHabitWeeklyTarget(habitId, newWeeklyTarget);
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
    mutationFn: async ({ habitId, newDefaultAmount }: { habitId: string; newDefaultAmount: DefaultAmount }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHabitDefaultAmount(habitId, newDefaultAmount);
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
      return records;
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
      day: bigint;
      month: bigint;
      year: bigint;
      amount: DefaultAmount;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleHabitCompletion(habitId, day, month, year, amount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['monthlyRecords', Number(variables.month), Number(variables.year)],
      });
      queryClient.invalidateQueries({ queryKey: ['monthlyTarget'] });
      queryClient.invalidateQueries({ queryKey: ['lifetimeTotal'] });
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

export function useGetLifetimeTotal(habitId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['lifetimeTotal', habitId],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      const total = await actor.getLifetimeTotal(habitId);
      return total;
    },
    enabled: !!actor && !!identity && !actorFetching && !!habitId,
  });
}

export function useSaveDiaryEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, title, content }: { date: string; title: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDiaryEntry(date, title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaryEntry'] });
      queryClient.invalidateQueries({ queryKey: ['allDiaryEntries'] });
    },
  });
}

export function useGetDiaryEntry(date: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['diaryEntry', date],
    queryFn: async () => {
      if (!actor) return null;
      const entry = await actor.getDiaryEntry(date);
      return entry;
    },
    enabled: !!actor && !!identity && !actorFetching && !!date,
  });
}

export function useGetAllDiaryEntries() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['allDiaryEntries'],
    queryFn: async () => {
      if (!actor) return [];
      const entries = await actor.getAllDiaryEntries();
      return entries;
    },
    enabled: !!actor && !!identity && !actorFetching,
  });
}

export function useCreateInvestmentGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGoal: NewInvestmentGoal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInvestmentGoal(newGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investmentGoals'] });
    },
  });
}

export function useUpdateInvestmentGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: bigint; updates: UpdateInvestmentGoal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInvestmentGoal(goalId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investmentGoals'] });
    },
  });
}

export function useDeleteInvestmentGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInvestmentGoal(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investmentGoals'] });
    },
  });
}

export function useGetInvestmentGoals() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<InvestmentGoal[]>({
    queryKey: ['investmentGoals'],
    queryFn: async () => {
      if (!actor) return [];
      const goals = await actor.getInvestmentGoals();
      return goals;
    },
    enabled: !!actor && !!identity && !actorFetching,
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
      startDay: bigint;
      startMonth: bigint;
      startYear: bigint;
      endDay: bigint;
      endMonth: bigint;
      endYear: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const data = await actor.exportAllData(startDay, startMonth, startYear, endDay, endMonth, endYear);
      return data;
    },
  });
}
