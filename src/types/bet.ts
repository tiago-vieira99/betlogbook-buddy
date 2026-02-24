export type BetStatus = "WON" | "LOST" | "ONGOING";

export interface Bet {
  id: number;
  bankrollID: number;
  date: string;       // "DD/MM/YYYY"
  odd: number;
  stake: number;
  balance: number;
  status: BetStatus;
  comment: string;
}

export interface Bankroll {
  id: number;
  name: string;
  description: string;
  balance: number;
  numBets: number;
  roi: number;
  progression: number;
  initialValue: number;
  oddAvg: number;
  stakeAvg: number;
  longestGreenSeries: number;
  longestRedSeries: number;
  greensRate: number;
  redsRate: number;
  biggestProfit: number;
  biggestExpense: number;
  biggestOdd: number;
  biggestStake: number;
  biggestGreenOdd: number;
  totalInvested: number;
}
