export interface PredictionTeam {
  name: string;
  country?: string;
}

export interface Prediction {
  id: number;
  date: string;
  homeTeam: PredictionTeam;
  awayTeam: PredictionTeam;
  competition: string;
  country?: string;
  betType: string;
  url: string | null;
  confidence: number;
}
