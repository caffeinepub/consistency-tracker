import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, {
      id : Text;
      name : Text;
      createdAt : Time.Time;
      weeklyTarget : Nat;
      unit : {
        #reps;
        #time;
        #custom : Text;
        #none;
      };
      defaultAmount : ?Nat;
    }>;
    habitRecords : Map.Map<Text, List.List<{
      habitId : Text;
      habitName : Text;
      day : Nat;
      month : Nat;
      year : Nat;
      completedAt : ?Time.Time;
      amount : ?Nat;
      unit : {
        #reps;
        #time;
        #custom : Text;
        #none;
      };
    }>>;
    userInvestmentGoals : Map.Map<Principal, Set.Set<Text>>;
    investmentGoals : Map.Map<Text, {
      id : Text;
      name : Text;
      ticker : Text;
      targetShares : Nat;
      currentBalance : Nat;
    }>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, {
      id : Text;
      name : Text;
      createdAt : Time.Time;
      weeklyTarget : Nat;
      unit : {
        #reps;
        #time;
        #custom : Text;
        #none;
      };
      defaultAmount : ?Nat;
    }>;
    habitRecords : Map.Map<Text, List.List<{
      habitId : Text;
      habitName : Text;
      day : Nat;
      month : Nat;
      year : Nat;
      completedAt : ?Time.Time;
      amount : ?Nat;
      unit : {
        #reps;
        #time;
        #custom : Text;
        #none;
      };
    }>>;
    userInvestmentGoals : Map.Map<Principal, Set.Set<Text>>;
    investmentGoals : Map.Map<Text, {
      id : Text;
      name : Text;
      ticker : Text;
      targetShares : Nat;
      currentBalance : Nat;
    }>;
    monthlyTargets : Map.Map<Text, {
      habitId : Text;
      amount : Nat;
      month : Nat;
      year : Nat;
    }>;
    lifetimeTotal : Map.Map<Text, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    let monthlyTargets = Map.empty<Text, {
      habitId : Text;
      amount : Nat;
      month : Nat;
      year : Nat;
    }>();

    let lifetimeTotal = Map.empty<Text, Nat>();

    {
      old with
      monthlyTargets;
      lifetimeTotal;
    };
  };
};
