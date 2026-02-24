import { TrendingUp, TrendingDown, Target, Clock, DollarSign, BarChart3 } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    wins: number;
    losses: number;
    ongoing: number;
    totalStaked: number;
    totalPnl: number;
    winRate: number;
  };
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

export function StatsCards({ stats }: StatsCardsProps) {
  const pnlColor = stats.totalPnl >= 0 ? "text-win" : "text-loss";
  const pnlIcon = stats.totalPnl >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCard label="Total Bets" value={stats.total} icon={BarChart3} />
      <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={Target} accent="text-win" />
      <StatCard label="P&L" value={`${stats.totalPnl >= 0 ? "+" : ""}€${stats.totalPnl.toFixed(2)}`} icon={pnlIcon} accent={pnlColor} />
      <StatCard label="Total Staked" value={`€${stats.totalStaked.toFixed(2)}`} icon={DollarSign} />
      <StatCard label="Wins" value={stats.wins} icon={TrendingUp} accent="text-win" />
      <StatCard label="Ongoing" value={stats.ongoing} icon={Clock} accent="text-ongoing" />
    </div>
  );
}
