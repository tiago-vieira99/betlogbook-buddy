import { useBets } from "@/hooks/useBets";
import { StatsCards } from "@/components/StatsCards";
import { AddBetForm } from "@/components/AddBetForm";
import { BetList } from "@/components/BetList";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const { bets, addBet, updateBet, deleteBet, stats } = useBets();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">BetTracker</h1>
            <p className="text-xs text-muted-foreground">Track your bets, maximize your edge</p>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StatsCards stats={stats} />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Bets</h2>
          <AddBetForm onAdd={addBet} />
        </div>

        <BetList bets={bets} onUpdate={updateBet} onDelete={deleteBet} />
      </main>
    </div>
  );
};

export default Index;
