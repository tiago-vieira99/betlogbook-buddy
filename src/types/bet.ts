export type BetResult = "win" | "loss" | "pending";
export type BetSport = "football" | "basketball" | "tennis" | "baseball" | "hockey" | "mma" | "other";

export interface Bet {
  id: string;
  event: string;
  sport: BetSport;
  pick: string;
  odds: number;
  stake: number;
  result: BetResult;
  date: string;
  notes?: string;
}

export const SPORT_LABELS: Record<BetSport, string> = {
  football: "⚽ Football",
  basketball: "🏀 Basketball",
  tennis: "🎾 Tennis",
  baseball: "⚾ Baseball",
  hockey: "🏒 Hockey",
  mma: "🥊 MMA",
  other: "🎯 Other",
};
