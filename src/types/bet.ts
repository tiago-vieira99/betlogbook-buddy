export type BetResult = "win" | "loss" | "pending";

export interface Bet {
  id: string;
  odds: number;
  stake: number;
  result: BetResult;
  date: string;
  comment?: string;
}

export interface Bankroll {
  id: string;
  name: string;
  initialAmount: number;
  createdAt: string;
}
