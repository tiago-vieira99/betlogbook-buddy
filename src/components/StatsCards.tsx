import { TrendingUp, TrendingDown, Target, Clock, DollarSign, BarChart3 } from "lucide-react";
import { Bankroll } from "@/types/bet";

interface StatsCardsProps {
  bankroll: Bankroll;
  ongoing: number;
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent?: string }) {
  return (
    <div className="rounded-lg bg-card p-5 border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${accent || "text-muted-foreground"}`} />
      </div>
      <p className={`text-2xl font-bold font-mono ${accent || "text-foreground"}`}>{value}</p>
    </div>
  );
}

export function StatsCards({ bankroll, ongoing }: StatsCardsProps) {
  const pnl = bankroll.balance - bankroll.initialValue;
  const pnlColor = pnl >= 0 ? "text-win" : "text-loss";
  const pnlIcon = pnl >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCard label="Total Bets" value={bankroll.numBets} icon={BarChart3} />
      <StatCard label="Win Rate" value={`${bankroll.greensRate?.toFixed(1) ?? "0.0"}%`} icon={Target} accent="text-win" />
      <StatCard label="P&L" value={`${pnl >= 0 ? "+" : ""}€${pnl.toFixed(2)}`} icon={pnlIcon} accent={pnlColor} />
      <StatCard label="ROI" value={`${bankroll.roi?.toFixed(1) ?? "0.0"}%`} icon={DollarSign} accent={bankroll.roi >= 0 ? "text-win" : "text-loss"} />
      <StatCard label="Wins" value={Math.round((bankroll.greensRate / 100) * bankroll.numBets)} icon={TrendingUp} accent="text-win" />
      <StatCard label="Ongoing" value={ongoing} icon={Clock} accent="text-ongoing" />
    </div>
  );
}