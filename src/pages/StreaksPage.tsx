import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStreaks } from "@/services/streakApi";
import { StreakTeam, MarketData } from "@/types/streak";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SortKey = "name" | "position" | "currentStreak" | "matchesPlayed" | "negativeSequence" | "totalGreens";
type SortDir = "asc" | "desc";

function getMarketData(team: StreakTeam, market: string): MarketData | null {
  const data = team[market];
  if (data && typeof data === "object" && "currentStreak" in data) {
    return data as MarketData;
  }
  return null;
}

function formatNegativeSequence(seq: number[]): string {
  return seq.filter(n => n >= 0).join(", ");
}

const StreaksPage = () => {
  const [teams, setTeams] = useState<StreakTeam[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("currentStreak");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStreaks()
      .then((data) => {
        setTeams(data.teams);
        // Discover available markets from the first team that has data
        const knownKeys = new Set(["name", "teamID", "position"]);
        const marketKeys: string[] = [];
        for (const team of data.teams) {
          for (const key of Object.keys(team)) {
            if (!knownKeys.has(key) && !marketKeys.includes(key)) {
              const val = team[key];
              if (val && typeof val === "object" && "currentStreak" in (val as any)) {
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
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "position":
          cmp = a.position - b.position;
          break;
        case "currentStreak":
          cmp = mdA.currentStreak - mdB.currentStreak;
          break;
        case "matchesPlayed":
          cmp = mdA.matchesPlayed - mdB.matchesPlayed;
          break;
        case "negativeSequence": {
          const maxA = Math.max(...mdA.negativeSequence.filter(n => n >= 0), 0);
          const maxB = Math.max(...mdB.negativeSequence.filter(n => n >= 0), 0);
          cmp = maxA - maxB;
          break;
        }
        case "totalGreens":
          cmp = mdA.totalGreens - mdB.totalGreens;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [teams, selectedMarket, sortKey, sortDir]);

  const formatMarketLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  };

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Streaks</h1>
            <p className="text-xs text-muted-foreground">View team streaks across different markets</p>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : markets.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No streak data found.</p>
        ) : (
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
              <TableHeader>
                <TableRow>
                  <SortableHead label="Team" sortKeyValue="name" />
                  <SortableHead label="Position" sortKeyValue="position" />
                  <SortableHead label="Current Streak" sortKeyValue="currentStreak" />
                  <SortableHead label="Matches Played" sortKeyValue="matchesPlayed" />
                  <SortableHead label="Neg. Sequence" sortKeyValue="negativeSequence" />
                  <SortableHead label="Total Greens" sortKeyValue="totalGreens" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTeams.map((team) => {
                  const md = getMarketData(team, selectedMarket);
                  if (!md) return null;
                  return (
                    <TableRow key={team.name}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.position}</TableCell>
                      <TableCell className="font-semibold">{md.currentStreak}</TableCell>
                      <TableCell>{md.matchesPlayed}</TableCell>
                      <TableCell className="font-mono text-xs">{formatNegativeSequence(md.negativeSequence)}</TableCell>
                      <TableCell>{md.totalGreens}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </main>
    </div>
  );
};

export default StreaksPage;
