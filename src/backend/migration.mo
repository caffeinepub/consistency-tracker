import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type OldHabit = {
    id : Text;
    name : Text;
    createdAt : Int;
    weeklyTarget : Nat;
  };

  type NewHabit = {
    id : Text;
    name : Text;
    createdAt : Int;
    weeklyTarget : Nat;
    unit : {
      #reps;
      #time;
      #custom : Text;
    };
  };

  type OldHabitRecord = {
    habitId : Text;
    habitName : Text;
    day : Nat;
    month : Nat;
    year : Nat;
    completedAt : ?Int;
  };

  type NewHabitRecord = {
    habitId : Text;
    habitName : Text;
    day : Nat;
    month : Nat;
    year : Nat;
    completedAt : ?Int;
    amount : ?Nat;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, OldHabit>;
    habitRecords : Map.Map<Text, List.List<OldHabitRecord>>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userHabits : Map.Map<Principal, Set.Set<Text>>;
    habits : Map.Map<Text, NewHabit>;
    habitRecords : Map.Map<Text, List.List<NewHabitRecord>>;
  };

  public func run(old : OldActor) : NewActor {
    let newHabits = old.habits.map<Text, OldHabit, NewHabit>(
      func(_id, oldHabit) {
        {
          oldHabit with unit = #reps; // Default to 'reps' for existing habits
        };
      }
    );

    let newHabitRecords = old.habitRecords.map<Text, List.List<OldHabitRecord>, List.List<NewHabitRecord>>(
      func(_id, oldRecordList) {
        oldRecordList.map<OldHabitRecord, NewHabitRecord>(
          func(oldRecord) {
            {
              oldRecord with amount = null; // Default amount to null
            };
          }
        );
      }
    );

    {
      old with
      habits = newHabits;
      habitRecords = newHabitRecords;
    };
  };
};
