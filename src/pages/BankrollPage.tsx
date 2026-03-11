import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBets } from "@/hooks/useBets";
import { useBankrolls } from "@/hooks/useBankrolls";
import { StatsCards } from "@/components/StatsCards";
import { AddBetForm } from "@/components/AddBetForm";
import { BetList } from "@/components/BetList";
import { BankrollChart } from "@/components/BankrollChart";
import { BankrollStats } from "@/components/BankrollStats";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeStatsFromBets } from "@/utils/computeStats";

const BankrollPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bankrollId = parseInt(id || "0", 10);
  const { getBankroll, refreshBankroll } = useBankrolls();
  const bankroll = getBankroll(bankrollId);
  const { bets, addBet, updateBet, deleteBet } = useBets(bankrollId);
  const [selectedMonth, setSelectedMonth] = useState("all");

  const handleAddBet = async (bet: Parameters<typeof addBet>[0]) => {
    await addBet(bet);
    await refreshBankroll(bankrollId);
  };

  const handleUpdateBet = async (id: number, updates: Parameters<typeof updateBet>[1]) => {
    await updateBet(id, updates);
    await refreshBankroll(bankrollId);
  };

  const handleDeleteBet = async (id: number) => {
    await deleteBet(id);
    await refreshBankroll(bankrollId);
  };

  if (!bankroll) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">Bankroll not found.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const currentBank = bankroll.initialValue + bankroll.balance;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img src="/favicon.ico" alt="BetLogger" className="w-9 h-9 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground tracking-tight truncate">{bankroll.name}</h1>
            <p className="text-xs text-muted-foreground">
              Started with €{bankroll.initialValue.toFixed(2)} • Current: <span className={currentBank >= bankroll.initialValue ? "text-win" : "text-loss"}>€{currentBank.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StatsCards bankroll={bankroll} ongoing={bets.filter(b => b.status === "ONGOING").length} />
        <BankrollStats bankroll={bankroll} />
        <BankrollChart bets={bets} initialBank={bankroll.initialValue} />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Bets</h2>
        </div>
        <AddBetForm onAdd={handleAddBet} />

        <BetList bets={bets} onUpdate={handleUpdateBet} onDelete={handleDeleteBet} />
      </main>
    </div>
  );
};

export default BankrollPage;
