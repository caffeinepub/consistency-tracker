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
export interface DiaryEntry {
    id: bigint;
    asset: string;
    date: bigint;
    notes: string;
    amount: bigint;
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
export interface Habit {
    id: string;
    name: string;
    createdAt: Time;
    unit: HabitUnit;
    defaultAmount: DefaultAmount;
    weeklyTarget: bigint;
}
export interface MonthlyTarget {
    month: bigint;
    year: bigint;
    habitId: string;
    amount: bigint;
}
export interface DiagnosticLog {
    message: string;
    timestamp: Time;
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
    addDiaryEntry(date: bigint, asset: string, amount: bigint, notes: string): Promise<bigint>;
    addInvestmentGoal(asset: string, targetAmount: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createHabit(name: string, weeklyTarget: bigint, unit: HabitUnit, defaultAmount: DefaultAmount): Promise<string>;
    deleteHabit(habitId: string): Promise<void>;
    exportAllData(startDay: bigint, startMonth: bigint, startYear: bigint, endDay: bigint, endMonth: bigint, endYear: bigint): Promise<ExportData>;
    exportSelectedHabitsData(habitIds: Array<string>, startDay: bigint, startMonth: bigint, startYear: bigint, endDay: bigint, endMonth: bigint, endYear: bigint): Promise<ExportData>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDiaryEntries(): Promise<Array<DiaryEntry>>;
    getHabits(): Promise<Array<Habit>>;
    getLifetimeTotal(habitId: string): Promise<bigint>;
    getLogs(): Promise<Array<DiagnosticLog>>;
    getMonthlyRecords(month: bigint, year: bigint): Promise<Array<HabitRecord>>;
    getMonthlyTarget(habitId: string, month: bigint, year: bigint): Promise<MonthlyTarget | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkDiaryEntryToGoal(entryId: bigint, goalId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    testLog(_message: string): Promise<string>;
    toggleHabitCompletion(habitId: string, day: bigint, month: bigint, year: bigint, amount: DefaultAmount): Promise<void>;
    updateHabitDefaultAmount(habitId: string, newDefaultAmount: DefaultAmount): Promise<void>;
    updateHabitName(habitId: string, newName: string): Promise<void>;
    updateHabitUnit(habitId: string, newUnit: HabitUnit): Promise<void>;
    updateHabitWeeklyTarget(habitId: string, newWeeklyTarget: bigint): Promise<void>;
    updateMonthlyTarget(habitId: string, amount: bigint, month: bigint, year: bigint): Promise<void>;
}
