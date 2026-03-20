export interface MarketData {
  currentNegStreak: number;
  matchesPlayed: number;
  totalGreens: number;
  currentSeasonSequence: number[];
}

export interface RawTeamData {
  teamID: number;
  position: number;
  [market: string]: number | MarketData;
}

export interface StreakTeam {
  name: string;
  teamID: number;
  position: number;
  [market: string]: string | number | MarketData;
}

// API returns { "TeamName": { teamID, position, wins: {...}, noWins: {...}, ... } }
export type StreaksApiResponse = Record<string, RawTeamData>;
