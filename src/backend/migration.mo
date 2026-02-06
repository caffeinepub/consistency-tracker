import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type DefaultAmount = ?Nat;

  type UserProfile = {
    name : Text;
  };

  type HabitUnit = {
    #reps;
    #time;
    #custom : Text;
    #none;
  };

  type MonthlyTarget = {
    habitId : Text;
    amount : Nat;
    month : Nat;
    year : Nat;
  };

  type Habit = {
    id : Text;
    name : Text;
    createdAt : Time.Time;
    weeklyTarget : Nat;
    unit : HabitUnit;
    defaultAmount : DefaultAmount;
  };

  type HabitRecord = {
    habitId : Text;
    habitName : Text;
    day : Nat;
    month : Nat;
    year : Nat;
    completedAt : ?Time.Time;
    amount : ?Nat;
    unit : HabitUnit;
  };

  // Version 18 state
  type OldState = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, Habit>;
    habitRecords : Map.Map<Text, List.List<HabitRecord>>;
    monthlyTargets : Map.Map<Text, MonthlyTarget>;
    lifetimeTotal : Map.Map<Text, Nat>;
  };

  // Version 18 state (identical type to OldState)
  type NewState = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, Habit>;
    habitRecords : Map.Map<Text, List.List<HabitRecord>>;
    monthlyTargets : Map.Map<Text, MonthlyTarget>;
    lifetimeTotal : Map.Map<Text, Nat>;
  };

  public func run(old : OldState) : NewState {
    {
      userProfiles = old.userProfiles;
      userHabits = old.userHabits;
      habits = old.habits;
      habitRecords = old.habitRecords;
      monthlyTargets = old.monthlyTargets;
      lifetimeTotal = old.lifetimeTotal;
    };
  };
};
