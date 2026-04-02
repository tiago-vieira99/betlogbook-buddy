import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUpcomingMatches } from "@/services/insightsApi";
import { fetchStreaks } from "@/services/streakApi";
import { fetchMatches } from "@/services/teamApi";
import { UpcomingMatch } from "@/types/insights";
import { Match } from "@/types/team";
import { StreakTeam, MarketData } from "@/types/streak";
import { ArrowLeft, Loader2, Search, Trophy, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, ArrowLeftRight } from "lucide-react";
import { NavButtons } from "@/components/NavButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Alert helpers ─────────────────────────────────────────────────────────────

function getMarketData(team: StreakTeam, market: string): MarketData | null {
  const data = team[market];
  if (data && typeof data === "object" && "currentNegStreak" in data) return data as MarketData;
  return null;
}

function getMaxNegSeq(md: MarketData): number {
  return Math.max(...md.currentSeasonSequence.filter(n => n >= 0), 0);
}

function isAlerted(md: MarketData): boolean {
  return md.currentNegStreak >= getMaxNegSeq(md) && md.currentNegStreak > 0;
}

function getAlertCount(team: StreakTeam, markets: string[]): number {
  return markets.filter(m => { const md = getMarketData(team, m); return md && isAlerted(md); }).length;
}

function namesMatch(matchName: string, streakName: string): boolean {
  return matchName.trim().toLowerCase() === streakName.trim().toLowerCase();
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
    weekday: "short", day: "numeric", month: "short",
  });
}

// ── Match result helper ───────────────────────────────────────────────────────

function getMatchResult(match: Match, teamName: string): "win" | "loss" | "draw" | null {
  if (!match.ftResult || match.ftResult === "null") return null;
  const parts = match.ftResult.split(/[-:]/).map(s => parseInt(s.trim(), 10));
  if (parts.length !== 2 || parts.some(isNaN)) return null;
  const [home, away] = parts;
  if (home === away) return "draw";
  const isHome = match.homeTeam.trim().toLowerCase() === teamName.trim().toLowerCase();
  const isAway = match.awayTeam.trim().toLowerCase() === teamName.trim().toLowerCase();
  if (!isHome && !isAway) return null;
  return (isHome && home > away) || (isAway && away > home) ? "win" : "loss";
}

// ── Team history panel ────────────────────────────────────────────────────────

type HistoryEntry = { loading: boolean; matches: Match[]; error: boolean };

