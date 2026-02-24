import { useMemo } from "react";
import { Bet, BetStatus } from "@/types/bet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface BetListProps {
  bets: Bet[];
  onUpdate: (id: number, updates: Partial<Bet>) => void;
  onDelete: (id: number) => void;
}

const statusStyles: Record<BetStatus, string> = {
  WON: "text-win bg-win/10 border-win/20",
  LOST: "text-loss bg-loss/10 border-loss/20",
  ongoing: "text-ongoing bg-ongoing/10 border-ongoing/20",
};

function BetRow({ bet, onUpdate, onDelete }: { bet: Bet; onUpdate: BetListProps["onUpdate"]; onDelete: BetListProps["onDelete"] }) {
  const pnl = bet.status === "WON" ? bet.stake * (bet.odd - 1) : bet.status === "LOST" ? -bet.stake : 0;

  return (
    <div className="rounded-lg bg-secondary/50 border border-border p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{bet.date}</p>
        {bet.comment && <p className="text-sm text-muted-foreground">{bet.comment}</p>}
      </div>

      <div className="flex items-center gap-4 text-sm font-mono">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Odd</p>
          <p className="text-foreground">{bet.odd.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Stake</p>
          <p className="text-foreground">€{bet.stake.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">P&L</p>
          <p className={pnl >= 0 && bet.status !== "ongoing" ? "text-win" : pnl < 0 ? "text-loss" : "text-muted-foreground"}>
            {bet.status === "ongoing" ? "—" : `${pnl >= 0 ? "+" : ""}€${pnl.toFixed(2)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={bet.status} onValueChange={(v) => onUpdate(bet.id, { status: v as BetStatus })}>
          <SelectTrigger className={`w-32 text-xs border ${statusStyles[bet.status]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="ongoing">⏳ ongoing</SelectItem>
            <SelectItem value="WON">✅ Won</SelectItem>
            <SelectItem value="LOST">❌ Lost</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-loss" onClick={() => onDelete(bet.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function BetList({ bets, onUpdate, onDelete }: BetListProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, Bet[]> = {};
    // Date format is DD/MM/YYYY — parse and sort descending
    const sorted = [...bets].sort((a, b) => {
      const [da, ma, ya] = a.date.split("/");
      const [db, mb, yb] = b.date.split("/");
      return `${yb}-${mb}-${db}`.localeCompare(`${ya}-${ma}-${da}`);
    });

    for (const bet of sorted) {
      const [, month, year] = bet.date.split("/");
      const key = `${year}-${month}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(bet);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, monthBets]) => {
        const [year, month] = key.split("-");
        const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long", year: "numeric" });
        const pnl = monthBets.reduce((sum, b) => {
          if (b.status === "WON") return sum + b.stake * (b.odd - 1);
          if (b.status === "LOST") return sum - b.stake;
          return sum;
        }, 0);
        return { key, label, bets: monthBets, pnl };
      });
  }, [bets]);

  if (bets.length === 0) {
    return (
      <div className="rounded-lg bg-card border border-border p-12 text-center animate-fade-in">
        <p className="text-muted-foreground text-lg">No bets yet. Add your first bet to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map((group) => (
        <Collapsible key={group.key} defaultOpen>
          <CollapsibleTrigger className="w-full rounded-lg bg-card border border-border p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors group">
            <div className="flex items-center gap-3">
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
              <span className="font-semibold text-foreground">{group.label}</span>
              <span className="text-xs text-muted-foreground">({group.bets.length} bets)</span>
            </div>
            <span className={`font-mono font-bold text-sm ${group.pnl >= 0 ? "text-win" : "text-loss"}`}>
              {group.pnl >= 0 ? "+" : ""}€{group.pnl.toFixed(2)}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 pt-2 space-y-2">
            {group.bets.map((bet) => (
              <BetRow key={bet.id} bet={bet} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
