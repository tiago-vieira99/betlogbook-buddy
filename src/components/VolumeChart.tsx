import { useMemo } from "react";
import { Bet } from "@/types/bet";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

interface VolumeChartProps {
  bets: Bet[];
}

// Parse DD/MM/YYYY to sortable YYYY-MM-DD
function parseDateToISO(dateStr: string): string {
  const [d, m, y] = dateStr.split("/");
  return `${y}-${m}-${d}`;
}

export function VolumeChart({ bets }: VolumeChartProps) {
  const data = useMemo(() => {
    const byMonth = new Map<string, number>();
    bets.forEach((b) => {
      const month = parseDateToISO(b.date).slice(0, 7);
      byMonth.set(month, (byMonth.get(month) || 0) + 1);
    });

    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, volume]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        volume,
      }));
  }, [bets]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg bg-card border border-border p-8 text-center">
        <p className="text-muted-foreground text-sm">Add at least 1 bet to see your monthly volume chart.</p>
      </div>
    );
  }

  const maxVolume = Math.max(...data.map((d) => d.volume));

  return (
    <div className="rounded-lg bg-card border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Monthly Bet Volume</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.ceil(maxVolume * 1.1)]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(220, 14%, 18%)", opacity: 0.4 }}
              contentStyle={{
                background: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 14%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 92%)",
                fontSize: 13,
              }}
              formatter={(value: number) => [value, "Bets"]}
              labelFormatter={(_, payload) => {
                const month = payload?.[0]?.payload?.month;
                return month
                  ? new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "";
              }}
            />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((d) => (
                <Cell key={d.month} fill="hsl(152, 60%, 48%)" fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
