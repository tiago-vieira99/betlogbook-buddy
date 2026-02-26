import { Bankroll } from "@/types/bet";

interface BankrollStatsProps {
  bankroll: Bankroll;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2">
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-sm font-semibold font-mono text-foreground">{value}</span>
    </div>
  );
}

export function BankrollStats({ bankroll }: BankrollStatsProps) {
  return (
    <div className="rounded-lg bg-card border border-border px-4 py-3 animate-fade-in">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Bankroll Details</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
        <Stat label="Avg Odd" value={bankroll.oddAvg?.toFixed(2) ?? "—"} />
        <Stat label="Avg Stake" value={bankroll.stakeAvg ? `€${bankroll.stakeAvg.toFixed(2)}` : "—"} />
        <Stat label="🟢 Rate" value={bankroll.greensRate ? `${bankroll.greensRate.toFixed(1)}%` : "—"} />
        <Stat label="🔴 Rate" value={bankroll.redsRate ? `${bankroll.redsRate.toFixed(1)}%` : "—"} />
        <Stat label="🟢 Streak" value={bankroll.longestGreenSeries ?? "—"} />
        <Stat label="🔴 Streak" value={bankroll.longestRedSeries ?? "—"} />
        <Stat label="Best Profit" value={bankroll.biggestProfit ? `€${bankroll.biggestProfit.toFixed(2)}` : "—"} />
        <Stat label="Worst Loss" value={bankroll.biggestExpense ? `€${bankroll.biggestExpense.toFixed(2)}` : "—"} />
        <Stat label="Max Odd" value={bankroll.biggestOdd?.toFixed(2) ?? "—"} />
        <Stat label="Max Stake" value={bankroll.biggestStake ? `€${bankroll.biggestStake.toFixed(2)}` : "—"} />
        <Stat label="Best Green Odd" value={bankroll.biggestGreenOdd?.toFixed(2) ?? "—"} />
      </div>
    </div>
  );
}
