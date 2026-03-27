import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUpcomingMatches } from "@/services/insightsApi";
import { fetchStreaks } from "@/services/streakApi";
import { UpcomingMatch } from "@/types/insights";
import { StreakTeam, MarketData } from "@/types/streak";
import { ArrowLeft, Loader2, Search, Trophy, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Alert helpers (same logic as StreaksPage) ─────────────────────────────────

function getMarketData(team: StreakTeam, market: string): MarketData | null {
  const data = team[market];
  if (data && typeof data === "object" && "currentNegStreak" in data) {
    return data as MarketData;
  }
  return null;
}

function getMaxNegSeq(md: MarketData): number {
  return Math.max(...md.currentSeasonSequence.filter(n => n >= 0), 0);
}

function isAlerted(md: MarketData): boolean {
  return md.currentNegStreak >= getMaxNegSeq(md) && md.currentNegStreak > 0;
}

function getAlertCount(team: StreakTeam, markets: string[]): number {
  return markets.filter(m => {
    const md = getMarketData(team, m);
    return md && isAlerted(md);
  }).length;
}

// Flexible team name matching to handle slight name differences across APIs
// e.g. "Moreirense FC" vs "Moreirense", "SL Benfica" vs "Benfica"
function namesMatch(matchName: string, streakName: string): boolean {
  const a = matchName.toLowerCase().trim();
  const b = streakName.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function parseMatchDate(d: string): number {
  const [day, month, year] = d.split("/").map(Number);
  if ([day, month, year].some(isNaN)) return 0;
  return new Date(year, month - 1, day).getTime();
}

function formatMatchDate(d: string): string {
  const [day, month, year] = d.split("/").map(Number);
  if ([day, month, year].some(isNaN)) return d;
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

const InsightsPage = () => {
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [streakTeams, setStreakTeams] = useState<StreakTeam[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchUpcomingMatches(), fetchStreaks()])
      .then(([matchData, streakData]) => {
        setMatches(matchData);

        const teams = streakData.teams;
        setStreakTeams(teams);

        // Discover all markets from streak data
        const knownKeys = new Set(["name", "teamID", "position"]);
        const marketKeys: string[] = [];
        for (const team of teams) {
          for (const key of Object.keys(team)) {
            if (!knownKeys.has(key) && !marketKeys.includes(key)) {
              const val = team[key];
              if (val && typeof val === "object" && "currentNegStreak" in (val as any)) {
                marketKeys.push(key);
              }
            }
          }
        }
        setMarkets(marketKeys);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load insights data");
      })
      .finally(() => setLoading(false));
  }, []);

  // Build a map: streakTeam -> alert count (only teams with alerts)
  const alertingTeams = useMemo(() => {
    return streakTeams
      .map(team => ({ team, count: getAlertCount(team, markets) }))
      .filter(({ count }) => count > 0);
  }, [streakTeams, markets]);

  // For a given match team name, find the matching alerting streak team (if any)
  const findAlertingTeam = (matchTeamName: string) => {
    return alertingTeams.find(({ team }) => namesMatch(matchTeamName, team.name));
  };

  // Filter matches: only those where at least one team has alerts
  // Then apply search on top
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const homeAlert = findAlertingTeam(m.homeTeam);
      const awayAlert = findAlertingTeam(m.awayTeam);
      if (!homeAlert && !awayAlert) return false;

      const q = search.toLowerCase();
      if (!q) return true;
      return (
        m.homeTeam.toLowerCase().includes(q) ||
        m.awayTeam.toLowerCase().includes(q) ||
        m.competition.toLowerCase().includes(q)
      );
    });
  }, [matches, alertingTeams, search]);

  // Group by competition, sort alphabetically, matches sorted by date
  const grouped = useMemo(() => {
    const map: Record<string, UpcomingMatch[]> = {};
    for (const m of filteredMatches) {
      if (!map[m.competition]) map[m.competition] = [];
      map[m.competition].push(m);
    }
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map(competition => ({
        competition,
        matches: [...map[competition]].sort(
          (a, b) => parseMatchDate(a.matchDate) - parseMatchDate(b.matchDate)
        ),
      }));
  }, [filteredMatches]);

  const totalMatches = filteredMatches.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Insights</h1>
            <p className="text-xs text-muted-foreground">Upcoming matches with active streak alerts</p>
          </div>
          {!loading && !error && (
            <Badge variant="secondary" className="shrink-0">
              <CalendarDays className="w-3 h-3 mr-1" />
              {totalMatches} match{totalMatches !== 1 ? "es" : ""}
            </Badge>
          )}
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading matches and streak data…</p>
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-12">{error}</p>
        ) : filteredMatches.length === 0 && !search ? (
          <p className="text-center text-muted-foreground py-12">
            No upcoming matches found with active streak alerts.
          </p>
        ) : (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter by team or competition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {grouped.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No matches match your search.</p>
            ) : (
              <div className="space-y-6">
                {grouped.map(({ competition, matches: compMatches }) => (
                  <div key={competition} className="rounded-lg border border-border overflow-hidden">
                    {/* Competition header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
                      <Trophy className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-semibold text-sm text-foreground flex-1">{competition}</span>
                      <Badge variant="secondary" className="text-xs">
                        {compMatches.length} match{compMatches.length !== 1 ? "es" : ""}
                      </Badge>
                    </div>

                    {/* Match rows */}
                    <div className="divide-y divide-border">
                      {compMatches.map((match) => {
                        const homeAlert = findAlertingTeam(match.homeTeam);
                        const awayAlert = findAlertingTeam(match.awayTeam);

                        return (
                          <div
                            key={match.id}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            {/* Date */}
                            <div className="w-24 shrink-0">
                              <span className="text-xs font-medium text-muted-foreground">
                                {formatMatchDate(match.matchDate)}
                              </span>
                            </div>

                            {/* Home team */}
                            <div className="flex-1 flex items-center justify-end gap-1.5">
                              {homeAlert && (
                                <span title={`${homeAlert.count} alert${homeAlert.count !== 1 ? "s" : ""}`}>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-win shrink-0" />
                                </span>
                              )}
                              <span className={`text-sm font-semibold ${homeAlert ? "text-win" : "text-foreground"}`}>
                                {match.homeTeam}
                              </span>
                              {homeAlert && (
                                <Badge className="bg-win/15 text-win border-0 text-[10px] px-1 py-0 h-4 shrink-0">
                                  {homeAlert.count}
                                </Badge>
                              )}
                            </div>

                            {/* vs divider */}
                            <div className="shrink-0 w-8 text-center">
                              <span className="text-xs text-muted-foreground font-medium">vs</span>
                            </div>

                            {/* Away team */}
                            <div className="flex-1 flex items-center gap-1.5">
                              {awayAlert && (
                                <Badge className="bg-win/15 text-win border-0 text-[10px] px-1 py-0 h-4 shrink-0">
                                  {awayAlert.count}
                                </Badge>
                              )}
                              <span className={`text-sm font-semibold ${awayAlert ? "text-win" : "text-foreground"}`}>
                                {match.awayTeam}
                              </span>
                              {awayAlert && (
                                <span title={`${awayAlert.count} alert${awayAlert.count !== 1 ? "s" : ""}`}>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-win shrink-0" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InsightsPage;
