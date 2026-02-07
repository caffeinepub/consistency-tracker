// Local type definitions for Investment features
// These mirror the backend Motoko types but are defined here
// because the backend interface generation doesn't export them yet

export interface InvestmentGoal {
  id: bigint;
  asset: string;
  targetAmount: bigint;
  deadline: bigint;
  linkedEntries: bigint[];
}
