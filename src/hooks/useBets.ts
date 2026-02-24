import { useState, useEffect, useCallback } from "react";
import { Bet } from "@/types/bet";
import { fetchBets, createBet, updateBetApi, deleteBetApi } from "@/services/api";
import { toast } from "sonner";

export function useBets(bankrollId: number) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBets = useCallback(async () => {
    if (!bankrollId) return;
    try {
      setLoading(true);
      const data = await fetchBets(bankrollId);
      setBets(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bets");
    } finally {
      setLoading(false);
    }
  }, [bankrollId]);

  useEffect(() => {
    loadBets();
  }, [loadBets]);

  const addBet = async (bet: Omit<Bet, "id">) => {
    try {
      const created = await createBet(bankrollId, bet);
      setBets((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add bet");
    }
  };

  const updateBet = async (id: number, updates: Partial<Bet>) => {
    try {
      const updated = await updateBetApi(bankrollId, id, updates);
      setBets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bet");
    }
  };

  const deleteBet = async (id: number) => {
    try {
      await deleteBetApi(bankrollId, id);
      setBets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete bet");
    }
  };

  const stats = {
    total: bets.length,
    wins: bets.filter((b) => b.status === "WON").length,
    losses: bets.filter((b) => b.status === "LOST").length,
    pending: bets.filter((b) => b.status === "PENDING").length,
    totalStaked: bets.reduce((sum, b) => sum + b.stake, 0),
    totalPnl: bets.reduce((sum, b) => {
      if (b.status === "WON") return sum + b.stake * (b.odd - 1);
      if (b.status === "LOST") return sum - b.stake;
      return sum;
    }, 0),
    winRate: bets.filter((b) => b.status !== "PENDING").length > 0
      ? (bets.filter((b) => b.status === "WON").length / bets.filter((b) => b.status !== "PENDING").length) * 100
      : 0,
  };

  return { bets, addBet, updateBet, deleteBet, stats, loading };
}
