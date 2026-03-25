import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStreaks } from "@/services/streakApi";
import { StreakTeam, MarketData } from "@/types/streak";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, ArrowUpDown, ChevronDown, ChevronUp, ArrowLeftRight, X, CheckCircle2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Mode = "normal" | "compare" | "alerts";
type SortKey = "name" | "position" | "currentNegStreak" | "matchesPlayed" | "currentSeasonSequence" | "totalGreens" | "successRate";
type SortDir = "asc" | "desc";

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

function getSuccessRate(md: MarketData): number {
  if (md.matchesPlayed === 0) return 0;
  return (md.totalGreens / md.matchesPlayed) * 100;
}

function isHighlighted(md: MarketData): boolean {
  return md.currentNegStreak >= getMaxNegSeq(md) && md.currentNegStreak > 0;
}

function formatcurrentSeasonSequence(seq: number[]): string {
  return seq.filter(n => n >= 0).join(", ");
}

function formatMarketLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

// ── Team search input with autocomplete dropdown ──────────────────────────────

function TeamSearchInput({
  teams,
  selected,
  onSelect,
  placeholder,
  label,
}: {
  teams: StreakTeam[];
  selected: StreakTeam | null;
  onSelect: (team: StreakTeam | null) => void;
  placeholder: string;
  label: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => teams.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
    [teams, query]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</p>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={selected ? selected.name : query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) onSelect(null);
            setOpen(true);
          }}
          onFocus={() => { if (!selected) setOpen(true); }}
          className={selected ? "border-primary" : ""}
        />
        {selected && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { onSelect(null); setQuery(""); }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && !selected && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-52 overflow-y-auto">
          {filtered.map(team => (
            <button
              key={team.name}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(team);
                setQuery("");
                setOpen(false);
              }}
            >
              <span className="font-medium">{team.name}</span>
              <span className="text-xs text-muted-foreground">#{team.position}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Alert team expanded detail ─────────────────────────────────────────────────

function AlertTeamDetail({ team, alertingMarkets }: { team: StreakTeam; alertingMarkets: string[] }) {
  return (
    <div className="px-4 pb-4 pt-1">
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Market</TableHead>
              <TableHead className="text-center">Streak</TableHead>
              <TableHead className="text-center">Max</TableHead>
              <TableHead className="text-center min-w-[120px]">Season Seq</TableHead>
              <TableHead className="text-center">Success %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertingMarkets.map(market => {
              const md = getMarketData(team, market)!;
              return (
                <TableRow key={market} className="bg-win/5">
                  <TableCell className="font-medium text-sm">{formatMarketLabel(market)}</TableCell>
                  <TableCell className="text-center font-semibold text-win">{md.currentNegStreak}</TableCell>
                  <TableCell className="text-center text-win">{getMaxNegSeq(md)}</TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {formatcurrentSeasonSequence(md.currentSeasonSequence)}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {getSuccessRate(md).toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const StreaksPage = () => {
  const [teams, setTeams] = useState<StreakTeam[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("successRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showAll, setShowAll] = useState(false);

  const [mode, setMode] = useState<Mode>("normal");
  const [team1, setTeam1] = useState<StreakTeam | null>(null);
  const [team2, setTeam2] = useState<StreakTeam | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const navigate = useNavigate();

  const switchMode = (next: Mode) => {
    setMode(prev => prev === next ? "normal" : next);
    setTeam1(null);
    setTeam2(null);
    setExpandedTeam(null);
  };

  useEffect(() => {
    fetchStreaks()
      .then((data) => {
        setTeams(data.teams);
        const knownKeys = new Set(["name", "teamID", "position"]);
        const marketKeys: string[] = [];
        for (const team of data.teams) {
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
        if (marketKeys.length > 0) setSelectedMarket(marketKeys[0]);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load streaks");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setShowAll(false);
  }, [selectedMarket]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortedTeams = useMemo(() => {
    if (!selectedMarket) return teams;
    const filtered = teams.filter(t => getMarketData(t, selectedMarket) !== null);
    return [...filtered].sort((a, b) => {
      const mdA = getMarketData(a, selectedMarket);
      const mdB = getMarketData(b, selectedMarket);
      if (!mdA || !mdB) return 0;
      let cmp = 0;
      switch (sortKey) {
        case "name":                  cmp = a.name.localeCompare(b.name); break;
        case "position":              cmp = a.position - b.position; break;
        case "currentNegStreak":      cmp = mdA.currentNegStreak - mdB.currentNegStreak; break;
        case "matchesPlayed":         cmp = mdA.matchesPlayed - mdB.matchesPlayed; break;
        case "currentSeasonSequence": cmp = getMaxNegSeq(mdA) - getMaxNegSeq(mdB); break;
        case "totalGreens":           cmp = mdA.totalGreens - mdB.totalGreens; break;
        case "successRate":           cmp = getSuccessRate(mdA) - getSuccessRate(mdB); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [teams, selectedMarket, sortKey, sortDir]);

  const { highlighted, rest } = useMemo(() => {
    const h: typeof sortedTeams = [];
    const r: typeof sortedTeams = [];
    for (const team of sortedTeams) {
      const md = getMarketData(team, selectedMarket);
      if (md && isHighlighted(md)) h.push(team);
      else r.push(team);
    }
    return { highlighted: h, rest: r };
  }, [sortedTeams, selectedMarket]);

  // compare: markets sorted — both alert first, then one, then neither
  const comparedMarkets = useMemo(() => {
    if (mode !== "compare" || (!team1 && !team2)) return markets;
    return [...markets].sort((a, b) => {
      const h1a = team1 ? (getMarketData(team1, a) ? isHighlighted(getMarketData(team1, a)!) : false) : false;
      const h2a = team2 ? (getMarketData(team2, a) ? isHighlighted(getMarketData(team2, a)!) : false) : false;
      const h1b = team1 ? (getMarketData(team1, b) ? isHighlighted(getMarketData(team1, b)!) : false) : false;
      const h2b = team2 ? (getMarketData(team2, b) ? isHighlighted(getMarketData(team2, b)!) : false) : false;
      return ((h1b ? 1 : 0) + (h2b ? 1 : 0)) - ((h1a ? 1 : 0) + (h2a ? 1 : 0));
    });
  }, [mode, team1, team2, markets]);

  const team1AlertCount = useMemo(
    () => team1 ? markets.filter(m => { const md = getMarketData(team1, m); return md && isHighlighted(md); }).length : 0,
    [team1, markets]
  );
  const team2AlertCount = useMemo(
    () => team2 ? markets.filter(m => { const md = getMarketData(team2, m); return md && isHighlighted(md); }).length : 0,
    [team2, markets]
  );

  // alerts: all teams that have at least 1 alerting market
  const alertTeams = useMemo(() => {
    return teams
      .map(team => {
        const alertingMarkets = markets.filter(m => {
          const md = getMarketData(team, m);
          return md && isHighlighted(md);
        });
        return { team, alertingMarkets, count: alertingMarkets.length };
      })
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);
  }, [teams, markets]);

  const SortableHead = ({ label, sortKeyValue }: { label: string; sortKeyValue: SortKey }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => handleSort(sortKeyValue)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === sortKeyValue ? "text-primary" : "text-muted-foreground/50"}`} />
      </span>
    </TableHead>
  );

  const renderRow = (team: StreakTeam) => {
    const md = getMarketData(team, selectedMarket);
    if (!md) return null;
    const rate = getSuccessRate(md);
    return (
      <TableRow key={team.name}>
        <TableCell className="font-medium">{team.name}</TableCell>
        <TableCell>{team.position}</TableCell>
        <TableCell className="font-semibold">{md.currentNegStreak}</TableCell>
        <TableCell>{md.matchesPlayed}</TableCell>
        <TableCell className="font-mono text-xs">{formatcurrentSeasonSequence(md.currentSeasonSequence)}</TableCell>
        <TableCell>{md.totalGreens}</TableCell>
        <TableCell className="font-semibold">{rate.toFixed(1)}%</TableCell>
      </TableRow>
    );
  };

  const tableHeader = (
    <TableHeader>
      <TableRow>
        <SortableHead label="Team" sortKeyValue="name" />
        <SortableHead label="Position" sortKeyValue="position" />
        <SortableHead label="Current Neg Streak" sortKeyValue="currentNegStreak" />
        <SortableHead label="Matches Played" sortKeyValue="matchesPlayed" />
        <SortableHead label="Season Neg Sequence" sortKeyValue="currentSeasonSequence" />
        <SortableHead label="Total Greens" sortKeyValue="totalGreens" />
        <SortableHead label="Success Rate" sortKeyValue="successRate" />
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Streaks</h1>
            <p className="text-xs text-muted-foreground">View team streaks across different markets</p>
          </div>
          {!loading && markets.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={mode === "alerts" ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => switchMode("alerts")}
              >
                <Bell className="w-4 h-4" />
                Alerts
                {mode !== "alerts" && alertTeams.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px]">
                    {alertTeams.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={mode === "compare" ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => switchMode("compare")}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Compare
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : markets.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No streak data found.</p>

        ) : mode === "alerts" ? (
          // ── Alerts mode ──────────────────────────────────────────────────────
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {alertTeams.length === 0
                  ? "No teams have active alerts."
                  : `${alertTeams.length} team${alertTeams.length !== 1 ? "s" : ""} with active streak alerts across all markets.`}
              </p>
            </div>

            {alertTeams.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No active alerts found.</p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                {alertTeams.map(({ team, alertingMarkets, count }, idx) => {
                  const isExpanded = expandedTeam === team.name;
                  const isLast = idx === alertTeams.length - 1;
                  return (
                    <div key={team.name} className={!isLast ? "border-b border-border" : undefined}>
                      {/* Team row */}
                      <button
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                        onClick={() => setExpandedTeam(prev => prev === team.name ? null : team.name)}
                      >
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                          <span className="font-semibold text-foreground truncate">{team.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">#{team.position}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className="bg-win text-primary-foreground gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {count} alert{count !== 1 ? "s" : ""}
                          </Badge>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <AlertTeamDetail team={team} alertingMarkets={alertingMarkets} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        ) : mode === "compare" ? (
          // ── Compare mode ─────────────────────────────────────────────────────
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Search and select two teams to compare their streak alerts side by side.
              </p>
              <div className="flex gap-4 flex-col sm:flex-row">
                <TeamSearchInput teams={teams} selected={team1} onSelect={setTeam1} placeholder="Search team 1..." label="Team 1" />
                <div className="hidden sm:flex items-end pb-2 text-muted-foreground">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <TeamSearchInput teams={teams} selected={team2} onSelect={setTeam2} placeholder="Search team 2..." label="Team 2" />
              </div>

              {(team1 || team2) && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {team1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{team1.name}</span>
                      <Badge variant={team1AlertCount > 0 ? "default" : "secondary"} className={team1AlertCount > 0 ? "bg-win" : ""}>
                        {team1AlertCount} alert{team1AlertCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                  {team1 && team2 && <span className="text-muted-foreground text-sm">vs</span>}
                  {team2 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{team2.name}</span>
                      <Badge variant={team2AlertCount > 0 ? "default" : "secondary"} className={team2AlertCount > 0 ? "bg-win" : ""}>
                        {team2AlertCount} alert{team2AlertCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(team1 || team2) ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Market</TableHead>
                      {team1 && (
                        <>
                          <TableHead className="text-center min-w-[80px]">
                            <span className="block text-xs font-semibold text-foreground truncate max-w-[100px]">{team1.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Streak</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[60px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Max</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[120px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Season Seq</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[70px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Success %</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[50px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Alert</span>
                          </TableHead>
                        </>
                      )}
                      {team2 && (
                        <>
                          <TableHead className="text-center min-w-[80px]">
                            <span className="block text-xs font-semibold text-foreground truncate max-w-[100px]">{team2.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Streak</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[60px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Max</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[120px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Season Seq</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[70px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Success %</span>
                          </TableHead>
                          <TableHead className="text-center min-w-[50px]">
                            <span className="text-[10px] text-muted-foreground font-normal">Alert</span>
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparedMarkets.map(market => {
                      const md1 = team1 ? getMarketData(team1, market) : null;
                      const md2 = team2 ? getMarketData(team2, market) : null;
                      const h1 = md1 ? isHighlighted(md1) : false;
                      const h2 = md2 ? isHighlighted(md2) : false;
                      const anyAlert = h1 || h2;
                      return (
                        <TableRow key={market} className={anyAlert ? "bg-win/5" : undefined}>
                          <TableCell className="font-medium text-sm">{formatMarketLabel(market)}</TableCell>
                          {team1 && (
                            <>
                              <TableCell className={`text-center font-semibold ${h1 ? "text-win" : "text-muted-foreground"}`}>{md1 ? md1.currentNegStreak : "—"}</TableCell>
                              <TableCell className={`text-center text-sm ${h1 ? "text-win" : "text-muted-foreground"}`}>{md1 ? getMaxNegSeq(md1) : "—"}</TableCell>
                              <TableCell className="text-center font-mono text-xs text-muted-foreground">{md1 ? formatcurrentSeasonSequence(md1.currentSeasonSequence) : "—"}</TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">{md1 ? `${getSuccessRate(md1).toFixed(1)}%` : "—"}</TableCell>
                              <TableCell className="text-center">{h1 ? <CheckCircle2 className="w-4 h-4 text-win mx-auto" /> : <span className="text-muted-foreground/40 text-xs">—</span>}</TableCell>
                            </>
                          )}
                          {team2 && (
                            <>
                              <TableCell className={`text-center font-semibold ${h2 ? "text-win" : "text-muted-foreground"}`}>{md2 ? md2.currentNegStreak : "—"}</TableCell>
                              <TableCell className={`text-center text-sm ${h2 ? "text-win" : "text-muted-foreground"}`}>{md2 ? getMaxNegSeq(md2) : "—"}</TableCell>
                              <TableCell className="text-center font-mono text-xs text-muted-foreground">{md2 ? formatcurrentSeasonSequence(md2.currentSeasonSequence) : "—"}</TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">{md2 ? `${getSuccessRate(md2).toFixed(1)}%` : "—"}</TableCell>
                              <TableCell className="text-center">{h2 ? <CheckCircle2 className="w-4 h-4 text-win mx-auto" /> : <span className="text-muted-foreground/40 text-xs">—</span>}</TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">Select at least one team above to see the comparison.</p>
            )}
          </div>

        ) : (
          // ── Normal mode ───────────────────────────────────────────────────────
          <>
            <Tabs value={selectedMarket} onValueChange={setSelectedMarket}>
              <TabsList className="flex-wrap h-auto gap-1">
                {markets.map((m) => (
                  <TabsTrigger key={m} value={m} className="capitalize">
                    {formatMarketLabel(m)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Table>
              {tableHeader}
              <TableBody>
                {highlighted.map(renderRow)}
                {showAll && rest.map(renderRow)}
              </TableBody>
            </Table>

            {rest.length > 0 && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(prev => !prev)}
                  className="gap-2 text-muted-foreground"
                >
                  {showAll ? (
                    <>Hide {rest.length} teams <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show all {rest.length} other teams <ChevronDown className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StreaksPage;
