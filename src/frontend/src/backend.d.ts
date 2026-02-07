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
    monthlyTargets: Array<MonthlyTarget>;
    investmentDiaryEntries: Array<InvestmentDiaryEntry>;
    habitRecords: Array<HabitRecord>;
    diaryEntries: Array<[string, DiaryEntry]>;
    investmentGoals: Array<InvestmentGoal>;
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
    title: string;
    content: string;
}
export interface MonthlyTarget {
    month: bigint;
    year: bigint;
    habitId: string;
    amount: bigint;
}
export interface UpdateInvestmentGoal {
    target: bigint;
    currentlyHeld: bigint;
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
export interface NewInvestmentGoal {
    asset: string;
    target: bigint;
    currentlyHeld: bigint;
}
export interface InvestmentGoal {
    id: bigint;
    asset: string;
    target: bigint;
    currentlyHeld: bigint;
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
export interface DiagnosticLog {
    message: string;
    timestamp: Time;
}
export interface InvestmentDiaryEntry {
    id: bigint;
    asset: string;
    date: bigint;
    notes: string;
    amount: bigint;
}
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createHabit(name: string, weeklyTarget: bigint, unit: HabitUnit, defaultAmount: DefaultAmount): Promise<string>;
    createInvestmentGoal(newGoal: NewInvestmentGoal): Promise<bigint>;
    deleteHabit(habitId: string): Promise<void>;
    deleteInvestmentGoal(goalId: bigint): Promise<void>;
    exportAllData(startDay: bigint, startMonth: bigint, startYear: bigint, endDay: bigint, endMonth: bigint, endYear: bigint): Promise<ExportData>;
    getAllDiaryEntries(): Promise<Array<[string, DiaryEntry]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDiaryEntries(): Promise<Array<InvestmentDiaryEntry>>;
    getDiaryEntry(date: string): Promise<DiaryEntry | null>;
    getGoalProgress(goalId: bigint): Promise<bigint | null>;
    getHabits(): Promise<Array<Habit>>;
    getInvestmentGoals(): Promise<Array<InvestmentGoal>>;
    getLifetimeTotal(habitId: string): Promise<bigint>;
    getLogs(): Promise<Array<DiagnosticLog>>;
    getMonthlyRecords(month: bigint, year: bigint): Promise<Array<HabitRecord>>;
    getMonthlyTarget(habitId: string, month: bigint, year: bigint): Promise<MonthlyTarget | null>;
    getTotalGoalsProgress(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    healthCheck(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDiaryEntry(date: string, title: string, content: string): Promise<void>;
    testLog(_message: string): Promise<string>;
    toggleHabitCompletion(habitId: string, day: bigint, month: bigint, year: bigint, amount: DefaultAmount): Promise<void>;
    updateHabitDefaultAmount(habitId: string, newDefaultAmount: DefaultAmount): Promise<void>;
    updateHabitName(habitId: string, newName: string): Promise<void>;
    updateHabitUnit(habitId: string, newUnit: HabitUnit): Promise<void>;
    updateHabitWeeklyTarget(habitId: string, newWeeklyTarget: bigint): Promise<void>;
    updateInvestmentGoal(goalId: bigint, updates: UpdateInvestmentGoal): Promise<void>;
    updateMonthlyTarget(habitId: string, amount: bigint, month: bigint, year: bigint): Promise<void>;
}
