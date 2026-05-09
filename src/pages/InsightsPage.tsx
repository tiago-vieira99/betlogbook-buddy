import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUpcomingMatches } from "@/services/insightsApi";
import { UpcomingMatch } from "@/types/insights";
import { ArrowLeft, Loader2, Search, Trophy, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NavButtons } from "@/components/NavButtons";
import { toast } from "sonner";

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

// ── Page ──────────────────────────────────────────────────────────────────────

const InsightsPage = () => {
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingMatches()
      .then(setMatches)
      .catch((err) => {
        console.error(err);
        setError("Failed to load upcoming matches. Please try again.");
        toast.error("Failed to load insights data");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return matches;
    return matches.filter(m =>
      m.homeTeam.toLowerCase().includes(q) ||
      m.awayTeam.toLowerCase().includes(q) ||
      m.competition.toLowerCase().includes(q)
    );
  }, [matches, search]);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Insights</h1>
            <p className="text-xs text-muted-foreground">Upcoming matches</p>
          </div>
          {!loading && !error && (
            <Badge variant="secondary" className="shrink-0">
              <CalendarDays className="w-3 h-3 mr-1" />
              {filteredMatches.length} match{filteredMatches.length !== 1 ? "es" : ""}
            </Badge>
          )}
          <NavButtons />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading upcoming matches…</p>
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-12">{error}</p>
        ) : matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No upcoming matches found.</p>
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

            {grouped.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No matches match your search.</p>
            ) : (
              <div className="space-y-6">
                {grouped.map(({ competition, matches: compMatches }) => (
                  <div key={competition} className="rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
                      <Trophy className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-semibold text-sm text-foreground flex-1">{competition}</span>
                      <Badge variant="secondary" className="text-xs">
                        {compMatches.length} match{compMatches.length !== 1 ? "es" : ""}
                      </Badge>
                    </div>

                    <div className="divide-y divide-border">
                      {compMatches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center gap-4 px-4 py-3"
                        >
                          <div className="w-24 shrink-0">
                            <span className="text-xs font-medium text-muted-foreground">
                              {formatMatchDate(match.matchDate)}
                            </span>
                          </div>

                          <div className="flex-1 flex items-center justify-end">
                            <span className="text-sm font-semibold text-foreground">
                              {match.homeTeam}
                            </span>
                          </div>

                          <div className="shrink-0 w-8 text-center">
                            <span className="text-xs text-muted-foreground font-medium">vs</span>
                          </div>

                          <div className="flex-1 flex items-center">
                            <span className="text-sm font-semibold text-foreground">
                              {match.awayTeam}
                            </span>
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
      </main>
    </div>
  );
};

export default InsightsPage;
