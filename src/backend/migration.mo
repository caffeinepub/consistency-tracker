import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type DefaultAmount = ?Nat;

  public type UserProfile = {
    name : Text;
  };

  public type HabitUnit = {
    #reps;
    #time;
    #custom : Text;
    #none;
  };

  public type MonthlyTarget = {
    habitId : Text;
    amount : Nat;
    month : Nat;
    year : Nat;
  };

  module Habit {
    public func compare(h1 : Habit, h2 : Habit) : Order.Order {
      Text.compare(h1.name, h2.name);
    };
  };

  public type Habit = {
    id : Text;
    name : Text;
    createdAt : Time.Time;
    weeklyTarget : Nat;
    unit : HabitUnit;
    defaultAmount : DefaultAmount;
  };

  public type HabitRecord = {
    habitId : Text;
    habitName : Text;
    day : Nat;
    month : Nat;
    year : Nat;
    completedAt : ?Time.Time;
    amount : ?Nat;
    unit : HabitUnit;
  };

  public type InvestmentGoal = {
    id : Text;
    name : Text;
    ticker : Text;
    targetShares : Nat;
    currentBalance : Nat;
  };

  public type ExportData = {
    profile : ?UserProfile;
    habits : [Habit];
    records : [HabitRecord];
    monthlyTargets : [MonthlyTarget];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, Habit>;
    habitRecords : Map.Map<Text, List.List<HabitRecord>>;
    userInvestmentGoals : Map.Map<Principal, Set.Set<Text>>;
    investmentGoals : Map.Map<Text, InvestmentGoal>;
    monthlyTargets : Map.Map<Text, MonthlyTarget>;
    lifetimeTotal : Map.Map<Text, Nat>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, Habit>;
    habitRecords : Map.Map<Text, List.List<HabitRecord>>;
    userInvestmentGoals : Map.Map<Principal, Set.Set<Text>>;
    investmentGoals : Map.Map<Text, InvestmentGoal>;
    monthlyTargets : Map.Map<Text, MonthlyTarget>;
    lifetimeTotal : Map.Map<Text, Nat>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