function TeamHistoryPanel({ teamName, history }: { teamName: string; history: HistoryEntry | undefined }) {
  if (!history || history.loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (history.error) return <p className="text-xs text-muted-foreground py-4">Failed to load matches.</p>;
  if (history.matches.length === 0) return <p className="text-xs text-muted-foreground py-4">No recent matches found.</p>;

  return (
    <div className="space-y-0.5">
      {history.matches.map((m, i) => {
        const result = getMatchResult(m, teamName);
        const isHome = m.homeTeam.trim().toLowerCase() === teamName.trim().toLowerCase();
        const opponent = isHome ? m.awayTeam : m.homeTeam;
        const resultColor = result === "win" ? "text-win" : result === "loss" ? "text-loss" : result === "draw" ? "text-ongoing" : "text-muted-foreground";
        const resultLabel = result === "win" ? "W" : result === "loss" ? "L" : result === "draw" ? "D" : "?";
        return (
          <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-border/50 last:border-0">
            <span className="text-muted-foreground w-16 shrink-0">{m.matchDate}</span>
            <span className="flex-1 truncate text-foreground">
              <span className={isHome ? "font-semibold" : ""}>{m.homeTeam}</span>
              <span className="text-muted-foreground mx-1">vs</span>
              <span className={!isHome ? "font-semibold" : ""}>{m.awayTeam}</span>
            </span>
            <span className="font-mono text-muted-foreground shrink-0 text-right whitespace-nowrap">
              {m.htResult !== "null" ? (
                <span className="opacity-60 mr-1">({m.htResult})</span>
              ) : null}
              {m.ftResult !== "null" ? m.ftResult : "—"}
            </span>
            <span className={`font-bold w-4 text-center shrink-0 ${resultColor}`}>{resultLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const InsightsPage = () => {
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [streakTeams, setStreakTeams] = useState<StreakTeam[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const [historyCache, setHistoryCache] = useState<Record<string, HistoryEntry>>({});
  const fetchingRef = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchUpcomingMatches(), fetchStreaks()])
      .then(([matchData, streakData]) => {
        setMatches(matchData);
        const teams = streakData.teams;
        setStreakTeams(teams);
        const knownKeys = new Set(["name", "teamID", "position"]);
        const marketKeys: string[] = [];
        for (const team of teams) {
          for (const key of Object.keys(team)) {
            if (!knownKeys.has(key) && !marketKeys.includes(key)) {
              const val = team[key];
              if (val && typeof val === "object" && "currentNegStreak" in (val as any)) marketKeys.push(key);
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

  const alertingTeams = useMemo(() => {
    return streakTeams
      .map(team => ({ team, count: getAlertCount(team, markets) }))
      .filter(({ count }) => count > 0);
  }, [streakTeams, markets]);

  const findAlertingTeam = (name: string) =>
    alertingTeams.find(({ team }) => namesMatch(name, team.name));

  // Matches that have at least one alerting team
  const alertedMatches = useMemo(() => {
    return matches.filter(m => findAlertingTeam(m.homeTeam) || findAlertingTeam(m.awayTeam));
  }, [matches, alertingTeams]);

  // Available days sorted by date
  const availableDays = useMemo(() => {
    const daySet = new Set(alertedMatches.map(m => m.matchDate));
    return [...daySet].sort((a, b) => parseMatchDate(a) - parseMatchDate(b));
  }, [alertedMatches]);

  // Auto-select earliest day
  const activeDay = selectedDay && availableDays.includes(selectedDay)
    ? selectedDay
    : availableDays[0] ?? null;

  const filteredMatches = useMemo(() => {
    return alertedMatches.filter(m => {
      if (activeDay && m.matchDate !== activeDay) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        m.homeTeam.toLowerCase().includes(q) ||
        m.awayTeam.toLowerCase().includes(q) ||
        m.competition.toLowerCase().includes(q)
      );
    });
  }, [alertedMatches, activeDay, search]);

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
        matches: [...map[competition]].sort((a, b) => parseMatchDate(a.matchDate) - parseMatchDate(b.matchDate)),
      }));
  }, [filteredMatches]);

  async function loadHistory(teamName: string, season: string) {
    if (historyCache[teamName] || fetchingRef.current.has(teamName)) return;
    fetchingRef.current.add(teamName);
    setHistoryCache(prev => ({ ...prev, [teamName]: { loading: true, matches: [], error: false } }));
    try {
      const all = await fetchMatches(teamName, season);
      const recent = [...all]
        .filter(m => m.ftResult && m.ftResult !== "null")
        .sort((a, b) => parseMatchDate(b.matchDate) - parseMatchDate(a.matchDate))
        .slice(0, 10);
      setHistoryCache(prev => ({ ...prev, [teamName]: { loading: false, matches: recent, error: false } }));
    } catch {
      setHistoryCache(prev => ({ ...prev, [teamName]: { loading: false, matches: [], error: true } }));
    } finally {
      fetchingRef.current.delete(teamName);
    }
  }

  function handleExpandMatch(match: UpcomingMatch) {
    const isOpening = expandedMatchId !== match.id;
    setExpandedMatchId(isOpening ? match.id : null);
    if (isOpening) {
      loadHistory(match.homeTeam, match.season);
      loadHistory(match.awayTeam, match.season);
    }
  }

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
          <NavButtons />
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
            {/* Day filter buttons */}
            {availableDays.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {availableDays.map(day => (
                  <Button
                    key={day}
                    variant={activeDay === day ? "default" : "outline"}
                    size="sm"
                    className="shrink-0"
                    onClick={() => setSelectedDay(day)}
                  >
                    {formatMatchDate(day)}
                  </Button>
                ))}
              </div>
            )}

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
                        const isExpanded = expandedMatchId === match.id;

                        return (
                          <div key={match.id}>
                            {/* Clickable match row */}
                            <button
                              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                              onClick={() => handleExpandMatch(match)}
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
                                  <CheckCircle2 className="w-3.5 h-3.5 text-win shrink-0" />
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

                              {/* vs */}
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
                                  <CheckCircle2 className="w-3.5 h-3.5 text-win shrink-0" />
                                )}
                              </div>

                              {/* Expand chevron */}
                              <div className="shrink-0 text-muted-foreground">
                                {isExpanded
                                  ? <ChevronUp className="w-4 h-4" />
                                  : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>

                            {/* Expanded: history + compare button */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-3 border-t border-border bg-muted/10 space-y-4">
                                {/* History grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {[match.homeTeam, match.awayTeam].map(teamName => (
                                    <div key={teamName}>
                                      <p className="text-xs font-semibold text-foreground mb-2 truncate">
                                        {teamName}
                                        <span className="ml-1 font-normal text-muted-foreground">— last 10 matches</span>
                                      </p>
                                      <TeamHistoryPanel
                                        teamName={teamName}
                                        history={historyCache[teamName]}
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* Compare in Streaks button */}
                                <div className="flex justify-center pt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const params = new URLSearchParams({
                                        mode: "compare",
                                        team1: match.homeTeam,
                                        team2: match.awayTeam,
                                      });
                                      window.open(`/streaks?${params}`, "_blank");
                                    }}
                                  >
                                    <ArrowLeftRight className="w-4 h-4" />
                                    Compare in Streaks
                                  </Button>
                                </div>
                              </div>
                            )}
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
