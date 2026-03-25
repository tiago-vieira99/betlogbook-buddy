export interface UpcomingMatch {
  id: number;
  teamId: number | null;
  created_date: string;
  updated_date: string;
  homeTeam: string;
  awayTeam: string;
  season: string;
  matchDate: string;
  ftResult: string;
  htResult: string;
  competition: string;
  sport: string;
}
