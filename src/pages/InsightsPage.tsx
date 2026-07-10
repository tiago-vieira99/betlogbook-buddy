import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPredictions } from "@/services/insightsApi";
import { Prediction } from "@/types/insights";
import { ArrowLeft, Loader2, Search, CalendarDays, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NavButtons } from "@/components/NavButtons";
import { toast } from "sonner";

const BET_TYPES = ["BTTS", "Over 2.5", "Under 2.5", "Home Win", "Away Win"];

function parseMatchDate(d: string): number {
  const [day, month, year] = d.split("/").map(Number);
  if ([day, month, year].some(isNaN)) return 0;
  return new Date(year, month - 1, day).getTime();
}

function formatDayLabel(d: string): string {
  const [day, month, year] = d.split("/").map(Number);
  if ([day, month, year].some(isNaN)) return d;
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function todayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

const InsightsPage = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [betType, setBetType] = useState<string>("BTTS");
  const [fromDate, setFromDate] = useState<string>(todayDDMMYYYY());
  const [pendingDate, setPendingDate] = useState<string>(todayDDMMYYYY());
  const navigate = useNavigate();

  const loadPredictions = (type: string, date: string) => {
    setLoading(true);
    setError(null);
    setActiveDay(null);
    fetchPredictions(type, date)
      .then(setPredictions)
      .catch((err) => {
        console.error(err);
        setError("Failed to load predictions. Please try again.");
        toast.error("Failed to load insights data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPredictions(betType, fromDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betType, fromDate]);

  const applyDate = () => {
    if (pendingDate !== fromDate) setFromDate(pendingDate);
    else loadPredictions(betType, pendingDate);
  };


  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return predictions;
    return predictions.filter(m =>
      m.homeTeam.toLowerCase().includes(q) ||
      m.awayTeam.toLowerCase().includes(q) ||
      m.competition.toLowerCase().includes(q)
    );
  }, [predictions, search]);

  const groupedByDay = useMemo(() => {
    const dayMap: Record<string, Record<string, Prediction[]>> = {};
    for (const m of filtered) {
      if (!dayMap[m.date]) dayMap[m.date] = {};
      if (!dayMap[m.date][m.competition]) dayMap[m.date][m.competition] = [];
      dayMap[m.date][m.competition].push(m);
    }
    return Object.keys(dayMap)
      .sort((a, b) => parseMatchDate(a) - parseMatchDate(b))
      .map(date => ({
        date,
        competitions: Object.keys(dayMap[date])
          .sort((a, b) => a.localeCompare(b))
          .map(competition => ({
            competition,
            matches: dayMap[date][competition].sort((a, b) => b.confidence - a.confidence),
          })),
      }));
  }, [filtered]);

  const days = groupedByDay.map(g => g.date);

  useEffect(() => {
    if (days.length > 0 && !activeDay) setActiveDay(days[0]);
  }, [days.length]);

  const selectedGroup = groupedByDay.find(g => g.date === activeDay) ?? groupedByDay[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Insights</h1>
            <p className="text-xs text-muted-foreground">Predictions by bet type</p>
          </div>
          {!loading && !error && (
            <Badge variant="secondary" className="shrink-0">
              <CalendarDays className="w-3 h-3 mr-1" />
              {filtered.length} match{filtered.length !== 1 ? "es" : ""}
            </Badge>
          )}
          <NavButtons />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Bet type + date controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Bet type</label>
            <div className="flex flex-wrap gap-2">
              {BET_TYPES.map(t => (
                <Button
                  key={t}
                  variant={betType === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <div className="sm:w-48">
            <label className="text-xs text-muted-foreground mb-1 block">From date (dd/mm/yyyy)</label>
            <Input
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading predictions…</p>
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-12">{error}</p>
        ) : predictions.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No predictions found.</p>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter by team or competition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {groupedByDay.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No matches match your search.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {days.map(date => (
                    <Button
                      key={date}
                      variant={activeDay === date ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveDay(date)}
                    >
                      {formatDayLabel(date)}
                    </Button>
                  ))}
                </div>

                {selectedGroup && (
                  <div className="space-y-3">
                    {selectedGroup.competitions.map(({ competition, matches }) => (
                      <div key={competition} className="rounded-lg border border-border overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border">
                          <Trophy className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-semibold text-foreground flex-1">{competition}</span>
                          <Badge variant="secondary" className="text-xs">{matches.length}</Badge>
                        </div>
                        <div className="divide-y divide-border">
                          {matches.map((match) => (
                            <div key={match.id} className="flex items-center gap-4 px-4 py-2.5">
                              <div className="flex-1 flex items-center justify-end">
                                <span className="text-sm font-semibold text-foreground">{match.homeTeam}</span>
                              </div>
                              <div className="shrink-0 w-8 text-center">
                                <span className="text-xs text-muted-foreground font-medium">vs</span>
                              </div>
                              <div className="flex-1 flex items-center">
                                <span className="text-sm font-semibold text-foreground">{match.awayTeam}</span>
                              </div>
                              <div className="shrink-0 w-16 text-right">
                                <Badge
                                  variant="secondary"
                                  className="text-xs tabular-nums"
                                  title="Confidence"
                                >
                                  {(match.confidence * 100).toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InsightsPage;
