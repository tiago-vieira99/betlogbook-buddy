export interface MarketData {
  currentStreak: number;
  matchesPlayed: number;
  totalGreens: number;
  negativeSequence: number[];
}

export interface StreakTeam {
  name: string;
  teamID: number;
  position: number;
  [market: string]: string | number | MarketData;
}

export interface StreaksResponse {
  teams: StreakTeam[];
}
