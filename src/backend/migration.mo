import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, {
      name : Text;
    }>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, {
      id : Text;
      name : Text;
      createdAt : Int;
      weeklyTarget : Nat;
      unit : { #reps; #time; #custom : Text; #none };
      defaultAmount : ?Nat;
    }>;
    habitRecords : Map.Map<Text, List.List<{
      habitId : Text;
      habitName : Text;
      day : Nat;
      month : Nat;
      year : Nat;
      completedAt : ?Int;
      amount : ?Nat;
      unit : { #reps; #time; #custom : Text; #none };
    }>>;
    monthlyTargets : Map.Map<Text, {
      habitId : Text;
      amount : Nat;
      month : Nat;
      year : Nat;
    }>;
    lifetimeTotal : Map.Map<Text, Nat>;
    logs : List.List<{
      timestamp : Int;
      message : Text;
    }>;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, {
      name : Text;
    }>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, {
      id : Text;
      name : Text;
      createdAt : Int;
      weeklyTarget : Nat;
      unit : { #reps; #time; #custom : Text; #none };
      defaultAmount : ?Nat;
    }>;
    habitRecords : Map.Map<Text, List.List<{
      habitId : Text;
      habitName : Text;
      day : Nat;
      month : Nat;
      year : Nat;
      completedAt : ?Int;
      amount : ?Nat;
      unit : { #reps; #time; #custom : Text; #none };
    }>>;
    monthlyTargets : Map.Map<Text, {
      habitId : Text;
      amount : Nat;
      month : Nat;
      year : Nat;
    }>;
    lifetimeTotal : Map.Map<Text, Nat>;
    logs : List.List<{
      timestamp : Int;
      message : Text;
    }>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
