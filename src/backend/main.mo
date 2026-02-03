import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use migration to transform old into new representation on upgrade
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type HabitUnit = {
    #reps;
    #time;
    #custom : Text;
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
  };

  public type HabitRecord = {
    habitId : Text;
    habitName : Text;
    day : Nat;
    month : Nat;
    year : Nat;
    completedAt : ?Time.Time;
    amount : ?Nat; // Add optional amount field
  };

  public type ExportData = {
    profile : ?UserProfile;
    habits : [Habit];
    records : [HabitRecord];
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userHabits = Map.empty<Principal, Set.Set<Text>>();
  let habits = Map.empty<Text, Habit>();
  let habitRecords = Map.empty<Text, List.List<HabitRecord>>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createHabit(name : Text, weeklyTarget : Nat, unit : HabitUnit) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create habits");
    };

    let habitId = name.concat(Time.now().toText());
    let habit : Habit = {
      id = habitId;
      name;
      createdAt = Time.now();
      weeklyTarget;
      unit;
    };

    if (habits.containsKey(habitId)) {
      Runtime.trap("Habit already exists");
    };

    switch (userHabits.get(caller)) {
      case (null) {
        let habitSet = Set.empty<Text>();
        habitSet.add(habitId);
        userHabits.add(caller, habitSet);
      };
      case (?habitSet) {
        if (habitSet.contains(habitId)) {
          Runtime.trap("Habit already exists for user");
        };
        habitSet.add(habitId);
      };
    };

    habits.add(habitId, habit);
    habitId;
  };

  public shared ({ caller }) func deleteHabit(habitId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete habits");
    };

    switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Habit does not belong to user") };
      case (?habitSet) {
        if (not habitSet.contains(habitId)) {
          Runtime.trap("Unauthorized: Habit does not belong to user");
        };
        habitSet.remove(habitId);
        habits.remove(habitId);
        habitRecords.remove(habitId);
      };
    };
  };

  public shared ({ caller }) func toggleHabitCompletion(
    habitId : Text,
    day : Nat,
    month : Nat,
    year : Nat,
    amount : ?Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle habit completion");
    };

    switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Habit does not belong to user") };
      case (?habitSet) {
        if (not habitSet.contains(habitId)) {
          Runtime.trap("Unauthorized: Habit does not belong to user");
        };
      };
    };

    if (not habits.containsKey(habitId)) {
      Runtime.trap("Habit not found");
    };

    switch (habitRecords.get(habitId)) {
      case (null) {
        let records = List.empty<HabitRecord>();
        let record : HabitRecord = {
          habitId;
          habitName = habits.get(habitId).unwrap().name;
          day;
          month;
          year;
          completedAt = ?Time.now();
          amount;
        };
        records.add(record);
        habitRecords.add(habitId, records);
      };
      case (?records) {
        let recordOpt = records.find(
          func(r) { r.day == day and r.month == month and r.year == year }
        );

        switch (recordOpt) {
          case (null) {
            let newRecord : HabitRecord = {
              habitId;
              habitName = habits.get(habitId).unwrap().name;
              day;
              month;
              year;
              completedAt = ?Time.now();
              amount;
            };
            records.add(newRecord);
          };
          case (?existingRecord) {
            let filteredRecords = records.filter(func(r) { not (r.day == day and r.month == month and r.year == year) });
            records.clear();
            records.addAll(filteredRecords.values());
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateHabitWeeklyTarget(habitId : Text, newWeeklyTarget : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update habits");
    };

    if (newWeeklyTarget < 1 or newWeeklyTarget > 7) {
      Runtime.trap("Invalid weekly target: Must be between 1 and 7");
    };

    switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Habit does not belong to user") };
      case (?habitSet) {
        if (not habitSet.contains(habitId)) {
          Runtime.trap("Unauthorized: Habit does not belong to user");
        };
      };
    };

    switch (habits.get(habitId)) {
      case (null) { Runtime.trap("Habit not found") };
      case (?habit) {
        let updatedHabit = { habit with weeklyTarget = newWeeklyTarget };
        habits.add(habitId, updatedHabit);
      };
    };
  };

  public shared ({ caller }) func updateHabitUnit(habitId : Text, newUnit : HabitUnit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update habits");
    };

    switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Habit does not belong to user") };
      case (?habitSet) {
        if (not habitSet.contains(habitId)) {
          Runtime.trap("Unauthorized: Habit does not belong to user");
        };
      };
    };

    switch (habits.get(habitId)) {
      case (null) { Runtime.trap("Habit not found") };
      case (?habit) {
        let updatedHabit = { habit with unit = newUnit };
        habits.add(habitId, updatedHabit);
      };
    };
  };

  public query ({ caller }) func getHabits() : async [Habit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view habits");
    };

    switch (userHabits.get(caller)) {
      case (null) { [] };
      case (?habitSet) {
        let habitIds = habitSet.toArray();
        habitIds.map<Text, Habit>(
          func(id) {
            switch (habits.get(id)) {
              case (null) { Runtime.trap("Habit not found") };
              case (?habit) { habit };
            };
          }
        ).sort();
      };
    };
  };

  public query ({ caller }) func getMonthlyRecords(month : Nat, year : Nat) : async [HabitRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view records");
    };

    switch (userHabits.get(caller)) {
      case (null) { [] };
      case (?habitSet) {
        let userHabitIds = habitSet.toArray();
        userHabitIds.map<Text, [HabitRecord]>(
          func(habitId) {
            switch (habitRecords.get(habitId)) {
              case (null) { [] };
              case (?records) {
                records.toArray().filter(
                  func(r) { r.month == month and r.year == year }
                );
              };
            };
          }
        ).flatten();
      };
    };
  };

  public query ({ caller }) func exportAllData(
    startDay : Nat,
    startMonth : Nat,
    startYear : Nat,
    endDay : Nat,
    endMonth : Nat,
    endYear : Nat
  ) : async ExportData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can export data");
    };

    let profile = userProfiles.get(caller);

    let userHabitsList : [Habit] = switch (userHabits.get(caller)) {
      case (null) { [] };
      case (?habitSet) {
        let habitIds = habitSet.toArray();
        habitIds.map<Text, Habit>(
          func(id) {
            switch (habits.get(id)) {
              case (null) { Runtime.trap("Habit not found") };
              case (?habit) { habit };
            };
          }
        ).sort();
      };
    };

    let filteredRecords : [HabitRecord] = switch (userHabits.get(caller)) {
      case (null) { [] };
      case (?habitSet) {
        let userHabitIds = habitSet.toArray();
        userHabitIds.map<Text, [HabitRecord]>(
          func(habitId) {
            switch (habitRecords.get(habitId)) {
              case (null) { [] };
              case (?records) {
                records.toArray().filter(
                  func(r) {
                    let recordDate = r.year * 10000 + r.month * 100 + r.day;
                    let startDate = startYear * 10000 + startMonth * 100 + startDay;
                    let endDate = endYear * 10000 + endMonth * 100 + endDay;
                    recordDate >= startDate and recordDate <= endDate;
                  }
                );
              };
            };
          }
        ).flatten();
      };
    };

    {
      profile;
      habits = userHabitsList;
      records = filteredRecords;
    };
  };

  public query ({ caller }) func exportSelectedHabitsData(
    habitIds : [Text],
    startDay : Nat,
    startMonth : Nat,
    startYear : Nat,
    endDay : Nat,
    endMonth : Nat,
    endYear : Nat
  ) : async ExportData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can export data");
    };

    let userHabitSet = switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("User has no habits") };
      case (?habitSet) { habitSet };
    };

    for (habitId in habitIds.values()) {
      if (not userHabitSet.contains(habitId)) {
        Runtime.trap("Unauthorized: One or more habits do not belong to user");
      };
    };

    let profile = userProfiles.get(caller);

    let selectedHabits : [Habit] = habitIds.map<Text, Habit>(
      func(id) {
        switch (habits.get(id)) {
          case (null) { Runtime.trap("Habit not found") };
          case (?habit) { habit };
        };
      }
    ).sort();

    let filteredRecords : [HabitRecord] = habitIds.map<Text, [HabitRecord]>(
      func(habitId) {
        switch (habitRecords.get(habitId)) {
          case (null) { [] };
          case (?records) {
            records.toArray().filter(
              func(r) {
                let recordDate = r.year * 10000 + r.month * 100 + r.day;
                let startDate = startYear * 10000 + startMonth * 100 + startDay;
                let endDate = endYear * 10000 + endMonth * 100 + endDay;
                recordDate >= startDate and recordDate <= endDate;
              }
            );
          };
        };
      }
    ).flatten();

    {
      profile;
      habits = selectedHabits;
      records = filteredRecords;
    };
  };
};
