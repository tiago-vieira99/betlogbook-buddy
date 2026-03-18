export interface Team {
  id: number;
  name: string;
  country: string;
  begin_season: string;
}

export interface Match {
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  htResult: string;
  ftResult: string;
  competition: string;
}
