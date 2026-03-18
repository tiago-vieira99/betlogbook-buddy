export interface Team {
  id: number;
  name: string;
  country: string;
  beginSeason: string;
}

export interface Match {
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  htResult: string;
  ftResult: string;
  competition: string;
}
