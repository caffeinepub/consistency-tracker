import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userHabits = Map.empty<Principal, Set.Set<Text>>();
  let habits = Map.empty<Text, Habit>();
  let habitRecords = Map.empty<Text, List.List<HabitRecord>>();
  let userInvestmentGoals = Map.empty<Principal, Set.Set<Text>>();
  let investmentGoals = Map.empty<Text, InvestmentGoal>();
  let monthlyTargets = Map.empty<Text, MonthlyTarget>();
  let lifetimeTotal = Map.empty<Text, Nat>();

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

  public shared ({ caller }) func createHabit(
    name : Text,
    weeklyTarget : Nat,
    unit : HabitUnit,
    defaultAmount : DefaultAmount,
  ) : async Text {
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
      defaultAmount;
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

  public shared ({ caller }) func updateHabitName(habitId : Text, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update habit names");
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
      case (null) {
        Runtime.trap("Habit not found");
      };
      case (?habit) {
        let updatedHabit : Habit = { habit with name = newName };
        habits.add(habitId, updatedHabit);
        switch (habitRecords.get(habitId)) {
          case (null) { () };
          case (?records) {
            let updatedRecords = records.map<HabitRecord, HabitRecord>(
              func(record) {
                { record with habitName = newName };
              }
            );
            habitRecords.add(habitId, updatedRecords);
          };
        };
      };
    };
  };

  public shared ({ caller }) func toggleHabitCompletion(
    habitId : Text,
    day : Nat,
    month : Nat,
    year : Nat,
    amount : DefaultAmount,
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

    let habit = switch (habits.get(habitId)) {
      case (null) { Runtime.trap("Habit not found") };
      case (?h) { h };
    };

    let habitUnit = habit.unit;
    let finalAmount = switch (amount) {
      case (?a) { ?a };
      case (null) { habit.defaultAmount };
    };

    switch (habitRecords.get(habitId)) {
      case (null) {
        let records = List.empty<HabitRecord>();
        let record : HabitRecord = {
          habitId;
          habitName = habit.name;
          day;
          month;
          year;
          completedAt = ?Time.now();
          amount = finalAmount;
          unit = habitUnit;
        };
        records.add(record);
        habitRecords.add(habitId, records);

        // Update lifetime total for new record
        let completedAmount = switch (finalAmount) {
          case (null) { 1 };
          case (?amt) { amt };
        };
        let newLifetimeTotal = switch (lifetimeTotal.get(habitId)) {
          case (null) { completedAmount };
          case (?currentTotal) { currentTotal + completedAmount };
        };
        lifetimeTotal.add(habitId, newLifetimeTotal);
      };
      case (?records) {
        let existingRecord = records.find(
          func(r) { r.day == day and r.month == month and r.year == year }
        );

        if (existingRecord.isNull()) {
          // Adding new record
          let newRecord : HabitRecord = {
            habitId;
            habitName = habit.name;
            day;
            month;
            year;
            completedAt = ?Time.now();
            amount = finalAmount;
            unit = habitUnit;
          };
          records.add(newRecord);

          // Update lifetime total for new record
          let completedAmount = switch (finalAmount) {
            case (null) { 1 };
            case (?amt) { amt };
          };
          let newLifetimeTotal = switch (lifetimeTotal.get(habitId)) {
            case (null) { completedAmount };
            case (?currentTotal) { currentTotal + completedAmount };
          };
          lifetimeTotal.add(habitId, newLifetimeTotal);
        } else {
          // Removing existing record - subtract from lifetime total
          switch (existingRecord) {
            case (?existing) {
              let removedAmount = switch (existing.amount) {
                case (null) { 1 };
                case (?amt) { amt };
              };
              let newLifetimeTotal = switch (lifetimeTotal.get(habitId)) {
                case (null) { 0 };
                case (?currentTotal) {
                  if (currentTotal >= removedAmount) {
                    currentTotal - removedAmount;
                  } else {
                    0;
                  };
                };
              };
              lifetimeTotal.add(habitId, newLifetimeTotal);
            };
            case (null) { () };
          };

          let filteredRecords = records.filter(func(r) { not (r.day == day and r.month == month and r.year == year) });
          records.clear();
          records.addAll(filteredRecords.values());
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
        habits.add(habitId, { habit with weeklyTarget = newWeeklyTarget });
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
        habits.add(habitId, { habit with unit = newUnit });
      };
    };
  };

  public shared ({ caller }) func updateHabitDefaultAmount(habitId : Text, newDefaultAmount : DefaultAmount) : async () {
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
        habits.add(habitId, { habit with defaultAmount = newDefaultAmount });
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

  public shared ({ caller }) func updateMonthlyTarget(habitId : Text, amount : Nat, month : Nat, year : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update monthly targets");
    };

    // Verify habit exists
    let habitExists = switch (habits.get(habitId)) {
      case (null) { false };
      case (?_) { true };
    };

    if (not habitExists) {
      Runtime.trap("Habit does not exist for provided habit ID");
    };

    // Verify habit belongs to caller
    switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Habit does not belong to user") };
      case (?habitSet) {
        if (not habitSet.contains(habitId)) {
          Runtime.trap("Unauthorized: Habit does not belong to user");
        };
      };
    };

    let targetId = habitId.concat("_").concat(month.toText()).concat("_").concat(year.toText());
    let newMonthlyTarget : MonthlyTarget = {
      habitId;
      amount;
      month;
      year;
    };

    monthlyTargets.add(targetId, newMonthlyTarget);
  };

  public query ({ caller }) func getMonthlyTargets(habitId : Text) : async [MonthlyTarget] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view monthly targets");
    };

    // Verify habit exists
    let exists = switch (habits.get(habitId)) {
      case (null) { false };
      case (?_) { true };
    };

    if (not exists) {
      Runtime.trap("Habit not found");
    };

    // Verify habit belongs to caller
    switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Habit does not belong to user") };
      case (?habitSet) {
        if (not habitSet.contains(habitId)) {
          Runtime.trap("Unauthorized: Habit does not belong to user");
        };
      };
    };

    monthlyTargets.toArray().filter(
      func((k, target)) { target.habitId == habitId }
    ).map<(?Text, MonthlyTarget), MonthlyTarget>(
      func(entry) { switch (entry) { case ((_, target)) { target } } }
    );
  };

  public query ({ caller }) func getLifetimeTotal(habitId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lifetime totals");
    };

    // Verify habit belongs to caller
    switch (userHabits.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Habit does not belong to user") };
      case (?habitSet) {
        if (not habitSet.contains(habitId)) {
          Runtime.trap("Unauthorized: Habit does not belong to user");
        };
      };
    };

    switch (lifetimeTotal.get(habitId)) {
      case (null) { 0 };
      case (?total) { total };
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
      monthlyTargets = [];
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
      monthlyTargets = [];
    };
  };

  public shared ({ caller }) func createInvestmentGoal(
    name : Text,
    ticker : Text,
    targetShares : Nat,
    currentBalance : Nat,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create investment goals");
    };

    let goalId = name.concat(ticker).concat(Time.now().toText());
    let investmentGoal : InvestmentGoal = {
      id = goalId;
      name;
      ticker;
      targetShares;
      currentBalance;
    };

    if (investmentGoals.containsKey(goalId)) {
      Runtime.trap("Investment goal already exists");
    };

    switch (userInvestmentGoals.get(caller)) {
      case (null) {
        let goalSet = Set.empty<Text>();
        goalSet.add(goalId);
        userInvestmentGoals.add(caller, goalSet);
      };
      case (?goalSet) {
        if (goalSet.contains(goalId)) {
          Runtime.trap("Investment goal already exists for user");
        };
        goalSet.add(goalId);
      };
    };

    investmentGoals.add(goalId, investmentGoal);
    goalId;
  };

  public shared ({ caller }) func updateInvestmentGoal(
    goalId : Text,
    newName : Text,
    newTicker : Text,
    newTargetShares : Nat,
    newCurrentBalance : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update investment goals");
    };

    switch (userInvestmentGoals.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Investment goal does not belong to user") };
      case (?goalSet) {
        if (not goalSet.contains(goalId)) {
          Runtime.trap("Unauthorized: Investment goal does not belong to user");
        };
      };
    };

    switch (investmentGoals.get(goalId)) {
      case (null) { Runtime.trap("Investment goal not found") };
      case (?goal) {
        let updatedGoal : InvestmentGoal = {
          id = goalId;
          name = newName;
          ticker = newTicker;
          targetShares = newTargetShares;
          currentBalance = newCurrentBalance;
        };
        investmentGoals.add(goalId, updatedGoal);
      };
    };
  };

  public shared ({ caller }) func deleteInvestmentGoal(goalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete investment goals");
    };

    switch (userInvestmentGoals.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Investment goal does not belong to user") };
      case (?goalSet) {
        if (not goalSet.contains(goalId)) {
          Runtime.trap("Unauthorized: Investment goal does not belong to user");
        };
        goalSet.remove(goalId);
        investmentGoals.remove(goalId);
      };
    };
  };

  public query ({ caller }) func getInvestmentGoals() : async [InvestmentGoal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view investment goals");
    };

    switch (userInvestmentGoals.get(caller)) {
      case (null) { [] };
      case (?goalSet) {
        let goalIds = goalSet.toArray();
        goalIds.map<Text, InvestmentGoal>(
          func(id) {
            switch (investmentGoals.get(id)) {
              case (null) { Runtime.trap("Investment goal not found") };
              case (?goal) { goal };
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getInvestmentGoal(goalId : Text) : async ?InvestmentGoal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view investment goals");
    };

    if (goalId == "") {
      Runtime.trap("Goal id required");
    };

    switch (userInvestmentGoals.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Investment goal does not belong to user") };
      case (?goalSet) {
        if (not goalSet.contains(goalId)) {
          Runtime.trap("Unauthorized: Investment goal does not belong to user");
        };
      };
    };

    investmentGoals.get(goalId);
  };
};
