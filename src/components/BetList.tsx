import { Bet, BetResult } from "@/types/bet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface BetListProps {
  bets: Bet[];
  onUpdate: (id: string, updates: Partial<Bet>) => void;
  onDelete: (id: string) => void;
}

const resultStyles: Record<BetResult, string> = {
  win: "text-win bg-win/10 border-win/20",
  loss: "text-loss bg-loss/10 border-loss/20",
  pending: "text-pending bg-pending/10 border-pending/20",
};

export function BetList({ bets, onUpdate, onDelete }: BetListProps) {
  if (bets.length === 0) {
    return (
      <div className="rounded-lg bg-card border border-border p-12 text-center animate-fade-in">
        <p className="text-muted-foreground text-lg">No bets yet. Add your first bet to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bets.map((bet, i) => {
        const pnl = bet.result === "win" ? bet.stake * (bet.odds - 1) : bet.result === "loss" ? -bet.stake : 0;
        return (
          <div
            key={bet.id}
            className="rounded-lg bg-card border border-border p-4 flex flex-col md:flex-row md:items-center gap-3 animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{bet.date}</p>
              {bet.comment && <p className="text-sm text-muted-foreground">{bet.comment}</p>}
            </div>

            <div className="flex items-center gap-4 text-sm font-mono">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Odds</p>
                <p className="text-foreground">{bet.odds.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Stake</p>
                <p className="text-foreground">${bet.stake.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">P&L</p>
                <p className={pnl >= 0 && bet.result !== "pending" ? "text-win" : pnl < 0 ? "text-loss" : "text-muted-foreground"}>
                  {bet.result === "pending" ? "—" : `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={bet.result} onValueChange={(v) => onUpdate(bet.id, { result: v as BetResult })}>
                <SelectTrigger className={`w-32 text-xs border ${resultStyles[bet.result]}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="win">✅ Win</SelectItem>
                  <SelectItem value="loss">❌ Loss</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-loss" onClick={() => onDelete(bet.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
