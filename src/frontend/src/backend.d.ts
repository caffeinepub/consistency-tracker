import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExportData {
    records: Array<HabitRecord>;
    monthlyTargets: Array<MonthlyTarget>;
    habits: Array<Habit>;
    profile?: UserProfile;
}
export type Time = bigint;
export type HabitUnit = {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "none";
    none: null;
} | {
    __kind__: "reps";
    reps: null;
} | {
    __kind__: "time";
    time: null;
};
export interface InvestmentGoal {
    id: string;
    ticker: string;
    currentBalance: bigint;
    name: string;
    targetShares: bigint;
}
export interface HabitRecord {
    day: bigint;
    completedAt?: Time;
    month: bigint;
    habitName: string;
    unit: HabitUnit;
    year: bigint;
    habitId: string;
    amount?: bigint;
}
export interface MonthlyTarget {
    month: bigint;
    year: bigint;
    habitId: string;
    amount: bigint;
}
export interface Habit {
    id: string;
    name: string;
    createdAt: Time;
    unit: HabitUnit;
    defaultAmount: DefaultAmount;
    weeklyTarget: bigint;
}
export type DefaultAmount = bigint | null;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createHabit(name: string, weeklyTarget: bigint, unit: HabitUnit, defaultAmount: DefaultAmount): Promise<string>;
    createInvestmentGoal(name: string, ticker: string, targetShares: bigint, currentBalance: bigint): Promise<string>;
    deleteHabit(habitId: string): Promise<void>;
    deleteInvestmentGoal(goalId: string): Promise<void>;
    exportAllData(startDay: bigint, startMonth: bigint, startYear: bigint, endDay: bigint, endMonth: bigint, endYear: bigint): Promise<ExportData>;
    exportSelectedHabitsData(habitIds: Array<string>, startDay: bigint, startMonth: bigint, startYear: bigint, endDay: bigint, endMonth: bigint, endYear: bigint): Promise<ExportData>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHabits(): Promise<Array<Habit>>;
    getInvestmentGoal(goalId: string): Promise<InvestmentGoal | null>;
    getInvestmentGoals(): Promise<Array<InvestmentGoal>>;
    getLifetimeTotal(habitId: string): Promise<bigint>;
    getMonthlyRecords(month: bigint, year: bigint): Promise<Array<HabitRecord>>;
    getMonthlyTargets(habitId: string): Promise<Array<MonthlyTarget>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleHabitCompletion(habitId: string, day: bigint, month: bigint, year: bigint, amount: DefaultAmount): Promise<void>;
    updateHabitDefaultAmount(habitId: string, newDefaultAmount: DefaultAmount): Promise<void>;
    updateHabitName(habitId: string, newName: string): Promise<void>;
    updateHabitUnit(habitId: string, newUnit: HabitUnit): Promise<void>;
    updateHabitWeeklyTarget(habitId: string, newWeeklyTarget: bigint): Promise<void>;
    updateInvestmentGoal(goalId: string, newName: string, newTicker: string, newTargetShares: bigint, newCurrentBalance: bigint): Promise<void>;
    updateMonthlyTarget(habitId: string, amount: bigint, month: bigint, year: bigint): Promise<void>;
}
