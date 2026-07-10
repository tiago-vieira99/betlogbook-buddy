export interface Prediction {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  betType: string;
  url: string | null;
  confidence: number;
}
