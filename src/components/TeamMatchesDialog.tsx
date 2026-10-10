import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Loader2, ArrowUpDown } from "lucide-react";
import { fetchMatches, getSeasonForTeam } from "@/services/teamApi";
import { Match, Team } from "@/types/team";

function parseDate(d: string): number {
  const [day, month, year] = d.split("/").map(Number);
  if ([day, month, year].some((p) => Number.isNaN(p))) return 0;
  return new Date(year, month - 1, day).getTime();
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function resultBg(m: Match, teamName: string): string {
  const parts = m.ftResult.split(/[-:]/).map((s) => parseInt(s.trim(), 10));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return "";
  const [h, a] = parts;
  const isHome = same(m.homeTeam, teamName);
  const isAway = same(m.awayTeam, teamName);
  if (!isHome && !isAway) return "";
  if (h === a) return "bg-ongoing/25";
  return (isHome && h > a) || (isAway && a > h) ? "bg-win/25" : "bg-loss/25";
}

interface Props {
  team: Team | null;
  onOpenChange: (open: boolean) => void;
}

export function TeamMatchesDialog({ team, onOpenChange }: Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!team) return;
    setLoading(true);
    setError(false);
    setMatches([]);
    fetchMatches(team.name, getSeasonForTeam(team.beginSeason))
      .then(setMatches)
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [team]);

  const sorted = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const cmp = parseDate(a.matchDate) - parseDate(b.matchDate);
        return sortDir === "asc" ? cmp : -cmp;
      }),
    [matches, sortDir]
  );

  return (
    <Dialog open={!!team} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{team?.name}</DialogTitle>
          <DialogDescription>Season {team ? getSeasonForTeam(team.beginSeason) : ""}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-center text-loss py-12">Failed to load matches.</p>
        ) : matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No matches found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none hover:text-foreground"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                >
                  <span className="inline-flex items-center gap-1">
                    Date <ArrowUpDown className="w-3 h-3 text-primary" />
                  </span>
                </TableHead>
                <TableHead>Home Team</TableHead>
                <TableHead>Away Team</TableHead>
                <TableHead>HT</TableHead>
                <TableHead>FT</TableHead>
                <TableHead>Competition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>{m.matchDate}</TableCell>
                  <TableCell className={team && same(m.homeTeam, team.name) ? "font-bold text-foreground" : undefined}>{m.homeTeam}</TableCell>
                  <TableCell className={team && same(m.awayTeam, team.name) ? "font-bold text-foreground" : undefined}>{m.awayTeam}</TableCell>
                  <TableCell>{m.htResult}</TableCell>
                  <TableCell className={`font-semibold ${team ? resultBg(m, team.name) : ""}`}>{m.ftResult}</TableCell>
                  <TableCell>{m.competition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
