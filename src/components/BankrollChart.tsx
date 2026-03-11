import { useMemo } from "react";
import { Bet } from "@/types/bet";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankrollChartProps {
  bets: Bet[];
  initialBank?: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

// Parse DD/MM/YYYY to sortable YYYY-MM-DD
function parseDateToISO(dateStr: string): string {
  const [d, m, y] = dateStr.split("/");
  return `${y}-${m}-${d}`;
}

export function BankrollChart({ bets, initialBank = 0, selectedMonth, onMonthChange }: BankrollChartProps) {

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    bets.filter((b) => b.status !== "ONGOING").forEach((b) => {
      const iso = parseDateToISO(b.date);
      months.add(iso.slice(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [bets]);

  const data = useMemo(() => {
    const settled = bets
      .filter((b) => b.status !== "ONGOING")
      .sort((a, b) => parseDateToISO(a.date).localeCompare(parseDateToISO(b.date)));

    if (settled.length === 0) return [];

    if (selectedMonth === "all") {
      let bank = initialBank;
      const points: { date: string; bank: number }[] = [{ date: "Start", bank }];
      for (const bet of settled) {
        if (bet.status === "WON") bank += bet.stake * (bet.odd - 1);
        else bank -= bet.stake;
        points.push({ date: bet.date, bank: parseFloat(bank.toFixed(2)) });
      }
      return points;
    }

    let bankAtMonthStart = initialBank;
    for (const bet of settled) {
      const iso = parseDateToISO(bet.date);
      if (iso.slice(0, 7) >= selectedMonth) break;
      if (bet.status === "WON") bankAtMonthStart += bet.stake * (bet.odd - 1);
      else bankAtMonthStart -= bet.stake;
    }

    const monthBets = settled.filter((b) => parseDateToISO(b.date).slice(0, 7) === selectedMonth);
    if (monthBets.length === 0) return [];

    let bank = bankAtMonthStart;
    const points: { date: string; bank: number }[] = [{ date: "Start", bank: parseFloat(bank.toFixed(2)) }];
    for (const bet of monthBets) {
      if (bet.status === "WON") bank += bet.stake * (bet.odd - 1);
      else bank -= bet.stake;
      points.push({ date: bet.date, bank: parseFloat(bank.toFixed(2)) });
    }
    return points;
  }, [bets, initialBank, selectedMonth]);

  if (data.length < 2) {
    return (
      <div className="rounded-lg bg-card border border-border p-8 text-center">
        <p className="text-muted-foreground text-sm">Add at least 2 settled bets to see your bankroll chart.</p>
      </div>
    );
  }

  const minBank = Math.min(...data.map((d) => d.bank));
  const maxBank = Math.max(...data.map((d) => d.bank));
  const isPositive = data[data.length - 1].bank >= 0;

  return (
    <div className="rounded-lg bg-card border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Bankroll Evolution</h3>
        {availableMonths.length > 1 && (
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="bankGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "hsl(152, 60%, 48%)" : "hsl(0, 72%, 51%)"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isPositive ? "hsl(152, 60%, 48%)" : "hsl(0, 72%, 51%)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} tickLine={false} axisLine={false} domain={[Math.floor(minBank - 10), Math.ceil(maxBank + 10)]} tickFormatter={(v) => `€${v}`} />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 14%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 92%)",
                fontSize: 13,
              }}
              formatter={(value: number) => [`€${value.toFixed(2)}`, "Bank"]}
            />
            <Area
              type="monotone"
              dataKey="bank"
              stroke={isPositive ? "hsl(152, 60%, 48%)" : "hsl(0, 72%, 51%)"}
              strokeWidth={2}
              fill="url(#bankGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
