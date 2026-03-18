import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { fetchMatches, getSeasonForTeam } from "@/services/teamApi";
import { Match } from "@/types/team";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function parseDate(d: string): number {
  const [day, month, year] = d.split("/").map(Number);
  if ([day, month, year].some((part) => Number.isNaN(part))) return 0;
  return new Date(year, month - 1, day).getTime();
}

function isCurrentTeam(matchTeamName: string, teamName: string): boolean {
  return matchTeamName.trim().toLowerCase() === teamName.trim().toLowerCase();
}

function getResultBg(ftResult: string, homeTeam: string, awayTeam: string, teamName: string): string {
  const parts = ftResult.split(/[-:]/).map((s) => parseInt(s.trim(), 10));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return "";

  const [homeGoals, awayGoals] = parts;
  const isHome = isCurrentTeam(homeTeam, teamName);
  const isAway = isCurrentTeam(awayTeam, teamName);

  if (!isHome && !isAway) return "";
  if (homeGoals === awayGoals) return "bg-ongoing/25";

  const teamWon = (isHome && homeGoals > awayGoals) || (isAway && awayGoals > homeGoals);
  return teamWon ? "bg-win/25" : "bg-loss/25";
}

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams();
  const { teamName, beginSeason } = (location.state as { teamName: string; beginSeason: string }) || {};

  useEffect(() => {
    if (!teamName || !beginSeason) {
      toast.error("Missing team info");
      navigate("/teams");
      return;
    }
    const season = getSeasonForTeam(beginSeason);
    fetchMatches(teamName, season)
      .then((data) =>
        setMatches(data.sort((a, b) => parseDate(a.matchDate) - parseDate(b.matchDate)))
      )
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load matches");
      })
      .finally(() => setLoading(false));
  }, [teamName, beginSeason, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/teams")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              {teamName ?? "Matches"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Season {beginSeason ? getSeasonForTeam(beginSeason) : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No matches found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Home Team</TableHead>
                <TableHead>Away Team</TableHead>
                <TableHead>HT Result</TableHead>
                <TableHead>FT Result</TableHead>
                <TableHead>Competition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>{m.matchDate}</TableCell>
                  <TableCell>{m.homeTeam}</TableCell>
                  <TableCell>{m.awayTeam}</TableCell>
                  <TableCell>{m.htResult}</TableCell>
                  <TableCell className={`font-semibold ${getResultBg(m.ftResult, m.homeTeam, m.awayTeam, teamName)}`}>
                    {m.ftResult}
                  </TableCell>
                  <TableCell>{m.competition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
};

export default MatchesPage;
