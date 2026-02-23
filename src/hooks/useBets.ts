import { useState, useEffect } from "react";
import { Bet } from "@/types/bet";

const STORAGE_KEY = "bettracker_bets";

export function useBets() {
  const [bets, setBets] = useState<Bet[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
  }, [bets]);

  const addBet = (bet: Omit<Bet, "id">) => {
    setBets((prev) => [{ ...bet, id: crypto.randomUUID() }, ...prev]);
  };

  const updateBet = (id: string, updates: Partial<Bet>) => {
    setBets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBet = (id: string) => {
    setBets((prev) => prev.filter((b) => b.id !== id));
  };

  const stats = {
    total: bets.length,
    wins: bets.filter((b) => b.result === "win").length,
    losses: bets.filter((b) => b.result === "loss").length,
    pending: bets.filter((b) => b.result === "pending").length,
    totalStaked: bets.reduce((sum, b) => sum + b.stake, 0),
    totalPnl: bets.reduce((sum, b) => {
      if (b.result === "win") return sum + b.stake * (b.odds - 1);
      if (b.result === "loss") return sum - b.stake;
      return sum;
    }, 0),
    winRate: bets.filter((b) => b.result !== "pending").length > 0
      ? (bets.filter((b) => b.result === "win").length / bets.filter((b) => b.result !== "pending").length) * 100
      : 0,
  };

  return { bets, addBet, updateBet, deleteBet, stats };
}
